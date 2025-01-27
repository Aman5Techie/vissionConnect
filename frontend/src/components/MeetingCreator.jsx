import { useState, useEffect } from "react";
import showToast from "../utils/toast";
import { mapUserToMeeting } from "../utils/contractUtils";

// Temporary user data
const TEMP_USERS = [
  {
    name: "Alice",
    publicKey: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    selected: false,
  },
  {
    name: "Bob",
    publicKey: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
    selected: false,
  },
  {
    name: "aman",
    publicKey: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    selected: false,
  },
  {
    name: "Acoount 1",
    publicKey: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    selected: false,
  },
  {
    name: "Account 2",
    publicKey: "0x1A06e23352042ec262c19786886F021bb073d6E1",
    selected: false,
  },
  {
    name: "Account 3",
    publicKey: "0x92806F9833eC9CfA60A5Ce1f1aed9509e65Fa137",
    selected: false,
  },
  {
    name: "Aman main account",
    publicKey: "0xf0a2c73fF901e8dC96B6f990F7FE90054ED3F63f",
    selected: false,
  },
];

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
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = TEMP_USERS.filter((user) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTerm) ||
      user.publicKey.toLowerCase().includes(searchTerm)
    );
  });

  const createMeeting = async () => {
    const newMeetingId = generateMeetingId();

    try {
      // First map the creator (account) to the new meeting

      // Then update the local state with the new meeting
      setMeetings([
        ...meetings,
        {
          id: newMeetingId,
          participants: [account], // Include the creator as the first participant
        },
      ]);

      showToast(`Meeting created with ID: ${newMeetingId}`, 'success');

      await mapUserToMeeting(newMeetingId, account);
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
      // Process each selected user
      for (const userAddress of selectedUsers) {
        await mapUserToMeeting(currentMeetingId, userAddress);
      }

      // Update local state
      setMeetings(
        meetings.map((meeting) => {
          if (meeting.id === currentMeetingId) {
            return {
              ...meeting,
              participants: [...meeting.participants, ...selectedUsers],
            };
          }
          return meeting;
        })
      );

      showToast("Users added successfully!", 'success');
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding users:", error);
      showToast("Failed to add users to the meeting", 'error');
    } finally {
      setLoading(false);
    }
  };
  console.log("hghfg");
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
                  <button
                    onClick={() => openAddUserModal(meeting.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Add Users
                  </button>
                </div>

                {/* Participants List */}
                <div className="mt-2 text-sm">
                  <div className="font-medium text-gray-700 mb-1">
                    Participants:
                  </div>
                  <div className="space-y-1">
                    {meeting.participants.map((participantAddress) => {
                      const user = TEMP_USERS.find(
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
                            {participantAddress === account && " (Creator)"}
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
                  filteredUsers.map((user) => (
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
                  ))
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
