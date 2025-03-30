import React, { useRef, useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


const Room = ({ roomID, onBackToHome, account }) => {
  const zegoRef = useRef(null);
  const appID = import.meta.env.VITE_ZEGOCLOUD_APP_ID;
  const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  

  
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        setIsLoading(true);
        
        // Query the users table to find the username matching the provided public key
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('public_key', account)
          .single();
        
        if (error) {
          console.error('Error fetching user name:', error);
          // Fall back to using a default name
          setUserName("User-" + account.substring(0, 5));
        } else if (data) {
          setUserName(data.username);
        }
      } catch (err) {
        console.error('Unexpected error fetching user name:', err);
        setUserName("User-" + account.substring(0, 5));
      } finally {
        setIsLoading(false);
      }
    };

    if (account) {
      fetchUserName();
    }
  }, [account]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }


  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    appID,
    serverSecret,
    roomID,
    Date.now().toString(),
    userName
  );
  zegoRef.current = ZegoUIKitPrebuilt.create(kitToken);


  

  const meeting = async (element) => {
    // zegoRef.current = zp; // Store the ZegoUIKitPrebuilt instance

    zegoRef.current.joinRoom({
      container: element,
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });
  };

  const handleExit = async () => {
    // Explicitly destroy the Zego instance to release camera and microphone
    if (zegoRef.current) {
      try {
        // First try to leave the room
        zegoRef.current.destroy();
        zegoRef.current = null;

        // Make sure media devices are stopped
        stopAllMediaTracks();
        
        // Navigate back to home after cleanup
        onBackToHome();
      } catch (error) {
        console.error("Error during room exit:", error);
        
        // Even if there's an error, still try to stop media tracks and navigate back
        stopAllMediaTracks();
        onBackToHome();
      }
    } else {
      // If no Zego instance, just navigate back
      onBackToHome();
    }
  };

  // Helper function to stop all media tracks
  const stopAllMediaTracks = () => {
    try {
      // Get all media streams and stop their tracks
      navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
          });
        })
        .catch(err => console.error("Error accessing media devices:", err));

      // Additional attempt to stop any active media tracks
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices()
          .then(devices => {
            devices.forEach(device => {
              if (device.kind === 'audioinput' || device.kind === 'videoinput') {
                // Try to stop any active stream using this device
                navigator.mediaDevices.getUserMedia({
                  [device.kind === 'audioinput' ? 'audio' : 'video']: {deviceId: {exact: device.deviceId}}
                })
                .then(stream => {
                  stream.getTracks().forEach(track => track.stop());
                })
                .catch(err => {
                  // Ignore errors here as we're just trying to clean up
                });
              }
            });
          })
          .catch(err => console.error("Error enumerating devices:", err));
      }
    } catch (error) {
      console.error("Error stopping media tracks:", error);
    }
  };

  // Cleanup on component unmount

  return (
    <div className="relative h-screen w-screen">
      {/* Back button with exit functionality */}
      <button
        onClick={handleExit}
        className="absolute top-4 left-4 z-50 bg-black/30 hover:bg-black/50 rounded-full p-2 transition-all duration-200"
        style={{ backdropFilter: 'blur(4px)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      
      {/* Meeting container */}
      <div 
        ref={meeting} 
        className="w-full h-full"
      ></div>
    </div>
  );
};

export default Room;