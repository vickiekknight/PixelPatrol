from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from flask_talisman import Talisman
import requests

app2 = Flask(__name__)
CORS(app2, resources={r"/*": {"origins": "*"}})
Talisman(app2, content_security_policy=None)

@app2.after_request
def add_cors_headers(response):
    response.headers['Cross-Origin-Resource-Policy'] = 'cross-origin'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
    return response

@app2.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        response = requests.get(url, stream=True)
        headers = [(name, value) for name, value in response.headers.items()]
        
        def generate():
            for chunk in response.iter_content(8192):
                yield chunk

        return Response(generate(), headers=headers)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app2.run(debug=True, port=8000)