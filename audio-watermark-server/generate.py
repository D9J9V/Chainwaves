import os
from watermark import create_watermark
from utils import save_features_to_json

def generate_watermarked_audio():
    input_file = os.path.join('sounds', 'original.wav')
    output_file = os.path.join('sounds', 'watermarked.wav')
    features_file = os.path.join('sounds', 'watermark_features.json')
    
    if not os.path.exists(input_file):
        print(f"Error: El archivo {input_file} no existe.")
        return
    
    print("Generando archivo con watermark...")
    stft_features, mellin_features = create_watermark(input_file, output_file)
    print(f"Archivo con watermark generado: {output_file}")
    
    # Guardar las características en un archivo JSON
    save_features_to_json(stft_features, mellin_features, features_file)
    print(f"Características del watermark guardadas en: {features_file}")

if __name__ == "__main__":
    generate_watermarked_audio()
