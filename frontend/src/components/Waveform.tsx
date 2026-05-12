import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface Props {
  audioUrl: string;
  onTimeUpdate?: (time: number) => void;
}

export default function Waveform({
  audioUrl,
  onTimeUpdate
}: Props) {
  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const wave = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#555',
      progressColor: '#fff',
      cursorColor: '#fff',
      height: 120
    });

    wave.load(audioUrl);

    wave.on('interaction', () => {
      wave.playPause();
    });

    wave.on('timeupdate', (time) => {
      onTimeUpdate?.(time);
    });

    return () => {
      wave.destroy();
    };
  }, [audioUrl]);

  return (
    <div
      ref={containerRef}
      style={{
        marginTop: '30px',
        cursor: 'pointer'
      }}
    />
  );
}