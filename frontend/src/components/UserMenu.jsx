import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon,
  CreditCardIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const UserMenu = ({ account, networkInfo, onDisconnect }) => {
  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <UserCircleIcon className="h-8 w-8 text-gray-600" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3">
            <p className="text-sm text-gray-900">Connected Wallet</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {shortenAddress(account)}
            </p>
          </div>

          {networkInfo && (
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-sm font-medium text-gray-900">
                  {parseFloat(networkInfo.balance).toFixed(4)} ETH
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">Network</p>
                <p className="text-sm font-medium text-gray-900">
                  {networkInfo.networkName}
                </p>
              </div>
            </div>
          )}

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onDisconnect}
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex w-full items-center px-4 py-2 text-sm text-gray-700 border-t border-gray-100`}
              >
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
                Disconnect
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;