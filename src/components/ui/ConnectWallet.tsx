import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button 
        onClick={() => disconnect()}
        className="px-6 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur text-sm font-mono text-cyan-400 hover:bg-white/10 transition-colors"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className="px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(34,211,238,0.4)]"
    >
      Connect Wallet
    </button>
  );
}
