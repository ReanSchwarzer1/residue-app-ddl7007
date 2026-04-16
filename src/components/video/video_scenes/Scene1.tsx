import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Video */}
      <motion.div className="absolute inset-0 opacity-40">
        <video 
          src={`${import.meta.env.BASE_URL}videos/metro-crowd.mp4`}
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]"></div>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <motion.p 
          className="font-mono text-[#c8923a] text-[1.5vw] tracking-[0.5em] mb-4 uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Thousands of people
        </motion.p>
        
        <motion.h1 
          className="font-display text-[8vw] text-white leading-none tracking-tight"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Completely<br/>Alone
        </motion.h1>
      </div>
    </motion.div>
  );
}
