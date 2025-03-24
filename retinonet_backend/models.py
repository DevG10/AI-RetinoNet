import os
import gdown
from tensorflow.keras.applications import ResNet50V2
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam

def download_weights_from_gdrive(save_path):
    """Download model weights from Google Drive if not present."""
    
    # Ensure the directory exists
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    if not os.path.exists(save_path):
        url = "https://drive.google.com/uc?id=1C24lSteRxNPkes4z7Zgpk5hVWXL-vjg-"
        
        # Download file
        gdown.download(url, save_path, quiet=False)
        
        # Verify if file exists after download
        if not os.path.exists(save_path):
            raise FileNotFoundError(f"Failed to download model weights to {save_path}")


def load_model(weight_path, input_shape=(224, 224, 3), num_classes=4):
    """Load and return the ML model, downloading weights from Google Drive if needed."""
    
    # Ensure weights exist locally; download if missing
    download_weights_from_gdrive(weight_path)
    
    # Load pre-trained model
    base_model = ResNet50V2(weights='imagenet', include_top=False, input_shape=input_shape)
    base_model.trainable = False

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='sigmoid')
    ])

    model.compile(optimizer=Adam(0.0001), loss='binary_crossentropy', metrics=['accuracy'])
    
    # Load downloaded weights
    model.load_weights(weight_path)
    
    return model

def predict(model, image_array):
    """Make a prediction using the ML model."""
    return model.predict(image_array)
