from flask import Flask, request, jsonify, send_file, Response
import os
from watermark import create_watermark, check_watermark
import numpy as np
from typing import Tuple, Union

app = Flask(__name__)

# Directorio para almacenar archivos temporales
UPLOAD_FOLDER = 'temp_files'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/apply_watermark', methods=['POST'])
def apply_watermark():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        input_path = os.path.join(UPLOAD_FOLDER, 'input.wav')
        output_path = os.path.join(UPLOAD_FOLDER, 'watermarked.wav')

        file.save(str(input_path))  # Convert to string here

        features = create_watermark(str(input_path), str(output_path))  # Convert to string here
        return jsonify({
            'message': 'Watermark applied successfully',
            'stft_features': stft_features.tolist(),
            'mellin_features': mellin_features.tolist()
        }), 200

    return jsonify({'error': 'Unknown error'}), 500

@app.route('/check_watermark', methods=['POST'])

def check_watermark_route() -> Union[Tuple[Response, int], Response]:
    if 'file' not in request.files or 'stft_features' not in request.form or 'mellin_features' not in request.form:
        return jsonify({'error': 'Missing file or features'}), 400
    
    file = request.files['file']
    stft_features = np.array([int(f) for f in request.form['stft_features'].split(',')])
    mellin_features = np.array([int(f) for f in request.form['mellin_features'].split(',')])
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        input_path = os.path.join(UPLOAD_FOLDER, 'check_input.wav')

        file.save(input_path)
        
        is_present, similarity = check_watermark(input_path, stft_features, mellin_features)
        

        return jsonify({
            'watermark_detected': is_present,
            'similarity': similarity
        }), 200

    return jsonify({'error': 'Unknown error'}), 500

@app.route('/get_watermarked_file', methods=['GET'])
def get_watermarked_file():
    output_path = os.path.join(UPLOAD_FOLDER, 'watermarked.wav')
    if os.path.exists(str(output_path)):  # Convert to string here
        return send_file(str(output_path), as_attachment=True)  # Convert to string here
    else:
        return jsonify({'error': 'Watermarked file not found'}), 404
if __name__ == '__main__':
    app.run(debug=True)
