import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

const NetworkStatus = ({ networkInfo }) => {
  const isMainnet = networkInfo?.networkName ?? false;
  return (
    <div className="flex items-center">
      {networkInfo ? (
        <div className="flex items-center">
          {isMainnet ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <ExclamationCircleIcon className="h-5 w-5 text-yellow-500 mr-2" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {networkInfo.name}
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            Not Connected
          </span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;