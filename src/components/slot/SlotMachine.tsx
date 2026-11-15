import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Reel } from './Reel';
import { checkWins, generateReelFrame, SymbolId } from '../../game/SlotEngine';
import { commitSeed, verifyOutcomeTrustless } from '../../lib/erc8004';
import { buildAttributedTransaction, getDataSuffix } from '../../lib/erc8021';
import {
  getCanonicalBlockNumber,
  getBaseMainnetTxUrl,
  waitForCanonicalReceipt,
} from '../../lib/baseDenim';
import {
  useAccount,
  useSignMessage,
  useSendTransaction,
  useChainId,
  useSwitchChain,
  usePublicClient,
} from 'wagmi';
import { base } from 'wagmi/chains';
import { toHex } from 'viem';
import { Sun, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

const GM_CONTRACT = '0xc35B9997B63B1CE14f8F513f7eddD9a7ABbB33d7' as const;

interface ActionFeedback {
  type: 'success' | 'error';
  message: string;
  txHash?: string;
  blockNumber?: string;
}

export function SlotMachine() {
  const [reelsCount, setReelsCount] = useState<3 | 5>(5);
  const rowsCount = 3;

  const [frame, setFrame] = useState<SymbolId[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(50);
  const [winStatus, setWinStatus] = useState<{ totalWin: number; freeSpinsWon: number; isJackpot: boolean } | null>(null);
  const [showGameWinOverlay, setShowGameWinOverlay] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: base.id });
  const chainId = useChainId();
  const [highestWin, setHighestWin] = useState(0);

  const reelsStopped = useRef(0);

  useEffect(() => {
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
      setBalance((b) => b + res.totalWin);
      if (res.totalWin > highestWin) {
        setHighestWin(res.totalWin);
      }

      if (res.totalWin >= bet * 5) {
        setShowGameWinOverlay(true);
      }
    } else {
      setWinStatus(null);
    }
  };

  const spin = async () => {
    if (isSpinning || balance < bet) return;

    setShowGameWinOverlay(false);
    setFeedback(null);
    setBalance((b) => b - bet);
    setWinStatus(null);
    setIsSpinning(true);
    reelsStopped.current = 0;

    // Bind ERC-8004 seed commitment to latest canonical Base Mainnet block (block_number only, no Flashblocks)
    let canonicalBlock = 0n;
    if (publicClient) {
      try {
        canonicalBlock = await getCanonicalBlockNumber(publicClient);
      } catch {
        canonicalBlock = 0n;
      }
    }

    const seedCommit = commitSeed(address || 'anonymous', canonicalBlock);
    const newFrame = generateReelFrame(reelsCount, rowsCount);
    setFrame(newFrame);

    verifyOutcomeTrustless(
      address || 'anonymous',
      seedCommit.commitment,
      newFrame,
      canonicalBlock > 0n ? canonicalBlock : undefined
    );
  };

  const recordBiggestWin = async () => {
    if (!address) {
      setFeedback({ type: 'error', message: 'Connect your wallet first to record on Base Mainnet.' });
      return;
    }

    try {
      setIsSubmittingTx(true);
      setFeedback(null);

      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }

      const canonicalBlock = publicClient ? await getCanonicalBlockNumber(publicClient) : 0n;
      const winAmount = winStatus?.totalWin ?? highestWin;
      const signature = await signMessageAsync({
        account: address,
        message: `I recorded a win of $${winAmount.toFixed(2)} on Slots Snowy (Base Mainnet Block #${canonicalBlock.toString()})\n\nApp ID: 692279382ba3bc50c6d0cd9f`,
      });

      const payloadHex = toHex(
        JSON.stringify({
          win: winAmount,
          block: canonicalBlock.toString(),
          sig: signature.slice(0, 18),
        })
      );

      const attTx = buildAttributedTransaction({
        to: address,
        data: payloadHex,
      });

      const hash = await sendTransactionAsync({
        chainId: base.id,
        to: attTx.to,
        data: attTx.data,
      });

      if (publicClient) {
        const receipt = await waitForCanonicalReceipt(publicClient, hash);
        setFeedback({
          type: 'success',
          message: 'Win recorded in canonical Base Mainnet block!',
          txHash: hash,
          blockNumber: receipt.blockNumber.toString(),
        });
      } else {
        setFeedback({
          type: 'success',
          message: 'Win transaction submitted to Base Mainnet.',
          txHash: hash,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction rejected or failed.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const handleSayGM = async () => {
    try {
      setIsSubmittingTx(true);
      setFeedback(null);

      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }

      const hash = await sendTransactionAsync({
        chainId: base.id,
        to: GM_CONTRACT,
        data: getDataSuffix(),
      });

      if (publicClient) {
        const receipt = await waitForCanonicalReceipt(publicClient, hash);
        setFeedback({
          type: 'success',
          message: 'GM confirmed on Base Mainnet!',
          txHash: hash,
          blockNumber: receipt.blockNumber.toString(),
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'GM transaction failed.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingTx(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full">
      {/* HUD */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-[#061530]/60 backdrop-blur-md p-4 rounded-[2rem] border border-blue-500/20 mb-8 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-blue-300/70 text-[10px] sm:text-xs uppercase tracking-widest font-mono">Balance</span>
          <span className="text-xl sm:text-3xl font-light text-white font-mono tracking-wider">${balance.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-yellow-400/80 font-bold text-[10px] sm:text-xs tracking-widest uppercase animate-pulse">Snowy Jackpot</span>
          <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 tracking-tighter drop-shadow-lg" style={{ fontFamily: 'Cinzel, serif' }}>
            $42,069.00
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-blue-300/70 text-[10px] sm:text-xs uppercase tracking-widest font-mono">Current Bet</span>
          <span className="text-xl sm:text-3xl font-light text-yellow-400 font-mono tracking-wider">${bet.toFixed(2)}</span>
        </div>
      </div>

      {/* Machine Frame */}
      <div className="relative p-3 sm:p-6 rounded-[2.5rem] bg-gradient-to-b from-[#0f1f3a] to-[#040914] border border-blue-500/20 shadow-[0_0_80px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10 overflow-hidden w-full max-w-5xl">
        {/* Festive accent lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 opacity-50" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 opacity-50" />

        {/* Reels */}
        <div className="flex rounded-xl overflow-hidden bg-[#02050a] shadow-inner ring-4 ring-[#081224]">
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

      {/* Big Win Game Over Overlay */}
      <AnimatePresence>
        {showGameWinOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-[#0f2a4a] to-[#050f1f] p-8 rounded-[2rem] border border-blue-500/40 shadow-2xl flex flex-col items-center text-center max-w-sm w-full"
            >
              <span className="text-5xl mb-2">🏔️</span>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-md" style={{ fontFamily: 'Cinzel, serif' }}>BIG WIN!</h2>
              <div className="text-3xl font-mono text-white mt-4 tracking-widest">+${winStatus?.totalWin.toFixed(2)}</div>

              {feedback && (
                <div
                  className={`mt-4 w-full rounded-xl p-3 text-xs text-left flex items-start gap-2 border ${
                    feedback.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  )}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="break-words">{feedback.message}</span>
                    {feedback.blockNumber && (
                      <span className="font-mono text-[11px] text-emerald-300/80">
                        Block #{feedback.blockNumber}
                      </span>
                    )}
                    {feedback.txHash && (
                      <a
                        href={getBaseMainnetTxUrl(feedback.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-300 hover:underline font-mono"
                      >
                        View on BaseScan <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col w-full gap-3 mt-6">
                <button
                  onClick={recordBiggestWin}
                  disabled={isSubmittingTx}
                  className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmittingTx ? 'Confirming on Base...' : 'Record This Win On-Chain'}
                </button>
                {isConnected && (
                  <button
                    onClick={handleSayGM}
                    disabled={isSubmittingTx}
                    className="w-full py-4 rounded-xl font-bold uppercase text-sm flex items-center justify-center gap-2 px-3 bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors font-['Cinzel'] disabled:opacity-50"
                  >
                    <Sun size={18} /> SAY GM
                  </button>
                )}
                <button
                  onClick={() => setShowGameWinOverlay(false)}
                  className="mt-2 text-gray-400 hover:text-white uppercase text-xs tracking-widest underline underline-offset-4"
                >
                  Keep Playing
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-6 items-center">
        <button
          onClick={() => setReelsCount((r) => (r === 3 ? 5 : 3))}
          className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-400 opacity-70 hover:opacity-100 transition-opacity"
        >
          Toggle {reelsCount === 3 ? '5' : '3'} Reels
        </button>

        <div className="flex gap-2 bg-[#061530]/60 p-2 rounded-full border border-blue-500/20 backdrop-blur-md">
          <button onClick={() => setBet((b) => Math.max(10, b - 10))} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">-</button>
          <button onClick={() => setBet(500)} className="h-12 px-6 rounded-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 font-bold tracking-wide uppercase text-xs transition-colors">Max Bet</button>
          <button onClick={() => setBet((b) => b + 10)} className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">+</button>
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || balance < bet}
          className={`relative overflow-hidden w-28 h-28 sm:w-32 sm:h-32 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.3)] border-4 border-[#02050a] border-t-cyan-400 transition-transform active:scale-95 flex items-center justify-center group ${
            isSpinning ? 'opacity-50 grayscale' : 'bg-gradient-to-b from-cyan-500 to-blue-800 hover:from-cyan-400 hover:to-blue-700'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="text-2xl sm:text-3xl font-black tracking-widest text-white drop-shadow-lg pr-1" style={{ fontFamily: 'Cinzel, serif' }}>SPIN</span>
        </button>
      </div>
    </div>
  );
}
