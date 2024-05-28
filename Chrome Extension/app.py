from flask import Flask, request, jsonify, render_template
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch
import requests
from io import BytesIO
import os

app = Flask(__name__)

# Load model directly
processor = AutoImageProcessor.from_pretrained("umm-maybe/AI-image-detector")  # Update with your actual model name
model = AutoModelForImageClassification.from_pretrained("umm-maybe/AI-image-detector")  # Update with your actual model name

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    
    try:
        # Open the image file
        image = Image.open(file).convert('RGB')
        
        # Preprocess the image
        inputs = processor(images=image, return_tensors="pt")
        
        # Perform inference
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Extract the predicted class and confidence
        predicted_class_idx = outputs.logits.argmax(-1).item()
        confidence_score = torch.softmax(outputs.logits, dim=-1)[0, predicted_class_idx].item()
        predicted_class = model.config.id2label[predicted_class_idx]
        
        # Return the prediction and confidence
        return jsonify({'predicted_class': predicted_class, 'confidence': confidence_score})
    
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/predict_from_url', methods=['POST'])
def predict_from_url():
    print(f"Received request with data: {data}")
    data = request.get_json()
    if 'image_urls' not in data:
        return jsonify({'error': 'No image URLs provided'})

    predictions = []

    for url in data['image_urls']:
        try:
            response = requests.get(url)
            image = Image.open(BytesIO(response.content)).convert('RGB')
            inputs = processor(images=image, return_tensors="pt")

            with torch.no_grad():
                outputs = model(**inputs)

            predicted_class_idx = outputs.logits.argmax(-1).item()
            confidence_score = torch.softmax(outputs.logits, dim=-1)[0, predicted_class_idx].item()
            predicted_class = model.config.id2label[predicted_class_idx]

            predictions.append({'url': url, 'predicted_class': predicted_class, 'confidence': confidence_score})

        except Exception as e:
            predictions.append({'url': url, 'error': str(e)})

    print(f"Returning predictions: {predictions}")
    return jsonify(predictions)

if __name__ == '__main__':
    app.run(debug=True)
