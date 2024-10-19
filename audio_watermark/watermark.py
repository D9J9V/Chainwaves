import numpy as np
from scipy.io import wavfile
from scipy.signal import find_peaks, stft, istft
from scipy.interpolate import interp1d
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def mellin_transform(audio, sample_rate, num_scales=100):
    """Aplica una versión simplificada de la Transformada de Mellin."""
    N = len(audio)
    max_freq = min(sample_rate / 2, 22000)
    scales = np.logspace(np.log10(20), np.log10(max_freq), num_scales)
    mt = np.zeros(num_scales)
    for i, scale in enumerate(scales):
        stretched = interp1d(np.arange(N), audio, bounds_error=False, fill_value=0)(np.arange(N) * scale / N)
        mt[i] = np.sum(np.abs(stretched))
    logger.info(f"Transformada de Mellin aplicada. Rango de valores: [{mt.min():.2f}, {mt.max():.2f}]")
    return mt

def extract_mellin_features(audio, sample_rate, n_features=50):
    """Extrae características usando la Transformada de Mellin."""
    mt = mellin_transform(audio, sample_rate)
    peaks, _ = find_peaks(mt, distance=5)
    features = peaks[:n_features]
    logger.info(f"Características de Mellin extraídas. Número de picos: {len(features)}")
    return features

def extract_stft_features(audio, sample_rate, n_features=50, nperseg=2048, noverlap=1024):
    """Extrae características del audio usando STFT y detección de picos."""
    f, t, Zxx = stft(audio, fs=sample_rate, nperseg=nperseg, noverlap=noverlap)
    magnitude = np.abs(Zxx)
    peaks = np.argmax(magnitude, axis=0)
    unique_peaks, counts = np.unique(peaks, return_counts=True)
    top_peaks = unique_peaks[np.argsort(counts)[-n_features:]]
    logger.info(f"Características STFT extraídas. Rango de frecuencias: [{f[top_peaks.min()]:.2f}, {f[top_peaks.max()]:.2f}] Hz")
    return top_peaks

def load_audio(file_path):

    # """Carga un archivo de audio usando librosa y lo convierte
    # a mono si es estéreo."""
    audio, sample_rate = librosa.load(file_path, sr=None, mono=True)
    print(sample_rate)

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


def apply_watermark(audio, features, sr, strength=0.01):
    """Aplica un watermark al audio basado en las características extraídas."""
    f, t, Zxx = stft(audio, fs=sr, nperseg=2048, noverlap=1536)
    for freq in features:
        idx = np.argmin(np.abs(f - freq))
        Zxx[idx, :] += strength * np.exp(1j * np.angle(Zxx[idx, :]))
    _, watermarked = istft(Zxx, fs=sr, nperseg=2048, noverlap=1536)
    return watermarked.astype(audio.dtype)


def detect_watermark(audio, sr, original_features, threshold=0.8):

    """Detecta si el audio contiene el watermark."""
    detected_stft = extract_stft_features(audio, sample_rate)
    detected_mellin = extract_mellin_features(audio, sample_rate)
    
    stft_matches = np.intersect1d(original_stft_features, detected_stft)
    mellin_matches = np.intersect1d(original_mellin_features, detected_mellin)
    
    stft_similarity = len(stft_matches) / len(original_stft_features)
    mellin_similarity = len(mellin_matches) / len(original_mellin_features)
    
    average_similarity = (stft_similarity + mellin_similarity) / 2
    
    logger.info(f"Detección de watermark. Similitud STFT: {stft_similarity:.2f}, Similitud Mellin: {mellin_similarity:.2f}, Promedio: {average_similarity:.2f}")
    return average_similarity > threshold, average_similarity


def create_watermark(input_file, output_file):
    """Crea un watermark en el archivo de audio de entrada y lo guarda."""
    sample_rate, audio = load_audio(input_file)
    stft_features = extract_stft_features(audio, sample_rate)
    mellin_features = extract_mellin_features(audio, sample_rate)
    watermarked = apply_watermark(audio, sample_rate, stft_features, mellin_features)
    save_audio(output_file, sample_rate, watermarked)
    logger.info(f"Watermark creado y aplicado.")
    return stft_features, mellin_features


def check_watermark(input_file, original_stft_features, original_mellin_features):

    """Comprueba si el archivo de audio contiene el watermark."""
    sample_rate, audio = load_audio(input_file)
    is_present, similarity = detect_watermark(audio, sample_rate, original_stft_features, original_mellin_features)
    logger.info(f"Verificación de watermark completada. Presente: {is_present}, Similitud: {similarity:.2f}")
    return bool(is_present), float(similarity)


if __name__ == "__main__":
    # Ejemplo de uso
    input_file = "input.wav"
    output_file = "watermarked.wav"

    
    logger.info("Iniciando proceso de watermarking")
    stft_features, mellin_features = create_watermark(input_file, output_file)
    
    is_present, similarity = check_watermark(output_file, stft_features, mellin_features)
    logger.info(f"Watermark detectado: {is_present}, Similitud: {similarity:.2f}")

