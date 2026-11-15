import React from 'react';
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';

export function ConnectWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  if (isReconnecting) {
    return (
      <button
        disabled
        className="px-6 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur text-sm font-mono text-cyan-400 transition-colors opacity-50"
      >
        Reconnecting...
      </button>
    );
  }

  if (isConnected) {
    if (chainId !== base.id) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => switchChain({ chainId: base.id })}
            disabled={isSwitching}
            className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)] disabled:opacity-50"
          >
            {isSwitching ? 'Switching...' : 'Switch to Base'}
          </button>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur text-xs font-mono text-cyan-400 hover:bg-white/10 transition-colors"
          >
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => disconnect()}
        className="px-6 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur text-sm font-mono text-cyan-400 hover:bg-white/10 transition-colors"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  const preferredConnector =
    connectors.find((c) => c.id === 'injected') ??
    connectors.find((c) => c.id === 'baseAccount') ??
    connectors[0];

  return (
    <div className="flex gap-2">
      {preferredConnector && (
        <button
          key={preferredConnector.uid}
          onClick={() => connect({ connector: preferredConnector, chainId: base.id })}
          disabled={isConnecting}
          className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold uppercase tracking-widest text-sm transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
