// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract VerifySignature {
    address private owner;
    
    // Mapping to store the access control list
    mapping(bytes32 => bool) private accessControlList;

    constructor() {
        owner = msg.sender;
    }

    // Function to map participants to a meeting
    function mapParticipantsToMeeting(
        string memory meetingId,
        address creator,
        address[] memory selectedParticipants
    ) public {
        require(msg.sender == owner, "Only owner can map participants");
        require(msg.sender == creator, "Only creator can map participants");

        for (uint256 i = 0; i < selectedParticipants.length; i++) {
            bytes32 uniqueKey = keccak256(
                abi.encodePacked(meetingId, selectedParticipants[i])
            );
            accessControlList[uniqueKey] = true;
        }
    }

    // Function to verify user access
    function verifyUserAccess(
        string memory meetingId,
        bytes memory signature
    ) public view returns (bool) {
        // Recover signer address from signature
        bytes32 messageHash = getMessageHash(meetingId);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredAddress = recoverSigner(ethSignedMessageHash, signature);

        // Generate unique key
        bytes32 uniqueKey = keccak256(abi.encodePacked(meetingId, recoveredAddress));
        
        // Check if user has access
        return accessControlList[uniqueKey];
    }

    function getMessageHash(string memory _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
