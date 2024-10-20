# Audio Watermarking System

This project implements an audio watermarking system based on linear transformations and entropy analysis. It combines concepts from signal processing, linear algebra, and information theory to create a robust method for embedding and detecting audio watermarks.

## Quickstart

1. Set up the environment:

```bash
# Create a virtual environment (optional, but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python main.py
```

2. Manual testing with cURL:

Apply watermark:
```bash
curl -X POST -F "file=@path/to/original_audio.wav" http://localhost:5000/apply_watermark
```

Verify watermark:
```bash
curl -X POST -F "file=@path/to/suspect_audio.wav" \
     -F "stft_features=[1,2,3,4,5]" \
     -F "mellin_features=[6,7,8,9,10]" \
     http://localhost:5000/check_watermark
```

## Key Features

- **Imperceptibility:** The watermark is inaudible to human ears and does not noticeably affect audio quality.
- **Robustness:** Resistant to common manipulations such as compression or cropping.
- **Efficiency:** Quick processing with a simple-to-use API interface.

## Use Cases

1. **Watermark Application:**
   - Upload your original audio file.
   - The system applies an "invisible" watermark.
   - Retrieve a watermarked audio file along with a unique key (watermark features).

2. **Watermark Verification:**
   - Upload the suspect audio file and the original watermark key.
   - The system analyzes the audio to determine if it contains the watermark.
   - Receive results indicating watermark detection and similarity percentage.

## System Components

- **Feature Extraction (`extract_features`):**
  - Utilizes Short-Time Fourier Transform (STFT) for peak detection in the magnitude spectrum.
  - Selects most prominent frequencies as the watermark features.

- **Watermark Application (`apply_watermark`):**
  - Subtly modifies amplitudes of selected frequencies.
  - Uses STFT and ISTFT for frequency domain changes.

- **Watermark Detection (`detect_watermark`):**
  - Extracts features from suspect audio.
  - Compares them with original watermark features.
  - Computes a similarity score.

- **Flask API:**
  - Endpoints to apply watermark (`/apply_watermark`) and verify (`/check_watermark`).
  - Handles audio files and asynchronous processing.

- **Optimizations:**
  - Utilizes NumPy for efficient matrix operations.
  - Implements Mellin Transform for increased robustness against scaling changes.

## Development Considerations

- **Dependencies:** Make sure you have all necessary libraries installed (`numpy`, `scipy`, `flask`, etc.).
- **File Format:** Currently designed for WAV files; consider extending to other formats.
- **Parameter Tuning:** Adjust watermark strength and detection thresholds as needed.

This framework provides a solid foundation for developing a mathematically sound and signal-processing-based audio watermarking system. The key is to fine-tune specific parameters and algorithms for a balance between robustness, imperceptibility, and computational efficiency.
