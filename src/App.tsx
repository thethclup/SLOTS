import React from 'react';
import { Web3Provider } from './context/Web3Provider';
import { SlotMachine } from './components/slot/SlotMachine';
import { ConnectWallet } from './components/ui/ConnectWallet';
import { useAccount, useSendTransaction, useChainId, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { parseEther } from 'viem';
import { Sun, Snowflake } from 'lucide-react';
import { getDataSuffix } from './lib/erc8021';

function Header() {
  const { isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const handleSayGM = () => {
    if (chainId !== base.id) {
       switchChain({ chainId: base.id });
       return;
    }
    // Contract address to say GM
    sendTransaction({
      to: '0xc35B9997B63B1CE14f8F513f7eddD9a7ABbB33d7',
      data: getDataSuffix() as any
    });
  };

  return (
    <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12 w-full max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-300 to-indigo-600 flex items-center justify-center p-0.5 shadow-[0_0_15px_rgba(147,197,253,0.5)]">
            <div className="w-full h-full bg-[#051020] rounded-[10px] flex items-center justify-center">
                <Snowflake className="text-blue-300 w-6 h-6" />
            </div>
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase hidden sm:block text-white" style={{ fontFamily: 'Cinzel, serif' }}>
            Slots <span className="text-blue-400 font-bold">Snowy</span>
          </span>
      </div>
      <div className="flex items-center gap-4">
        {isConnected && (
          <button 
            onClick={handleSayGM}
            className="px-3 py-2 rounded-lg bg-[#E8A020]/20 hover:bg-[#E8A020]/30 border border-[#E8A020]/40 text-[#E8A020] transition-colors flex items-center gap-2 font-['Cinzel'] text-xs font-bold"
          >
            <Sun size={14} /> SAY GM
          </button>
        )}
        <ConnectWallet />
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#020813] text-white font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020813] to-[#010408]">
        {/* Snow particles background overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none mix-blend-screen" />
        
        {/* Aurora effect */}
        <div className="absolute top-0 left-1/4 right-1/4 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 h-96 w-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <Header />

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center min-h-[calc(100vh-100px)] py-4 sm:py-10 w-full">
           <SlotMachine />
        </main>
      </div>
    </Web3Provider>
  );
}

