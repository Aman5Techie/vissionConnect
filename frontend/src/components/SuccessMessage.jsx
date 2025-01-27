import { useState, useEffect } from 'react';

const SuccessMessage = ({meeting_id = "XXXX-XXXX-XXXX-XXXX"}) => {
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    // Update date time in the specified format
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toISOString()
        .replace('T', ' ')
        .slice(0, 19);
      setDateTime(formatted);
    };

    updateDateTime();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg">

        {/* Success Message Card */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500">
          {/* Green Header Strip */}
          <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

          <div className="p-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <svg 
                  className="w-8 h-8 text-green-500"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Successfully Joined!
              </h3>
              <p className="text-gray-600">
                You have successfully joined the meeting
              </p>
            </div>

            {/* Meeting Details */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Meeting ID:</span>
                  <span className="font-mono">{meeting_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Joined at:</span>
                  <span className="font-medium">{dateTime}</span>
                </div>
              </div>
            </div>

            {/* Optional: View Details Button */}
            <div className="mt-6 text-center">
              <button 
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                View Meeting Details
              </button>
            </div>
          </div>

          {/* Bottom Decorative Bar */}
          <div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;