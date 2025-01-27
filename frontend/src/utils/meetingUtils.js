export const generateMeetingId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const segments = 3;
    const segmentLength = 4;
    
    const generateSegment = () => {
      return Array.from({ length: segmentLength }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    };
  
    return Array.from({ length: segments }, generateSegment).join('-');
  };