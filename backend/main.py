from fastapi import FastAPI
from fastapi import UploadFile
from fastapi import File

from fastapi.middleware.cors import (
    CORSMiddleware
)

import tempfile

from analysis import analyze_audio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.post('/analyze')
async def analyze(
    file: UploadFile = File(...)
):
    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix='.mp3'
    ) as tmp:

        content = await file.read()

        tmp.write(content)

        path = tmp.name

    chords = analyze_audio(path)

    return {
        'chords': chords
    }