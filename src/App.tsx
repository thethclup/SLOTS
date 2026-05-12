import React from 'react';
import { Web3Provider } from './context/Web3Provider';
import { SlotMachine } from './components/slot/SlotMachine';
import { ConnectWallet } from './components/ui/ConnectWallet';

export default function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]">
        {/* Particle/Starfield effect background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
        
        {/* Navbar */}
        <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500">N</span>
                </div>
             </div>
             <span className="font-black text-2xl tracking-tighter uppercase hidden sm:block">Neo<span className="text-pink-500">Slots</span></span>
          </div>
          <ConnectWallet />
        </nav>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center min-h-[calc(100vh-100px)] py-10 w-full">
           <SlotMachine />
        </main>
      </div>
    </Web3Provider>
  );
}
