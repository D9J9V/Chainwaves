import os
import numpy as np
from watermark import check_watermark

def test_watermark():
    watermarked_file = os.path.join('sounds', 'watermarked.wav')
    edited_file = os.path.join('sounds', 'edited.wav')
    
    if not os.path.exists(watermarked_file):
        print(f"Error: El archivo {watermarked_file} no existe.")
        return
    
    if not os.path.exists(edited_file):
        print(f"Error: El archivo {edited_file} no existe.")
        return
    
    # Cargar las características del watermark
    # Nota: En un escenario real, estas características deberían guardarse de forma segura
    # después de aplicar el watermark y no generarse cada vez
    from generate import generate_watermarked_audio
    stft_features, mellin_features = generate_watermarked_audio()
    
    if stft_features is None or mellin_features is None:
        print("Error: No se pudieron obtener las características del watermark.")
        return
    
    print("Comprobando similitud entre edited.wav y watermarked.wav...")
    is_present, similarity = check_watermark(edited_file, stft_features, mellin_features)
    
    print(f"Resultado del test:")
    print(f"Watermark detectado: {'Sí' if is_present else 'No'}")
    print(f"Grado de similitud: {similarity:.4f}")

if __name__ == "__main__":
    test_watermark()
