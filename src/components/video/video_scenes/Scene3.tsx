import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1600),
      setTimeout(() => setPhase(4), 2000),
      setTimeout(() => setPhase(5), 3200),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-start pl-[15vw] bg-[#080808]"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-10 w-[50vw]">
        <motion.p 
          className="font-mono text-white/50 text-[1.5vw] tracking-widest mb-4"
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          [ STEP 02 ]
        </motion.p>
        
        <motion.h2 
          className="font-display text-[5.5vw] text-white leading-none mb-12"
          initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          animate={phase >= 2 ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          Tag Your<br/>Feeling.
        </motion.h2>

        <div className="flex flex-col space-y-[2vw] font-mono text-[2vw]">
          <motion.div 
            className="border border-[#c8923a]/50 p-[1.5vw] text-[#c8923a] inline-block self-start"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            &gt; INVISIBLE
          </motion.div>
          <motion.div 
            className="border border-white/20 p-[1.5vw] text-white/60 inline-block self-start ml-[4vw]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            &gt; SUFFOCATING
          </motion.div>
          <motion.div 
            className="border border-white/20 p-[1.5vw] text-white/60 inline-block self-start ml-[8vw]"
            initial={{ opacity: 0, y: 20 }}
            animate={phase >= 5 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            &gt; DRIFTING
          </motion.div>
        </div>
      </div>

      {/* Abstract blurred background shapes indicating blurred photos */}
      <motion.div 
        className="absolute right-[10vw] top-[20vh] w-[30vw] h-[60vh] bg-white/5 blur-[50px] rounded-lg"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
