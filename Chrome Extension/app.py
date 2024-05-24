from flask import Flask, request, jsonify
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import torch

app = Flask(__name__)

# Load model directly
processor = AutoImageProcessor.from_pretrained("imdaisylee/test_model")
model = AutoModelForImageClassification.from_pretrained("imdaisylee/test_model")

@app.route('/')
def home():
    return "Deepfake vs Real Image Detection API"

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

if __name__ == '__main__':
    app.run(debug=True)

