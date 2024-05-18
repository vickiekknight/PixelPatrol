import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load your trained model
model_path = '/Users/daisy./Documents/info 492/models/model_two.h5'
model = keras.models.load_model(model_path)

def prepare_image(image):
    image = tf.image.resize(image, [256, 256])
    image = image / 255.0
    image = np.expand_dims(image, axis=0)
    return image

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        img = tf.io.decode_image(file.read(), channels=3)
        img = prepare_image(img)
        prediction = model.predict(img)
        result = 'AI generated' if prediction[0] > 0.5 else 'Not AI generated'
        return jsonify({'prediction': result, 'confidence': float(prediction[0])})

if __name__ == '__main__':
    app.run(debug=True)
