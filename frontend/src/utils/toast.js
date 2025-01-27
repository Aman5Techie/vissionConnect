import { toast } from 'react-toastify';

// First, add this configuration in your App.js or main component

// Then create a custom toast function
const showToast = (message, type = 'success') => {
  // Clear all existing toasts first
  toast.dismiss();
  
  // Show new toast
  switch(type) {
    case 'success':
      toast.success(message, {
        icon: '🎉',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      });
      break;
    case 'error':
      toast.error(message, {
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      });
      break;
    case 'info':
      toast.info(message, {
        icon: 'ℹ️',
        style: {
          borderRadius: '10px',
          background: '#fff',
          color: '#333',
        },
      });
      break;
    default:
      toast(message);
  }
};

export default showToast