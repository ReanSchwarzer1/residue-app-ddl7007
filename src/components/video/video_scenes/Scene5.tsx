import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3500),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        className="w-[8vw] h-[8vw] border-[0.2vw] border-[#c8923a] mb-12 relative"
        initial={{ opacity: 0, scale: 0 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 180 } : { opacity: 0, scale: 0 }}
        transition={{ duration: 1.5, type: "spring", stiffness: 100 }}
      >
        <motion.div 
          className="absolute inset-0 border-[0.2vw] border-white/30"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1], rotate: 90 }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.h1 
        className="font-display text-[7vw] text-white tracking-widest leading-none mb-6"
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={phase >= 2 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(10px)" }}
        transition={{ duration: 1.2 }}
      >
        RESIDUE
      </motion.h1>

      <motion.p 
        className="font-mono text-[#c8923a] text-[1.2vw] tracking-[0.5em] uppercase"
        initial={{ opacity: 0 }}
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        A Design Probe for Transit Isolation
      </motion.p>
    </motion.div>
  );
}
