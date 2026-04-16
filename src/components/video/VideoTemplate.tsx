import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { 
  scene1: 4000, 
  scene2: 4500, 
  scene3: 4000, 
  scene4: 4500, 
  scene5: 5000 
};

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#080808]">
      {/* Persistent Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute w-[80vw] h-[80vw] rounded-full opacity-10 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #c8923a, transparent)' }}
          animate={{ 
            x: ['-20%', '20%', '-10%'], 
            y: ['-10%', '30%', '10%'],
            scale: [1, 1.2, 0.9] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        />
      </div>

      {/* Persistent Midground Layer */}
      <motion.div
        className="absolute z-10 border border-[#c8923a]/30 rounded-sm"
        animate={{
          left: ['45vw', '35vw', '25vw', '15vw', '50vw'][currentScene],
          top: ['45vh', '35vh', '25vh', '15vh', '50vh'][currentScene],
          width: ['10vw', '30vw', '50vw', '70vw', '0vw'][currentScene],
          height: ['10vw', '30vh', '50vh', '70vh', '0vh'][currentScene],
          opacity: [0, 0.5, 0.2, 0.1, 0][currentScene]
        }}
        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Scene Content */}
      <div className="relative z-20 w-full h-full">
        <AnimatePresence mode="sync">
          {currentScene === 0 && <Scene1 key="scene1" />}
          {currentScene === 1 && <Scene2 key="scene2" />}
          {currentScene === 2 && <Scene3 key="scene3" />}
          {currentScene === 3 && <Scene4 key="scene4" />}
          {currentScene === 4 && <Scene5 key="scene5" />}
        </AnimatePresence>
      </div>
      
      {/* Persistent Foreground UI Overlay */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 text-[#c8923a] font-mono text-[1.2vw] tracking-widest opacity-50">
        <motion.div
           animate={{ opacity: [0.5, 1, 0.5] }}
           transition={{ duration: 2, repeat: Infinity }}
        >
          REC •
        </motion.div>
        <div>DDL 7007</div>
      </div>
      
      {/* Noise Overlay - inline CSS grain effect */}
      <div className="absolute inset-0 z-50 opacity-[0.04] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '128px 128px' }} />
    </div>
  );
}
