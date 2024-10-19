import numpy as np
from scipy.signal import find_peaks, stft, istft
from scipy.interpolate import interp1d
import librosa
import soundfile as sf


def mellin_transform(audio, num_scales=100, sample_rate=44100):
    """Aplica una versión simplificada de la Transformada de Mellin."""
    N = len(audio)
    max_freq = min(sample_rate / 2, 22000)
    scales = np.logspace(np.log10(20), np.log10(max_freq), num_scales)
    mt = np.zeros(num_scales)
    for i, scale in enumerate(scales):
        stretched = interp1d(np.arange(N), audio, bounds_error=False, fill_value=0)(np.arange(N) * scale / N)
        mt[i] = np.sum(np.abs(stretched))
    return mt


def extract_mellin_features(audio, n_features=100):
    # """Extrae características usando la Transformada de Mellin."""
    mt = mellin_transform(audio)
    peaks, _ = find_peaks(mt, distance=20, height=0.1, prominence=0.2)
    return peaks[:n_features]


def load_audio(file_path):
    # """Carga un archivo de audio usando librosa y lo convierte
    # a mono si es estéreo."""
    audio, sample_rate = librosa.load(file_path, sr=None, mono=True)
    return sample_rate, audio


def save_audio(file_path, sample_rate, audio):
    """Guarda el audio en un archivo WAV."""
    sf.write(file_path, audio, sample_rate)


def extract_features(audio, sr, n_features=100):
    """Extrae características del audio usando STFT y detección de picos."""
    f, t, Zxx = stft(audio, fs=sr, nperseg=2048, noverlap=1536)

    # Convert to magnitude spectrum
    mag_spec = np.abs(Zxx)

    # Calculate the average magnitude across time
    avg_mag = np.mean(mag_spec, axis=1)

    # Find peaks in the average magnitude spectrum
    peaks, _ = find_peaks(avg_mag, height=np.max(avg_mag) * 0.1, distance=10)

    # Sort peaks by magnitude and select top n_features
    peak_mags = avg_mag[peaks]
    top_peak_indices = np.argsort(peak_mags)[-n_features:][::-1]
    top_peaks = peaks[top_peak_indices]

    # Convert peak indices to frequencies
    feature_freqs = f[top_peaks]

    # Ensure we have exactly n_features
    if len(feature_freqs) < n_features:
        feature_freqs = np.pad(feature_freqs, (0, n_features - len(feature_freqs)), 'constant')

    return feature_freqs


def apply_watermark(audio, features, sr, strength=0.1):
    """Aplica un watermark al audio basado en las características extraídas."""
    f, t, Zxx = stft(audio, fs=sr, nperseg=2048, noverlap=1536)
    for freq in features:
        idx = np.argmin(np.abs(f - freq))
        Zxx[idx, :] += strength * np.exp(1j * np.angle(Zxx[idx, :]))
    _, watermarked = istft(Zxx, fs=sr, nperseg=2048, noverlap=1536)
    return watermarked.astype(audio.dtype)

def detect_watermark(audio, sr, original_features, threshold=0.8):
    """Detecta si el audio contiene el watermark."""
    detected_features = extract_features(audio, sr)
    matches = np.sum(np.abs(detected_features[:, np.newaxis] - original_features) < 50)
    similarity = matches / len(original_features)
    return similarity > threshold, similarity

# Funciones principales para usar en la API
def create_watermark(input_file, output_file):
    """Crea un watermark en el archivo de audio de entrada y lo guarda."""
    sample_rate, audio = load_audio(input_file)
    features = extract_features(audio, sample_rate)
    watermarked = apply_watermark(audio, features, sample_rate)
    save_audio(output_file, sample_rate, watermarked)
    return features

def check_watermark(input_file, original_features):
    """Comprueba si el archivo de audio contiene el watermark."""
    sample_rate, audio = load_audio(input_file)
    is_present, similarity = detect_watermark(audio, sample_rate, original_features)
    return bool(is_present), float(similarity)

if __name__ == "__main__":
    # Ejemplo de uso
    input_file = "input.wav"
    output_file = "watermarked.wav"

    features = create_watermark(input_file, output_file)
    print(f"Watermark aplicado y guardado en {output_file}")
    print(f"Características extraídas: {features}")

    is_present, similarity = check_watermark(output_file, features)
    print(f"Watermark detectado: {is_present}, Similitud: {similarity:.2f}")

