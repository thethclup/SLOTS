import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { SYMBOLS, SymbolId } from '../../game/SlotEngine';

interface ReelProps {
  key?: string | number;
  isSpinning: boolean;
  finalSymbols: SymbolId[]; // 3 symbols that show up when stopped
  delay: number;
  onStop: () => void;
}

const REEL_STRIP_LENGTH = 30; // symbols to scroll through
const SYMBOL_HEIGHT = 120; // px

export function Reel({ isSpinning, finalSymbols, delay, onStop }: ReelProps) {
  const [strip, setStrip] = useState<SymbolId[]>([]);
  
  useEffect(() => {
    // Initialize strip if empty
    if (strip.length === 0) {
       setStrip([...Array(3).fill(SymbolId.SEVEN)]);
    }
  }, []);

  useEffect(() => {
    if (isSpinning) {
      // generate a long list of random symbols with final symbols at the top
      // Wait, to reel downwards, the final symbols should be at the top of the strip (so we end at translateY 0)
      // Actually, if we animate from y: -offset to y: 0, the final symbols must be at the beginning of the array (indices 0, 1, 2)
      // Let's make indices 0,1,2 the final view, and 3..N the blur symbols
      const newStrip = [...finalSymbols];
      const allSyms = Object.values(SymbolId);
      for (let i = 0; i < REEL_STRIP_LENGTH; i++) {
        newStrip.push(allSyms[Math.floor(Math.random() * allSyms.length)]);
      }
      setStrip(newStrip);
    }
  }, [isSpinning, finalSymbols]);

  const offset = REEL_STRIP_LENGTH * SYMBOL_HEIGHT;

  return (
    <div className="relative overflow-hidden w-28 md:w-32 bg-black/50 border-r border-l border-white/10" style={{ height: SYMBOL_HEIGHT * 3 }}>
      {/* Glow overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/80 via-transparent to-black/80 z-10" />
      
      <motion.div
        className="flex flex-col items-center"
        initial={isSpinning ? { y: -offset } : { y: 0 }}
        animate={isSpinning ? { y: 0 } : { y: 0 }}
        transition={isSpinning ? {
          duration: 2 + delay,
          ease: [0.1, 0.7, 0.1, 1], // easeOutQuart-ish
          onComplete: onStop
        } : { duration: 0 }}
      >
        {strip.map((symId, idx) => {
          const symData = SYMBOLS[symId];
          const isWinning = !isSpinning && idx < 3; // basic highlight

          return (
            <div 
              key={`${idx}-${symId}`} 
              className={`flex items-center justify-center w-full ${isSpinning ? 'opacity-80 blur-[2px]' : ''}`}
              style={{ height: SYMBOL_HEIGHT }}
            >
              <span className={`text-6xl md:text-7xl drop-shadow-2xl font-black ${!isWinning && !isSpinning ? 'opacity-50 grayscale' : 'opacity-100'}`} style={{
                  color: symData.name.length > 2 ? symData.color : 'inherit',
                  textShadow: isWinning ? `0 0 30px ${symData.color}` : 'none',
                  filter: isWinning ? `drop-shadow(0 0 15px ${symData.color})` : 'none'
              }}>
                {symData.name}
              </span>
            </div>
          )
        })}
      </motion.div>
    </div>
  );
}
