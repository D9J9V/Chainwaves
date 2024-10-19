import os
from watermark import create_watermark

def generate_watermarked_audio():
    input_file = os.path.join('sounds', 'original.wav')
    output_file = os.path.join('sounds', 'watermarked.wav')
    
    if not os.path.exists(input_file):
        print(f"Error: El archivo {input_file} no existe.")
        return None, None
    
    print("Generando archivo con watermark...")
    stft_features, mellin_features = create_watermark(input_file, output_file)
    print(f"Archivo con watermark generado: {output_file}")
    
    return stft_features, mellin_features

if __name__ == "__main__":
    generate_watermarked_audio()
