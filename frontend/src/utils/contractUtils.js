import { ethers } from "ethers";
import ContractJson from "../artifacts/contracts/VerifySignature.sol/VerifySignature.json";


const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;;
const OWNER_PRIVATE_KEY = import.meta.env.VITE_OWNER_PRIVATE_KEY; // Replace with your private key
const RPC_URL = import.meta.env.VITE_RPC_URL;


  
const CONTRACT_ABI = ContractJson.abi;

export const mapUserToMeeting = async (meetingId, userAddress) => {
  try {
    // Connect to local network
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Create wallet instance using owner's private key
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);

    // Get contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    );

    // Call the mapping function
    const tx = await contract.mapStringToPublicKey(meetingId, userAddress);
    await tx.wait();

    return true;
  } catch (error) {
    console.error("Error mapping user to meeting:", error);
    throw error;
  }
};

export const getMessageHash = async (message) => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    );

    // Call the getMessageHash function
    const messageHash = await contract.getMessageHash(message);
    console.log("Message Hash:", messageHash);

    // Get the Ethereum signed message hash
    // const ethSignedMessageHash = await contract.getEthSignedMessageHash(
    //   messageHash
    // );
    // console.log("Eth Signed Message Hash:", ethSignedMessageHash);

    return messageHash;
      
    
  } catch (error) {
    console.error("Error getting message hash:", error);
    throw error;
  }
};

// Add verify signature function
export const verifySignature = async (message, signature) => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    );

    // Call the verify function
    const isValid = await contract.verify(message, signature);
    console.log("Signature Verification Result:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error verifying signature:", error);
    throw error;
  }
};

// Add recover signer function
export const recoverSigner = async (ethSignedMessageHash, signature) => {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      wallet
    );

    // Call the recoverSigner function
    const recoveredAddress = await contract.recoverSigner(
      ethSignedMessageHash,
      signature
    );
    console.log("Recovered Signer Address:", recoveredAddress);

    return recoveredAddress;
  } catch (error) {
    console.error("Error recovering signer:", error);
    throw error;
  }
};

