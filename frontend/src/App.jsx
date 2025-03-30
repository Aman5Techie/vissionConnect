// App.jsx

import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Header from "./components/Header";
import SignMessage from "./components/SignMessage";
import MeetingCreator from "./components/MeetingCreator";
import {
  connectWallet,
  handleAccountsChanged,
  getNetworkInfo,
} from "./utils/web3";
import "react-toastify/dist/ReactToastify.css";
import showToast from "./utils/toast";
import LoginForm from "./smallcomponents/LoginForm";
import Room from "./smallcomponents/room";

function App() {
  const [account, setAccount] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [meetingId, setMeetingId] = useState();


  useEffect(() => {
    const updateNetworkInfo = async () => {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        const newAccount = handleAccountsChanged(accounts);
        setAccount(newAccount);
        if (!newAccount) {
          showToast("Wallet disconnected", "info");
        }
      });

      window.ethereum.on("chainChanged", () => {
        updateNetworkInfo();
        showToast("Network changed", "info");
      });

      if (account) {
        updateNetworkInfo();
      }
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", updateNetworkInfo);
      }
    };
  }, [account]);

  const handleConnect = async (account) => {
    try {
      const account = await connectWallet();
      setAccount(account);
      const info = await getNetworkInfo();
      setNetworkInfo(info);
      showToast("Wallet connected successfully!", "success");
    } catch (err) {
      console.log(err);
      showToast("Failed to connect wallet", "error");
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setNetworkInfo(null);
    setMeetingId(null);
    showToast("Wallet disconnected", "info");
  };

  const handleBackToHome = () => {
    setMeetingId(null);
  };

  // If we're in a meeting, render only the Room component
  if (meetingId) {
    return (
      <>
        <ToastContainer
          position="bottom-center"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Room 
          roomID={meetingId}
          onBackToHome={handleBackToHome}
          account={account}
        />
      </>
    );
  }

  // Regular layout when not in a meeting
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="bottom-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Header
        account={account}
        networkInfo={networkInfo}
        onDisconnect={handleDisconnect}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          {!account ? (
            <LoginForm handleConnect={handleConnect} />
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Vision Connect!
                </h2>
                <p className="text-gray-600">
                  Your wallet is connected and ready to use.
                </p>
              </div>

              {/* Meeting Creator Component */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Meeting Management
                </h3>
                <MeetingCreator 
                  account={account}
                />
              </div>

              {/* Sign Message Component */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Join Meeting
                </h3>
                <SignMessage
                  account={account}
                  setCurrentMeetingId={setMeetingId}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;