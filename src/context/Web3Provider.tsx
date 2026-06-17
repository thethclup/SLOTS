import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';
import { WagmiProvider, createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
// Assuming you want standard baseAccount, but base-org/account is likely what they mean by baseAccount in the docs.
// Oh wait, baseAccount might not be installed. Let's stick with what works if it is not installed, or try to import it.
// The docs: import { baseAccount } from 'wagmi/connectors' -> wait, the docs said wagmi/connectors has baseAccount.
import { baseAccount } from 'wagmi/connectors';

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    baseAccount({
      appName: 'Slots Snowy',
    }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
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
