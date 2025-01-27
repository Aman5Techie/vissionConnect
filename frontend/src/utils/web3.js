export const POLYGON_CHAIN_ID = '0x89'; // Polygon Mainnet
export const POLYGON_RPC_URL = 'https://polygon-rpc.com';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    // Switch to Polygon network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_CHAIN_ID }],
      });
    } catch (switchError) {
      // If the network is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: POLYGON_CHAIN_ID,
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
            },
            rpcUrls: [POLYGON_RPC_URL],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
        });
      } else {
        throw switchError;
      }
    }

    return accounts[0];
  } catch (error) {
    throw new Error(error.message || 'Failed to connect wallet');
  }
};

export const handleAccountsChanged = (accounts) => {
  if (accounts.length === 0) {
    return null;
  }
  return accounts[0];
};

// export const getNetworkInfo = async () => {
//   if (!window.ethereum) return null;
  
//   try {
//     const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    
//     console.log("network info", chainId);

//     return {
//       isPolygon: chainId === POLYGON_CHAIN_ID,
//       networkName: chainId === POLYGON_CHAIN_ID ? 'Polygon Mainnet' : 'Unknown Network'
//     };
//   } catch (error) {
//     console.error('Error getting network info:', error);
//     return null;
//   }
// };


export const getNetworkInfo = async () => {
  if (!window.ethereum) return null;
  
  try {
    // Get chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    const networkMap = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet',
      '0x5': 'Goerli Testnet',
      '0x7a69': 'Hardhat Network'
    };

    return {
      chainId,
      networkName: networkMap[chainId] || 'Unknown Network',
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    return null;
  }
};

export const signMessage = async (message, account) => {
  try {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, account],
    });
    return signature;
  } catch (error) {
    throw new Error('Error signing message: ' + error.message);
  }
};