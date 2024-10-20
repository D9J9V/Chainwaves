import os
from watermark import check_watermark
from utils import load_features_from_json

def test_watermark():
    watermarked_file = os.path.join('sounds', 'watermarked.wav')
    edited_file = os.path.join('sounds', 'edited.wav')
    features_file = os.path.join('sounds', 'watermark_features.json')
    
    if not os.path.exists(edited_file):
        print(f"Error: El archivo {edited_file} no existe.")
        return
    
    if not os.path.exists(features_file):
        print(f"Error: El archivo de características {features_file} no existe.")
        return
    
    # Cargar las características del watermark desde el archivo JSON
    stft_features, mellin_features = load_features_from_json(features_file)
    
    print("Comprobando similitud entre edited.wav y watermarked.wav...")
    is_present, similarity = check_watermark(edited_file, stft_features, mellin_features)
    
    print(f"Resultado del test:")
    print(f"Watermark detectado: {'Sí' if is_present else 'No'}")
    print(f"Grado de similitud: {similarity:.4f}")

if __name__ == "__main__":
    test_watermark()
