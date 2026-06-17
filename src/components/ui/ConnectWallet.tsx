import React from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (isReconnecting) {
    return (
      <button 
        disabled
        className="px-6 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur text-sm font-mono text-cyan-400 hover:bg-white/10 transition-colors opacity-50"
      >
        Reconnecting...
      </button>
    );
  }

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
    <div className="flex gap-2">
      {connectors.filter(c => c.id === 'com.coinbase.wallet' || c.id === 'injected').slice(0, 1).map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isConnecting}
          className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ))}
    </div>
  );
}
