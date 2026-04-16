import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 1800),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-end pr-[15vw] bg-[#080808]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Map Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={phase >= 1 ? { opacity: 0.6, scale: 1 } : { opacity: 0, scale: 1.2 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <img 
          src={`${import.meta.env.BASE_URL}images/map.png`} 
          alt="Metro Map" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 w-[45vw] text-right">
        <motion.p 
          className="font-mono text-[#c8923a] text-[1.5vw] tracking-widest mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          [ THE BRIDGE ]
        </motion.p>
        
        <motion.h2 
          className="font-display text-[5.5vw] text-white leading-tight mb-8"
          initial={{ opacity: 0, x: 50 }}
          animate={phase >= 3 ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Pin it to<br/>the Map.
        </motion.h2>

        <motion.div 
          className="w-full h-[1px] bg-gradient-to-l from-[#c8923a] to-transparent mb-8"
          initial={{ scaleX: 0, transformOrigin: "right" }}
          animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        />

        <motion.p 
          className="font-mono text-white/70 text-[1.2vw] leading-relaxed"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          CONNECTING PRIVATE MOMENTS<br/>
          OF LONELINESS TO THE INVISIBLE<br/>
          COMMUNITY OF COMMUTERS.
        </motion.p>
      </div>
    </motion.div>
  );
}
