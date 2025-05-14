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
        "https://4f64-52-210-233-217.ngrok-free.app/status",
        { 
          timeout: 10000,
          headers: { 'Cache-Control': 'no-cache' } // Prevent caching
        }
      );
      
      const ready = response.data?.status === true;
      setIsModelReady(ready);
      return ready;
    } catch (err) {
      console.error("Model status check failed:", err);
      setError("Couldn't connect to AI service");
      
      // If we can't connect, assume model is ready to use fallback mode
      // This prevents the interface from being blocked indefinitely
      if (isChecking && !isModelReady) {
        setTimeout(() => {
          setIsModelReady(true);
        }, 15000); // After 15 seconds, assume ready for fallback
      }
      
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
