// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract VerifySignature {
    // Mapping to store the relationship between a string and a public key
    mapping(string => address) private stringToPublicKey;

    function getMessageHash(
        string memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );
    }

    function mapStringToPublicKey(string memory _message, address _publicKey) public {
        require(_publicKey != address(0), "Invalid public key address");
        stringToPublicKey[_message] = _publicKey;
    }

    function verify(
        string memory _message,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        // Recover the signer from the signature
        address recoveredSigner = recoverSigner(ethSignedMessageHash, signature);

        // Check if the public key is mapped to the message
        address mappedPublicKey = stringToPublicKey[_message];
        return mappedPublicKey == recoveredSigner;
    }

    function recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function splitSignature(bytes memory sig)
        public
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}