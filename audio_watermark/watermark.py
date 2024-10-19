import numpy as np
from scipy.io import wavfile
from scipy.fft import fft, ifft
from scipy.signal import find_peaks, stft, istft
from scipy.interpolate import interp1d

def mellin_transform(audio, num_scales=100):
    """Aplica una versión simplificada de la Transformada de Mellin."""
    N = len(audio)
    scales = np.logspace(0, np.log10(N), num_scales)
    mt = np.zeros(num_scales)
    for i, scale in enumerate(scales):
        stretched = interp1d(np.arange(N), audio, bounds_error=False, fill_value=0)(np.arange(N) * scale / N)
        mt[i] = np.sum(np.abs(stretched))
    return mt
    
def extract_mellin_features(audio, n_features=100):
    """Extrae características usando la Transformada de Mellin."""
    mt = mellin_transform(audio)
    peaks, _ = find_peaks(mt, distance=5)
    return peaks[:n_features]
    
def load_audio(file_path):
    """Carga un archivo de audio y lo convierte a mono si es estéreo."""
    sample_rate, audio = wavfile.read(file_path)
    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)
    return sample_rate, audio

def save_audio(file_path, sample_rate, audio):
    """Guarda el audio en un archivo WAV."""
    wavfile.write(file_path, sample_rate, audio.astype(np.int16))

def extract_features(audio, n_features=100, nperseg=2048, noverlap=1024):
    """Extrae características del audio usando STFT y detección de picos."""
    f, t, Zxx = stft(audio, nperseg=nperseg, noverlap=noverlap)
    magnitude = np.abs(Zxx)
    peaks = np.argmax(magnitude, axis=0)
    unique_peaks, counts = np.unique(peaks, return_counts=True)
    top_peaks = unique_peaks[np.argsort(counts)[-n_features:]]
    return top_peaks

def apply_watermark(audio, features, strength=0.1, nperseg=2048, noverlap=1024):
    """Aplica un watermark al audio basado en las características extraídas."""
    f, t, Zxx = stft(audio, nperseg=nperseg, noverlap=noverlap)
    for peak in features:
        Zxx[peak, :] += strength * np.exp(1j * np.angle(Zxx[peak, :]))
    _, watermarked = istft(Zxx, nperseg=nperseg, noverlap=noverlap)
    return watermarked.astype(audio.dtype)

def detect_watermark(audio, original_features, threshold=0.8):
    """Detecta si el audio contiene el watermark."""
    detected_features = extract_features(audio)
    matches = np.intersect1d(original_features, detected_features)
    similarity = len(matches) / len(original_features)
    return similarity > threshold, similarity

# Funciones principales para usar en la API
def create_watermark(input_file, output_file):
    """Crea un watermark en el archivo de audio de entrada y lo guarda."""
    sample_rate, audio = load_audio(input_file)
    features = extract_features(audio)
    watermarked = apply_watermark(audio, features)
    save_audio(output_file, sample_rate, watermarked)
    return features

def check_watermark(input_file, original_features):
    """Comprueba si el archivo de audio contiene el watermark."""
    _, audio = load_audio(input_file)
    is_present, similarity = detect_watermark(audio, original_features)
    return bool(is_present), float(similarity)

if __name__ == "__main__":
    # Ejemplo de uso
    input_file = "input.wav"
    output_file = "watermarked.wav"
    
    features = create_watermark(input_file, output_file)
    print(f"Watermark aplicado y guardado en {output_file}")
    
    is_present, similarity = check_watermark(output_file, features)
    print(f"Watermark detectado: {is_present}, Similitud: {similarity:.2f}")
