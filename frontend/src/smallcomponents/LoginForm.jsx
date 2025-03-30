import { useState } from "react";
import Logo from "../assets/logo.png";
import { connectWallet } from "../utils/web3";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LoginForm = ({ handleConnect }) => {
  const [account, setAccount] = useState(null);
  const [username, setUsername] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  async function clickHandler() {
    try {
      const account = await connectWallet();
      setAccount(account);

      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("public_key", account);

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      if (!data || data.length === 0) {
        setIsNewUser(true);
      } else {
        handleConnect(account);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  }

  async function handleSaveUser() {
    if (!username) return;
    try {
      const { error } = await supabase.from("users").insert([
        { public_key: account, username: username },
      ]);
      if (error) {
        console.error("Error inserting user:", error);
        return;
      }
      setIsNewUser(false);
      handleConnect(account);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  }

  return (
    <div className="min-h-screen min-w-screen overflow-hidden">
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-white fixed inset-0">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-[400px] flex flex-col items-center">
          <div className="flex flex-col items-center gap-6 mb-10">
            <img src={Logo} alt="Logo" className="h-20 object-contain" />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-black uppercase tracking-wider">
                VisionConnect
              </h1>
            </div>
          </div>

          {!isNewUser ? (
            <button
              onClick={clickHandler}
              className="w-full bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-blue-600 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-md hover:shadow-lg"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="w-full text-center">
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onClick={handleSaveUser}
                className="mt-4 w-full bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-200 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Save Username
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
