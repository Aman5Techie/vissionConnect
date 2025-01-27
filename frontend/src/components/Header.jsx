import { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import UserMenu from './UserMenu';
import NetworkStatus from './NetworkStatus';

const Header = ({ account, networkInfo, onDisconnect }) => {

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900 mr-8">Vision Connect</h1>
            <NetworkStatus networkInfo={networkInfo} />
          </div>
          
          <div className="flex items-center space-x-4">
            
            
            {account && (
              <div className="relative">
              
                  <UserMenu 

                      account={account} 
                      networkInfo={networkInfo}
                      onDisconnect={onDisconnect}
                    />
                
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;