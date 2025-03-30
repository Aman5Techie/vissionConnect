import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import showToast from '../utils/toast';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ConnectMetaMask = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [username, setUsername] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);

    const checkIfWalletIsConnected = async () => {
        try {
            if (!window.ethereum) {
                showToast("Please install MetaMask!", 'error');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await getBalance(accounts[0]);
                await checkUserInDatabase(accounts[0]);
                setIsConnected(true);
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
            showToast("Error checking wallet connection!", 'error');
        }
    };

    const getBalance = async (accountAddress) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(accountAddress);
            setBalance(ethers.formatEther(balance));
        } catch (error) {
            console.error("Error getting balance:", error);
            showToast("Error fetching balance!", 'error');
        }
    };

    const checkUserInDatabase = async (publicKey) => {
        const { data, error } = await supabase.from('users').select('*').eq('public_key', publicKey).single();
        if (error || !data) {
            setIsNewUser(true);
        } else {
            setUsername(data.username);
        }
    };

    const handleNewUser = async () => {
        if (!username) return;
        const { error } = await supabase.from('users').insert({
            public_key: account,
            username,
            balance
        });
        if (error) {
            showToast("Error saving user to database!", 'error');
        } else {
            showToast("User registered successfully!", 'success');
            setIsNewUser(false);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                showToast("Please install MetaMask!", 'error');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            await getBalance(accounts[0]);
            await checkUserInDatabase(accounts[0]);
            setIsConnected(true);
            showToast("Wallet connected successfully!", 'success');
        } catch (error) {
            console.error("Error connecting wallet:", error);
            showToast("Error connecting wallet!", 'error');
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    return (
        <div className="wallet-container">
            <ToastContainer position="top-right" autoClose={5000} />
            {!isConnected ? (
                <button onClick={connectWallet} className="connect-button">
                    Connect Wallet
                </button>
            ) : isNewUser ? (
                <div>
                    <h3>New User Registration</h3>
                    <input
                        type="text"
                        placeholder="Enter username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <button onClick={handleNewUser}>Register</button>
                </div>
            ) : (
                <div className="wallet-info">
                    <h3>Wallet Connected ✅</h3>
                    <p>Account: {account}</p>
                    <p>Balance: {parseFloat(balance).toFixed(4)} ETH</p>
                    <p>Username: {username}</p>
                </div>
            )}
        </div>
    );
};

export default ConnectMetaMask;
