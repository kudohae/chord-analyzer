import gc
import torch
import numpy as np

from btc_model import BTC_model
from utils.hparams import HParams

from utils.mir_eval_modules import (
    audio_file_to_features,
    idx2voca_chord
)

config = HParams.load(
    "run_config.yaml"
)

config.feature['large_voca'] = True
config.model['num_chords'] = 170

device = torch.device(
    "cuda" if torch.cuda.is_available()
    else "cpu"
)

model = BTC_model(
    config=config.model
).to(device)

checkpoint = torch.load(
    "models/btc_model_large_voca.pt",
    map_location=device,
    weights_only=False
)

mean = checkpoint['mean']
std = checkpoint['std']

model.load_state_dict(
    checkpoint['model']
)

model.half()
model.eval()

idx_to_chord = idx2voca_chord()


def analyze_audio(path):

    feature, feature_per_second, _ = (
        audio_file_to_features(
            path,
            config
        )
    )

    feature = feature.T

    feature = (
        feature - mean
    ) / std

    n_timestep = config.model[
        'timestep'
    ]

    num_pad = (
        n_timestep
        - (
            feature.shape[0]
            % n_timestep
        )
    )

    feature = np.pad(
        feature,
        ((0, num_pad), (0, 0)),
        mode="constant"
    )

    num_instance = (
        feature.shape[0]
        // n_timestep
    )

    feature = torch.tensor(
        feature,
        dtype=torch.float16
    ).unsqueeze(0).to(device)

    lines = []

    start_time = 0.0

    with torch.no_grad():

        for t in range(num_instance):

            self_attn_output, _ = (
                model.self_attn_layers(
                    feature[
                        :,
                        n_timestep * t:
                        n_timestep * (t + 1),
                        :
                    ]
                )
            )

            prediction, _ = (
                model.output_layer(
                    self_attn_output
                )
            )

            prediction = prediction.squeeze()

            for i in range(n_timestep):

                current = prediction[i].item()

                if t == 0 and i == 0:

                    prev_chord = current
                    continue

                if current != prev_chord:

                    end_time = (
                        feature_per_second
                        * (
                            n_timestep * t + i
                        )
                    )

                    lines.append({
                        'start': float(start_time),
                        'end': float(end_time),
                        'chord': idx_to_chord[
                            prev_chord
                        ]
                    })

                    start_time = end_time

                    prev_chord = current

    del feature
    gc.collect()

    return lines