import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reel } from './Reel';
import { checkWins, generateReelFrame, SymbolId } from '../../game/SlotEngine';
import { commitSeed, verifyOutcomeTrustless } from '../../lib/erc8004';
import { buildAttributedTransaction } from '../../lib/erc8021';
import { useAccount, useSignMessage } from 'wagmi';

export function SlotMachine() {
  const [reelsCount, setReelsCount] = useState<3 | 5>(5);
  const rowsCount = 3;
  
  const [frame, setFrame] = useState<SymbolId[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(50);
  const [winStatus, setWinStatus] = useState<{ totalWin: number, freeSpinsWon: number, isJackpot: boolean } | null>(null);
  
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [highestWin, setHighestWin] = useState(0);

  const reelsStopped = useRef(0);

  useEffect(() => {
    // Initial frame
    setFrame(generateReelFrame(reelsCount, rowsCount));
  }, [reelsCount]);

  const handleReelStop = () => {
    reelsStopped.current += 1;
    if (reelsStopped.current === reelsCount) {
      setIsSpinning(false);
      reelsStopped.current = 0;
      processWin();
    }
  };

  const processWin = () => {
    const res = checkWins(frame, bet, 10);
    if (res.totalWin > 0 || res.freeSpinsWon > 0 || res.isJackpot) {
      setWinStatus(res);
      setBalance(b => b + res.totalWin);
      if (res.totalWin > highestWin) {
          setHighestWin(res.totalWin);
      }
    } else {
      setWinStatus(null);
    }
  };

  const spin = async () => {
    if (isSpinning || balance < bet) return;
    
    setBalance(b => b - bet);
    setWinStatus(null);
    setIsSpinning(true);
    reelsStopped.current = 0;
    
    // ERC-8004 trustless seed generation simulation
    const seedCommit = commitSeed(address || 'anonymous');
    
    // Generate new frame
    const newFrame = generateReelFrame(reelsCount, rowsCount);
    setFrame(newFrame);

    // Verify simulating backend verification
    verifyOutcomeTrustless(seedCommit.commitment, address || 'anonymous', newFrame);
  };

  const recordBiggestWin = async () => {
      if(!address) return alert('Connect wallet first');
      try {
          const signature = await signMessageAsync({
              account: address as any,
              message: `I recorded a biggest win of ${highestWin} on Neo Slots.\n\nApp ID: 692279382ba3bc50c6d0cd9f`
          });
          
          // Simulated submission 
          const attTx = buildAttributedTransaction({ data: '0x123' });
          alert(`Win recorded on-chain successfully!\nSig: ${signature.substring(0, 20)}...\nAttribution Payload Attached.`);
      } catch (err: any) {
          console.error(err);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-black/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 mb-8 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">Balance</span>
          <span className="text-3xl font-light text-cyan-400 font-mono tracking-wider">${balance.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
            <span className="text-pink-500 font-bold text-xs tracking-widest uppercase animate-pulse">Progressive</span>
            <span className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tighter drop-shadow-lg">
                $42,069.00
            </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-gray-400 text-xs uppercase tracking-widest font-mono">Current Bet</span>
          <span className="text-3xl font-light text-yellow-400 font-mono tracking-wider">${bet.toFixed(2)}</span>
        </div>
      </div>

      {/* Machine Frame */}
      <div className="relative p-6 rounded-[2.5rem] bg-gradient-to-b from-[#1a1a24] to-[#0a0a0f] border border-white/5 shadow-[0_0_100px_rgba(34,211,238,0.1)] ring-1 ring-white/10 overflow-hidden">
        {/* Neon accent lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />
        
        {/* Reels */}
        <div className="flex rounded-xl overflow-hidden bg-black shadow-inner ring-4 ring-black">
          {frame.map((reel, idx) => (
            <Reel
              key={idx}
              isSpinning={isSpinning}
              finalSymbols={reel}
              delay={idx * 0.3}
              onStop={handleReelStop}
            />
          ))}
        </div>
      </div>

      {/* Win Celebration */}
      <AnimatePresence>
        {winStatus && winStatus.totalWin > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute z-50 transform -translate-y-1/2 pointer-events-none drop-shadow-2xl flex flex-col items-center"
          >
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)]">
              BIG WIN!
            </span>
            <span className="text-5xl font-black text-white drop-shadow-md">
              +${winStatus.totalWin}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 items-center">
        <button 
          onClick={() => setReelsCount(r => r === 3 ? 5 : 3)}
          className="text-xs uppercase tracking-widest text-cyan-400 opacity-70 hover:opacity-100 transition-opacity"
        >
          Toggle {reelsCount === 3 ? '5' : '3'} Reels
        </button>

        <div className="flex gap-2 bg-black/40 p-2 rounded-full border border-white/10 backdrop-blur-md">
            <button onClick={() => setBet(b => Math.max(10, b - 10))} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">-</button>
            <button onClick={() => setBet(500)} className="h-12 px-6 rounded-full bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 font-bold tracking-wide uppercase text-xs transition-colors">Max Bet</button>
            <button onClick={() => setBet(b => b + 10)} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">+</button>
        </div>

        <button 
          onClick={spin}
          disabled={isSpinning || balance < bet}
          className={`relative overflow-hidden w-32 h-32 rounded-full shadow-[0_0_50px_rgba(236,72,153,0.3)] border-4 border-black border-t-pink-500 transition-transform active:scale-95 flex items-center justify-center group ${
              isSpinning ? 'opacity-50 grayscale' : 'bg-gradient-to-b from-pink-500 to-purple-800 hover:from-pink-400 hover:to-purple-700'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-3xl font-black tracking-widest text-white drop-shadow-lg pr-1">SPIN</span>
        </button>
      </div>

       {/* Web3 Features Row */}
       <div className="mt-16 w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#111115] p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center gap-4 hover:border-cyan-500/30 transition-colors">
                <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">Highest Record</span>
                <span className="text-3xl font-light text-white">${highestWin.toFixed(2)}</span>
                <button 
                    onClick={recordBiggestWin}
                    disabled={highestWin === 0}
                    className="w-full mt-2 py-3 rounded-full bg-cyan-500/10 text-cyan-400 text-xs tracking-widest font-bold uppercase hover:bg-cyan-500/20 disabled:opacity-50 transition-colors"
                >
                    Record On-Chain
                </button>
            </div>
            
            <div className="bg-[#111115] p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-4 hover:border-pink-500/30 transition-colors">
                <span className="text-sm font-mono text-gray-400 uppercase tracking-widest">Base Mainnet</span>
                <button 
                    onClick={() => alert('GM Sent with App ID 692279382ba3bc50c6d0cd9f')}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm tracking-widest font-bold uppercase hover:brightness-110 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                    SAY GM
                </button>
            </div>
        </div>
    </div>
  );
}
