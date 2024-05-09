from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from deepfake_detection_pkg.deepfake_detection import deepfake_detection
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "chrome-extension://dnchmjekfhigeebaggllplfifkijacge"}})

@app.route('/detect', methods=['POST'])
def detect():
    image_data = request.get_data()
    image = BytesIO(base64.b64decode(image_data))
    result = deepfake_detection.detect(image)
    return jsonify({'is_deepfake': result})

if __name__ == '__main__':
    app.run(debug=True)