import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1800),
      setTimeout(() => setPhase(4), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Video (continued but darker) */}
      <motion.div className="absolute inset-0 opacity-20">
        <video 
          src={`${import.meta.env.BASE_URL}videos/subway-tunnel.mp4`}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Midground: Viewfinder Image */}
      <motion.div 
        className="absolute w-[40vw] h-auto"
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0.8, rotate: -5 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/viewfinder.png`} 
          alt="Viewfinder" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </motion.div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center px-[10vw]">
        <motion.div 
          className="flex space-x-[2vw] items-center mb-[4vw]"
          initial={{ opacity: 0, width: 0 }}
          animate={phase >= 2 ? { opacity: 1, width: "100%" } : { opacity: 0, width: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="h-[1px] bg-[#c8923a] flex-grow"></div>
          <p className="font-mono text-[#c8923a] text-[1.2vw] tracking-[0.3em] uppercase whitespace-nowrap">
            The Probe
          </p>
          <div className="h-[1px] bg-[#c8923a] flex-grow"></div>
        </motion.div>

        <motion.h2 
          className="font-display text-[6vw] text-white leading-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Isolation<br/>Viewfinder
        </motion.h2>
      </div>
    </motion.div>
  );
}
