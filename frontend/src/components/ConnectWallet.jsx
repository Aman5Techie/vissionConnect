import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import showToast from '../utils/toast';

const ConnectMetaMask = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // Check if MetaMask is installed
    const checkIfWalletIsConnected = async () => {
        try {
            if (!window.ethereum) {
                showToast("Please install MetaMask!", 'error');
                return;
            }

            // Get connected accounts
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await getBalance(accounts[0]);
                setIsConnected(true);
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
            showToast("Error checking wallet connection!", 'error');
        }
    };

    // Get account balance
    const getBalance = async (accountAddress) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(accountAddress);
            const balanceInEth = ethers.formatEther(balance);
            setBalance(balanceInEth);
        } catch (error) {
            console.error("Error getting balance:", error);
            showToast("Error fetching balance!", 'error');
        }
    };

    // Connect wallet
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                showToast("Please install MetaMask!", 'error');
                return;
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            setAccount(accounts[0]);
            await getBalance(accounts[0]);
            setIsConnected(true);
            showToast("Wallet connected successfully!", 'success');
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showToast("Error connecting wallet!", 'error');
        }
    };

    // Handle account changes
    const handleAccountChange = async (accounts) => {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            await getBalance(accounts[0]);
            setIsConnected(true);
        } else {
            setAccount('');
            setBalance('');
            setIsConnected(false);
        }
    };

    // Handle chain changes
    const handleChainChange = () => {
        // Reload the page when chain changes
        window.location.reload();
    };

    useEffect(() => {
        checkIfWalletIsConnected();

        // Setup event listeners
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountChange);
            window.ethereum.on('chainChanged', handleChainChange);

            // Cleanup event listeners
            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountChange);
                window.ethereum.removeListener('chainChanged', handleChainChange);
            };
        }
    }, []);

    return (
        <div className="wallet-container">
            {/* <ToastContainer position="top-right" autoClose={5000} /> */}
            
            {!isConnected ? (
                <button 
                    onClick={connectWallet}
                    className="connect-button"
                >
                    Connect Wallet
                </button>
            ) : (
                <div className="wallet-info">
                    <h3>Wallet Connected ✅</h3>
                    <p>Account: {account}</p>
                    <p>Balance: {parseFloat(balance).toFixed(4)} ETH</p>
                </div>
            )}
        </div>
    );
};

export default ConnectMetaMask;