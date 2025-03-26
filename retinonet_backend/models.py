import os
import gdown
from tensorflow.keras.applications import ResNet50V2
from tensorflow.keras import layers, models
from tensorflow.keras.optimizers import Adam


def load_model(weight_path, input_shape=(224, 224, 3), num_classes=4):
    """Load and return the ML model, downloading weights from Google Drive if needed."""
    
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
