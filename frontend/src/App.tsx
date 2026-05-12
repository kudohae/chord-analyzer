import { useState, useCallback } from 'react';

import Waveform from './components/Waveform';

import { analyzeAudio }
from './api/analyze';

export default function App() {
  const [audioUrl, setAudioUrl] =
    useState('');

  const [result, setResult] =
    useState<any>(null);

  const [currentTime, setCurrentTime] =
    useState(0);

  const handleTimeUpdate =
    useCallback((time: number) => {
      setCurrentTime(time);
    }, []);

  async function handleFile(
    file: File
  ) {
    const url =
      URL.createObjectURL(file);

    setAudioUrl(url);

    const res =
      await analyzeAudio(file);

    setResult(res);
  }

  return (
    <div
      style={{
        background: '#111',
        color: 'white',
        minHeight: '100vh',
        padding: '40px',
        fontFamily: 'Arial'
      }}
    >
      <h1>
        High Precision Chord Analyzer
      </h1>

      <input
        type="file"
        accept="audio/*"
        onChange={async (e) => {
          const file =
            e.target.files?.[0];

          if (!file) return;

          await handleFile(file);
        }}
      />

      {audioUrl && (
        <Waveform
          audioUrl={audioUrl}
          onTimeUpdate={handleTimeUpdate}
        />
      )}

      {result && (
        <pre
          style={{
            marginTop: '30px',
            background: '#222',
            padding: '20px'
          }}
        >
          {result.chords.map(
  (c: any, idx: number) => {
    const active =
      currentTime >= c.start &&
      currentTime < c.end;
    return (
      <div
        key={idx}
        style={{
          padding: '8px',
          borderBottom:
            '1px solid #333',
          background: active
            ? '#1a3a1a'
            : 'transparent',
          color: active
            ? '#4cff4c'
            : 'white',
          fontWeight: active
            ? 'bold'
            : 'normal'
        }}
      >
        <strong>
          {c.start.toFixed(2)}s
        </strong>

        {'  →  '}

        <strong>
          {c.end.toFixed(2)}s
        </strong>

        {'   '}

        {c.chord}
      </div>
    );
  }
)}
        </pre>
      )}
    </div>
  );
}