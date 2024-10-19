import json
import numpy as np

def save_features_to_json(stft_features, mellin_features, filename):
    data = {
        'stft_features': stft_features.tolist(),
        'mellin_features': mellin_features.tolist()
    }
    with open(filename, 'w') as f:
        json.dump(data, f)

def load_features_from_json(filename):
    with open(filename, 'r') as f:
        data = json.load(f)
    return np.array(data['stft_features']), np.array(data['mellin_features'])
