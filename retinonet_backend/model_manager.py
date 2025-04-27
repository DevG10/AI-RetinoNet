import os
import time
import logging
import threading
from typing import Optional
import pickle

logger = logging.getLogger(__name__)

class ModelManager:
    """
    Manages model loading, caching, and access with optimizations for
    cloud environments that spin down instances after inactivity.
    """
    def __init__(self, model_path: str, cache_dir: str = "volume/appdata/cache"):
        self.model_path = model_path
        self.cache_dir = cache_dir
        self.model = None
        self.model_loaded = False
        self.loading_lock = threading.Lock()
        self.last_access_time = time.time()
        self.loading_thread = None
        
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Cache path for serialized model
        self.cache_path = os.path.join(self.cache_dir, "model_cache.pkl")
    
    def load_model_in_background(self):
        """Start a background thread to load the model"""
        if self.loading_thread is not None and self.loading_thread.is_alive():
            logger.info("Model already loading in background")
            return
            
        self.loading_thread = threading.Thread(target=self._load_model)
        self.loading_thread.daemon = True
        self.loading_thread.start()
        logger.info("Started background loading of model")
    
    def _load_model(self):
        """Internal method to load the model with proper error handling"""
        if self.model_loaded:
            return
            
        with self.loading_lock:
            if self.model_loaded:  # Double-check after acquiring lock
                return
                
            try:
                logger.info(f"Loading model from {self.model_path}")
                
                # Try to load from cache first for faster startup
                if self._load_from_cache():
                    logger.info("Successfully loaded model from cache")
                    self.model_loaded = True
                    return
                
                # If cache loading failed, load from original file
                if not os.path.exists(self.model_path):
                    logger.error(f"Model file not found at {self.model_path}")
                    return
                
                # Import here to avoid circular imports
                from models import load_model
                start_time = time.time()
                self.model = load_model(self.model_path)
                load_time = time.time() - start_time
                
                logger.info(f"Model loaded successfully in {load_time:.2f} seconds")
                self.model_loaded = True
                
                # Save to cache for faster loading next time
                self._save_to_cache()
                
            except Exception as e:
                logger.error(f"Error loading model: {str(e)}")
                self.model_loaded = False
    
    def get_model(self):
        """Get the loaded model, updating access time"""
        self.last_access_time = time.time()
        if not self.model_loaded:
            self._load_model()  # Try to load synchronously if not loaded
        return self.model
    
    def is_model_loaded(self) -> bool:
        """Check if model is loaded without triggering a load"""
        return self.model_loaded
        
    def _load_from_cache(self) -> bool:
        """Try to load model from cache"""
        try:
            if not os.path.exists(self.cache_path):
                return False
                
            logger.info(f"Loading model from cache: {self.cache_path}")
            with open(self.cache_path, 'rb') as f:
                self.model = pickle.load(f)
            return True
        except Exception as e:
            logger.error(f"Failed to load from cache: {str(e)}")
            return False
    
    def _save_to_cache(self) -> bool:
        """Save model to cache"""
        try:
            logger.info(f"Saving model to cache: {self.cache_path}")
            with open(self.cache_path, 'wb') as f:
                pickle.dump(self.model, f)
            return True
        except Exception as e:
            logger.error(f"Failed to save to cache: {str(e)}")
            return False
