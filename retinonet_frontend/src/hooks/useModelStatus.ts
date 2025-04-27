import { useState, useEffect } from 'react';
import axios from 'axios';

export const useModelStatus = () => {
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const checkModelStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const response = await axios.get(
        "https://ai-retinonet-production.up.railway.app/status",
        { timeout: 10000 }
      );
      
      setIsModelReady(response.data?.status === true);
      return response.data?.status === true;
    } catch (err) {
      setError("Couldn't connect to AI service");
      return false;
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    // Check status on component mount
    checkModelStatus();
    
    // Setup interval to check status periodically if not ready
    const intervalId = setInterval(() => {
      if (!isModelReady) {
        checkModelStatus().then(ready => {
          if (ready) clearInterval(intervalId);
        });
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [isModelReady]);
  
  return { isModelReady, isChecking, error, checkModelStatus };
};
