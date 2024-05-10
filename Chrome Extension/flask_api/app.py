import sys
deepfake_detection = sys.path.append('PixelPatrol/Chrome Extension/deepfake_detection_pkg')

from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "chrome-extension://dnchmjekfhigeebaggllplfifkijacge"}})

@app.route('/detect', methods=['POST'])
def detect():
    image_file = request.files['file']
    result = deepfake_detection.detect(image_file)
    response = jsonify({'is_deepfake': result})
    return response

if __name__ == '__main__':
    app.run(debug=True)