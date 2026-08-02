import axios from "axios";
export const  formatFollowers=(num)=> {
    if (!num || isNaN(num)) return '0';
    
    if (num >= 1000000) {
        // Divide by 1M and fix to 1 decimal place if needed
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        // Divide by 1K and fix to 1 decimal place if needed
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

export const  formatNumber=(num)=> {
    if (!num || isNaN(num)) return '0';
    
    if (num >= 1000000) {
        // Divide by 1M and fix to 1 decimal place if needed
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        // Divide by 1K and fix to 1 decimal place if needed
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

export const  getProfiledata=async (profileUrl)=> {
  const { data } = await axios.get(
    "https://pulse.walls.sh/profile",
    {
      params: {
        url: profileUrl,
      },
    }
  );

  return data;
}
