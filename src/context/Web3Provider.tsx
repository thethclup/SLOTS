import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { WagmiProvider, createConfig, http, webSocket, fallback, createStorage, cookieStorage } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected, baseAccount } from 'wagmi/connectors';
import { DEFAULT_BASE_MAINNET_RPC, DENIM_BLOCK_TIME_MS } from '../lib/baseDenim';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const baseRpcUrl = env.VITE_BASE_RPC_URL || DEFAULT_BASE_MAINNET_RPC;
const baseWsUrl = env.VITE_BASE_WS_URL;

// Use canonical WebSocket (`eth_subscribe("newHeads")` / `eth_subscribe("logs")`) when configured,
// with HTTP fallback on Base Mainnet (Chain ID 8453) for 200ms Denim canonical blocks.
const baseTransport = baseWsUrl
  ? fallback([webSocket(baseWsUrl), http(baseRpcUrl)])
  : http(baseRpcUrl);

export const config = createConfig({
  chains: [base],
  connectors: [
    baseAccount({
      appName: 'Slots Snowy',
    }),
    injected(),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: false,
  pollingInterval: DENIM_BLOCK_TIME_MS,
  transports: {
    [base.id]: baseTransport,
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
