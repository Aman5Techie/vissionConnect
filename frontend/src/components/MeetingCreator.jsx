import { useState, useEffect } from "react";
import showToast from "../utils/toast";
import { createClient } from "@supabase/supabase-js";
import { mapUserToMeeting } from "../utils/contractUtils";


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const generateMeetingId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const segments = 3;
  const segmentLength = 4;

  const generateSegment = () => {
    return Array.from(
      { length: segmentLength },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  return Array.from({ length: segments }, generateSegment).join("-");
};

const MeetingCreator = ({ account }) => {
  const [meetings, setMeetings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentMeetingId, setCurrentMeetingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);

  // Fetch all users from database on component mount
  useEffect(() => {
    fetchUsers();
    fetchUserMeetings();
  }, [account]);

  // Fetch all users from the database
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, public_key')
        .order('username', { ascending: true });
      
      if (error) throw error;
      
      // Format the users data to match our component's needs
      setUsers(data.map(user => ({
        name: user.username,
        publicKey: user.public_key,
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users', 'error');
    }
  };

  // Fetch meetings where the current user is a participant
  const fetchUserMeetings = async () => {
    try {
      // Step 1: Get all meeting IDs where the current user is a participant
      const { data: participantData, error: participantError } = await supabase
        .from('meeting_participants')
        .select('meeting_id')
        .eq('user_public_key', account);
      
      if (participantError) throw participantError;
      
      if (!participantData || participantData.length === 0) {
        setMeetings([]);
        return;
      }
      
      const meetingIds = participantData.map(item => item.meeting_id);
      
      // Step 2: Get details for each meeting
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('meetings')
        .select('id, created_by, created_at')
        .in('id', meetingIds);
      
      if (meetingsError) throw meetingsError;
      
      // Step 3: For each meeting, get all participants
      const meetingsWithParticipants = await Promise.all(meetingsData.map(async (meeting) => {
        const { data: participants, error: participantsError } = await supabase
          .from('meeting_participants')
          .select('user_public_key')
          .eq('meeting_id', meeting.id);
        
        if (participantsError) throw participantsError;
        
        return {
          id: meeting.id,
          createdBy: meeting.created_by,
          createdAt: meeting.created_at,
          participants: participants.map(p => p.user_public_key)
        };
      }));
      
      setMeetings(meetingsWithParticipants);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      showToast('Failed to load your meetings', 'error');
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.publicKey.toLowerCase().includes(searchTerm)
    );
  });

  const createMeeting = async () => {
    const newMeetingId = generateMeetingId();

    try {
      // Insert the new meeting into the database
      const { error: meetingError } = await supabase
        .from('meetings')
        .insert({
          id: newMeetingId,
          created_by: account
        });
      
      if (meetingError) throw meetingError;

      // Add the creator as a participant
      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: newMeetingId,
          user_public_key: account
        });

      if (participantError) throw participantError;

      // Refresh the meetings list
      await fetchUserMeetings();
      
      showToast(`Meeting created with ID: ${newMeetingId}`, 'success');
      await mapUserToMeeting(newMeetingId, [account]);
    } catch (error) {
      console.error("Error creating meeting:", error);
      showToast("Failed to create meeting. Please try again.", 'error');
    }
  };

  const openAddUserModal = (meetingId) => {
    setCurrentMeetingId(meetingId);
    setSelectedUsers([]);
    setSearchQuery("");
    setIsModalOpen(true);
  };

  const handleUserSelection = (publicKey) => {
    if (selectedUsers.includes(publicKey)) {
      setSelectedUsers(selectedUsers.filter((key) => key !== publicKey));
    } else {
      setSelectedUsers([...selectedUsers, publicKey]);
    }
  };

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) {
      showToast("Please select at least one user", 'error');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for inserting multiple participants
      const participantsToAdd = selectedUsers.map(publicKey => ({
        meeting_id: currentMeetingId,
        user_public_key: publicKey
      }));
      
      // Insert all the new participants
      const { error } = await supabase
        .from('meeting_participants')
        .insert(participantsToAdd);
      
      if (error) throw error;

      
      await mapUserToMeeting(currentMeetingId, selectedUsers);
      // Refresh the meetings list to reflect changes
      await fetchUserMeetings();
      
      showToast("Users added successfully!", 'success');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding users:", error);
      showToast("Failed to add users to the meeting", 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (meetingId) => {
    try {
      setDeletingMeetingId(meetingId);
      
      // Delete the meeting (cascade will also delete participants)
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) throw error;
      
      // Update local state to remove the deleted meeting
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
      showToast("Meeting deleted successfully", 'success');
    } catch (error) {
      console.error("Error deleting meeting:", error);
      showToast("Failed to delete meeting", 'error');
    } finally {
      setDeletingMeetingId(null);
    }
  };

  return (
    <div>
      {/* Header Information */}
      <div className="flex">
        {/* Left side - Create Meeting Button */}
        <div className="w-1/3 pr-4">
          <button
            onClick={createMeeting}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Create New Meeting
          </button>
        </div>

        {/* Right side - Meeting List */}
        <div className="w-2/3 pl-4">
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col p-4 bg-gray-50 rounded-lg shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium mr-2">Meeting ID:</span>
                    <span className="font-mono">{meeting.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {meeting.createdBy === account && (<button
                      onClick={() => openAddUserModal(meeting.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Add Users
                    </button>)}
                    
                    {/* Only show delete button for meeting creator */}
                    {meeting.createdBy === account && (
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        disabled={deletingMeetingId === meeting.id}
                        className={`w-8 h-8 flex items-center justify-center rounded-full 
                          ${deletingMeetingId === meeting.id 
                            ? 'bg-gray-300' 
                            : 'bg-red-500 hover:bg-red-600'} 
                          text-white transition-colors`}
                        title="Delete Meeting"
                      >
                        {deletingMeetingId === meeting.id ? (
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Participants List */}
                <div className="mt-2 text-sm">
                  <div className="font-medium text-gray-700 mb-1">
                    Participants:
                  </div>
                  <div className="space-y-1">
                    {meeting.participants.map((participantAddress) => {
                      const user = users.find(
                        (u) =>
                          u.publicKey.toLowerCase() ===
                          participantAddress.toLowerCase()
                      );
                      return (
                        <div
                          key={participantAddress}
                          className="flex items-center text-gray-600"
                        >
                          <span className="font-medium mr-2">
                            {user ? user.name : "Unknown User"}
                            {participantAddress === meeting.createdBy && " (Creator)"}
                          </span>
                          <span className="text-xs font-mono text-gray-400 truncate">
                            {participantAddress}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No meetings created yet. Click the button to create your first
                meeting.
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Add Users to Meeting</h3>

              {/* Search Bar */}
              <div className="mb-4 relative">
                <input
                  type="text"
                  placeholder="Search by name or public key..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>

              {/* Users List */}
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    // Don't show users that are already participants in this meeting
                    const meeting = meetings.find(m => m.id === currentMeetingId);
                    const isAlreadyParticipant = meeting && meeting.participants.some(
                      p => p.toLowerCase() === user.publicKey.toLowerCase()
                    );
                    
                    if (isAlreadyParticipant) return null;
                    
                    return (
                      <label
                        key={user.publicKey}
                        className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.publicKey)}
                          onChange={() => handleUserSelection(user.publicKey)}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500 font-mono">
                            {user.publicKey}
                          </div>
                        </div>
                      </label>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUsers}
                  disabled={loading || selectedUsers.length === 0}
                  className={`px-4 py-2 rounded text-white ${
                    loading || selectedUsers.length === 0
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading
                    ? "Adding..."
                    : `Add Selected Users (${selectedUsers.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCreator;