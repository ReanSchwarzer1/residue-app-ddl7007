import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL_DURATION_MS = 4000 + 4500 + 4000 + 4500 + 5000; // 22 seconds

export function VideoExporter() {
  const [state, setState] = useState<'idle' | 'waiting' | 'recording' | 'done'>('idle');
  const [countdown, setCountdown] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setState('waiting');
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 30, width: 1280, height: 720 },
        audio: false,
        preferCurrentTab: true,
      });

      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'residue-probe-video.webm';
        a.click();
        URL.revokeObjectURL(url);
        setState('done');
        setTimeout(() => setState('idle'), 3000);
      };

      setState('recording');
      setCountdown(Math.ceil(TOTAL_DURATION_MS / 1000));
      recorder.start(100);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        recorder.stop();
      }, TOTAL_DURATION_MS + 500);
    } catch {
      setState('idle');
    }
  };

  const stopEarly = () => {
    recorderRef.current?.stop();
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[100]">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            onClick={startRecording}
            className="font-mono text-[1.1vw] tracking-widest px-5 py-2 border border-[#c8923a]/60 text-[#c8923a]/80 hover:text-[#c8923a] hover:border-[#c8923a] transition-colors bg-[#080808]/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            EXPORT VIDEO
          </motion.button>
        )}

        {state === 'waiting' && (
          <motion.div
            key="waiting"
            className="font-mono text-[1.1vw] tracking-widest px-5 py-2 text-white/60 bg-[#080808]/80 backdrop-blur-sm border border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            SELECT THIS TAB TO RECORD...
          </motion.div>
        )}

        {state === 'recording' && (
          <motion.div
            key="recording"
            className="flex items-center gap-4 font-mono text-[1.1vw] tracking-widest px-5 py-2 bg-[#080808]/80 backdrop-blur-sm border border-[#c8923a]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
            <span className="text-white/70">RECORDING — {countdown}s</span>
            <button onClick={stopEarly} className="text-[#c8923a]/60 hover:text-[#c8923a] transition-colors">
              STOP
            </button>
          </motion.div>
        )}

        {state === 'done' && (
          <motion.div
            key="done"
            className="font-mono text-[1.1vw] tracking-widest px-5 py-2 text-[#c8923a] bg-[#080808]/80 backdrop-blur-sm border border-[#c8923a]/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            DOWNLOAD COMPLETE
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
