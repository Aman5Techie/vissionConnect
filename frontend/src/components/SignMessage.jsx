import React, { useState } from 'react';
import { ethers } from 'ethers';
import showToast from '../utils/toast';
import { getMessageHash, verifySignature } from '../utils/contractUtils';

const SignMessage = ({ account,setCurrentMeetingId }) => {
  const [meetingId, setMeetingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinStatus, setJoinStatus] = useState(false);

  const signMessage = async () => {
    if (!meetingId) {
      showToast("Please enter a meeting ID.", 'error');
      return;
    }

    setLoading(true);
    try {
      // Get message hash from contract
      const hash = await getMessageHash(meetingId);
      // setMessageHash(hash);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Setup provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      console.log("User's Public Address: ", userAddress);
      console.log("Message Hash to Sign:", hash);

      // Use personal_sign method
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [userAddress, hash]
      });

      console.log("Generated Signature:", signature);

      // Split signature
      // const signatureComponents = ethers.Signature.from(signature);
      
      // setSignature(signature);
      // setSignatureDetails({
      //   r: signatureComponents.r,
      //   s: signatureComponents.s,
      //   v: signatureComponents.v
      // });

      // Verify signature
      const isValid = await verifySignature(meetingId, signature);
      
      if (isValid) {
        setJoinStatus(true);  
        setCurrentMeetingId(meetingId);
        showToast("Successfully joined the meeting!", 'success');
      } else {
        showToast("Failed to verify signature", 'error');
      }

    } catch (error) {
      console.error("Error signing message:", error);
      showToast(error.message || "Error joining meeting. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Join Meeting</h2>
      
      {!joinStatus ? (
        <>
          <div className="mb-4">
            <label htmlFor="meetingId" className="block text-sm font-medium text-gray-700">
              Meeting ID
            </label>
            <input
              type="text"
              id="meetingId"
              placeholder="Enter meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>

          <button
            onClick={signMessage}
            disabled={loading || !meetingId}
            className={`w-full ${
              loading || !meetingId
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white font-bold py-2 px-4 rounded-lg transition duration-200`}
          >
            {loading ? 'Joining...' : 'Join Meeting'}
          </button>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-4 p-4 bg-green-100 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Successfully Joined!</h3>
            <p className="text-green-600">Meeting ID: {meetingId}</p>
          </div>
          <button
            onClick={() => {
              setJoinStatus(false);
              setMeetingId('');
              // setSignature('');
              // setSignatureDetails(null);
              // setMessageHash('');
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            Join Another Meeting
          </button>
        </div>
      )}
      
      
    </div>
  );
};

export default SignMessage;