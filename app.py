import os
import tensorflow as tf
from tensorflow import keras
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load your trained model
model_path = os.path.join(os.path.dirname(__file__), 'model_two.h5')
model = keras.models.load_model(model_path)

# Define the predict route
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify(error='No file part'), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify(error='No selected file'), 400

    # Process the file and make predictions
    img = tf.image.decode_image(file.read(), channels=3)
    img = tf.image.resize(img, [256, 256]) / 255.0
    img = tf.expand_dims(img, axis=0)

    prediction = model.predict(img)
    confidence = float(prediction[0])
    result = 'AI-generated' if confidence > 0.5 else 'Not AI-generated'

    return jsonify(prediction=result, confidence=confidence)

if __name__ == '__main__':
    app.run(debug=True)

