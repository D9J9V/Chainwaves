import numpy as np
from scipy.io import wavfile
from scipy.signal import find_peaks, stft, istft
from scipy.interpolate import interp1d
import librosa
import soundfile as sf
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_stft_features(audio, sample_rate, n_features=100):
    """Extrae características del audio usando STFT y detección de picos."""
    f, t, Zxx = stft(audio, fs=sample_rate, nperseg=2048, noverlap=1536)

    # Convert to magnitude spectrum
    mag_spec = np.abs(Zxx)

    # Normalize
    normalize_spec = mag_spec / np.max(mag_spec)

    # Calculate the average magnitude across time
    avg_mag = np.mean(normalize_spec, axis=1)

    # Find peaks in the average magnitude spectrum
    peaks, _ = find_peaks(avg_mag, height=np.max(avg_mag) * 0.05, threshold=np.max(avg_mag)*0.08, distance=1)

    # Sort peaks by magnitude and select top n_features
    peak_mags = avg_mag[peaks]
    top_peak_indices = np.argsort(peak_mags)[-n_features:][::-1]
    top_peaks = peaks[top_peak_indices]

    # Convert peak indices to frequencies
    feature_freqs = f[top_peaks]

    # Ensure we have exactly n_features
    if len(feature_freqs) < n_features:
        feature_freqs = np.pad(feature_freqs, (0, n_features - len(feature_freqs)), 'constant')

    logger.info(f"Características STFT extraídas. Rango de frecuencias: [{feature_freqs.min():.2f}, {feature_freqs.max():.2f}] Hz")
    return feature_freqs
    """Extrae características del audio usando STFT y detección de picos."""
    f, t, Zxx = stft(audio, fs=sample_rate, nperseg=nperseg, noverlap=noverlap)
    magnitude = np.abs(Zxx)
    peaks = np.argmax(magnitude, axis=0)
    unique_peaks, counts = np.unique(peaks, return_counts=True)
    top_peaks = unique_peaks[np.argsort(counts)[-n_features:]]
    logger.info(f"Características STFT extraídas. Rango de frecuencias: [{f[top_peaks.min()]:.2f}, {f[top_peaks.max()]:.2f}] Hz")
    return top_peaks

def load_audio(file_path):
    """Carga un archivo de audio usando librosa y lo convierte a mono si es estéreo."""
    audio, sample_rate = librosa.load(file_path, sr=None, mono=True)
    logger.info(f"Audio cargado. Tasa de muestreo: {sample_rate} Hz, Duración: {len(audio)/sample_rate:.2f} segundos")
    return sample_rate, audio

def save_audio(file_path, sample_rate, audio):
    """Guarda el audio en un archivo WAV."""
    sf.write(file_path, audio, sample_rate)
    logger.info(f"Audio guardado en {file_path}")

def mellin_transform(audio, sample_rate, num_scales=100):
    """Aplica una versión simplificada de la Transformada de Mellin."""
    N = len(audio)
    # Definimos escalas logarítmicas entre 0.5 y 2
    scales = np.logspace(np.log10(0.5), np.log10(2), num_scales)
    mt = np.zeros(num_scales)
    for i, scale in enumerate(scales):
        stretched = interp1d(np.arange(N), audio, bounds_error=False, fill_value=0)(np.arange(N) * scale)
        mt[i] = np.sum(np.abs(stretched))
    return mt, scales

def extract_mellin_features(audio, sample_rate, n_features=50):
    """Extrae características usando la Transformada de Mellin."""
    mt, scales = mellin_transform(audio, sample_rate)
    peaks, _ = find_peaks(mt, distance=5)

    if len(peaks) == 0:
        top_indices = np.argsort(mt)[-n_features:]
        feature_scales = scales[top_indices]
    else:
    # Selecciona los n_features picos más prominentes
        peak_magnitudes = mt[peaks]
        top_peak_indices = np.argsort(peak_magnitudes)[-n_features:][::-1]
        top_peaks = peaks[top_peak_indices]
        feature_scales = scales[top_peaks]

    if len(feature_scales) < n_features:
        feature_scales = np.pad(feature_scales, (0, n_features - len(feature_scales)), 'edge')
    elif len(feature_scales) > n_features:
        feature_scales = feature_scales[:n_features]

    # Las características son las escalas correspondientes a estos picos

    logger.info(f"Características de Mellin extraídas. Rango de escalas: [{feature_scales.min():.2f}, {feature_scales.max():.2f}]")
    return feature_scales


def apply_watermark(audio, sample_rate, stft_features, mellin_features, strength=0.01):
    """Aplica un watermark al audio basado en las características STFT y Mellin."""
    f, t, Zxx = stft(audio, fs=sample_rate, nperseg=2048, noverlap=1536)

    # Aplicar watermark basado en STFT
    for freq in stft_features:
        idx = np.argmin(np.abs(f - freq))
        Zxx[idx, :] += strength * np.exp(1j * np.angle(Zxx[idx, :]))

    # Aplicar watermark basado en Mellin
    for scale in mellin_features:
        stretched = interp1d(np.arange(len(audio)), audio, bounds_error=False, fill_value=0)(np.arange(len(audio)) * scale)
        Zxx += strength * stft(stretched, fs=sample_rate, nperseg=2048, noverlap=1536)[2]

    _, watermarked = istft(Zxx, fs=sample_rate, nperseg=2048, noverlap=1536)
    return watermarked.astype(audio.dtype)


def detect_watermark(audio, sample_rate, original_stft_features, original_mellin_features, threshold=0.6):
    """Detecta si el audio contiene el watermark usando tanto STFT como Mellin."""
    detected_stft = extract_stft_features(audio, sample_rate)
    detected_mellin = extract_mellin_features(audio, sample_rate)

    def are_close(a, b, tolerance=1e-5):
        return np.abs(a - b) < tolerance

    stft_matches = sum(np.isclose(detected_stft, original_stft_features, atol=1))
    mellin_matches = sum(any(are_close(detected, original) for detected in detected_mellin) for original in original_mellin_features)

    stft_similarity = stft_matches / len(original_stft_features)
    mellin_similarity = mellin_matches / len(original_mellin_features)

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
    input_file = "input.wav"
    output_file = "watermarked.wav"

    logger.info("Iniciando proceso de watermarking")
    stft_features, mellin_features = create_watermark(input_file, output_file)

    is_present, similarity = check_watermark(output_file, stft_features, mellin_features)
    logger.info(f"Watermark detectado: {is_present}, Similitud: {similarity:.2f}")
