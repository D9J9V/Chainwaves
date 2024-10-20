from flask import Flask, request, jsonify, send_file
import os
import json
import base64
from watermark import create_watermark, check_watermark
import numpy as np
import logging

app = Flask(__name__)

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        input_path = os.path.join(UPLOAD_FOLDER, 'input.mp3')
        output_path = os.path.join(UPLOAD_FOLDER, 'watermarked.mp3')
        file.save(input_path)

        try:
            stft_features, mellin_features = create_watermark(input_path, output_path)

            # Leer el archivo de audio watermarked
            with open(output_path, 'rb') as f:
                watermarked_audio = f.read()
            
            # Codificar en base64
            watermarked_audio_b64 = base64.b64encode(watermarked_audio).decode('utf-8')

            return jsonify({
                'message': 'Watermark applied successfully',
                'watermarked_audio': watermarked_audio_b64,
                'stft_features': stft_features.tolist(),
                'mellin_features': mellin_features.tolist()
            }), 200
        except Exception as e:
            logger.error(f"Error applying watermark: {str(e)}")
            return jsonify({'error': 'Error applying watermark'}), 500

    return jsonify({'error': 'Unknown error'}), 500

@app.route('/check_watermark', methods=['POST'])
def check_watermark_route():
    if 'file' not in request.files:
        return jsonify({'error': 'Missing file'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Obtener las características como strings y convertirlas a listas
    stft_features_str = request.form.get('stft_features', '[]')
    mellin_features_str = request.form.get('mellin_features', '[]')
    
    try:
        stft_features = json.loads(stft_features_str)
        mellin_features = json.loads(mellin_features_str)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid feature format'}), 400
    
    if file:
        input_path = os.path.join(UPLOAD_FOLDER, 'check_input.wav')
        file.save(input_path)
        
        try:
            is_present, similarity = check_watermark(input_path, np.array(stft_features), np.array(mellin_features))
            return jsonify({
                'watermark_detected': is_present,
                'similarity': similarity
            }), 200
        except Exception as e:
            logger.error(f"Error checking watermark: {str(e)}")
            return jsonify({'error': 'Error checking watermark'}), 500

    return jsonify({'error': 'Unknown error'}), 500

@app.route('/get_watermarked_file', methods=['GET'])
def get_watermarked_file():
    output_path = os.path.join(UPLOAD_FOLDER, 'watermarked.wav')
    if os.path.exists(output_path):
        return send_file(output_path, as_attachment=True)
    else:
        return jsonify({'error': 'Watermarked file not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
