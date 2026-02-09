'use client';

import { useCommandStore } from '@/store/commandStore';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const CHAINS = [
  { id: 369, name: 'PulseChain', color: '#00d97e' },
  { id: 8453, name: 'Base', color: '#0052ff' },
  { id: 1, name: 'Ethereum', color: '#627eea' },
];

export function Header() {
  const { selectedChainId, setSelectedChainId, bots, agents, activeTab } = useCommandStore();
  const [chainOpen, setChainOpen] = useState(false);

  const activeBots = bots.filter((b) => b.status === 'RUNNING').length;
  const activeAgents = agents.filter((a) => a.status !== 'OFFLINE').length;
  const selectedChain = CHAINS.find((c) => c.id === selectedChainId) || CHAINS[0];

  const TAB_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    wallets: 'Wallet Fleet',
    bots: 'Bot Control',
    agents: 'Agent Orchestrator',
    bridge: 'BridgeIT',
    settings: 'Settings',
  };

  return (
    <header className="h-14 bg-[#0d0d1a] border-b border-[#1e1e35] flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <h2 className="text-[15px] font-semibold text-white">{TAB_TITLES[activeTab] || 'Dashboard'}</h2>

        {/* Status Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141420] rounded-full border border-[#1e1e35]">
            <div className={`w-1.5 h-1.5 rounded-full ${activeBots > 0 ? 'bg-[#00d97e] ob-pulse' : 'bg-[#333]'}`} />
            <span className="text-[11px] text-[#888]">
              <span className="text-white font-medium">{activeBots}</span> bots
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141420] rounded-full border border-[#1e1e35]">
            <div className={`w-1.5 h-1.5 rounded-full ${activeAgents > 0 ? 'bg-[#00aff0] ob-pulse' : 'bg-[#333]'}`} />
            <span className="text-[11px] text-[#888]">
              <span className="text-white font-medium">{activeAgents}</span> agents
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Chain Selector */}
        <div className="relative">
          <button
            onClick={() => setChainOpen(!chainOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#141420] border border-[#1e1e35] rounded-lg text-[12px] hover:border-[#2e2e45] transition-colors"
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedChain.color }} />
            <span className="text-white">{selectedChain.name}</span>
            <ChevronDown className="w-3 h-3 text-[#555]" />
          </button>

          {chainOpen && (
            <div className="absolute right-0 top-10 w-44 bg-[#141420] border border-[#1e1e35] rounded-lg shadow-2xl z-50 overflow-hidden">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => {
                    setSelectedChainId(chain.id);
                    setChainOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-[12px] hover:bg-[#1a1a2e] transition-colors ${
                    chain.id === selectedChainId ? 'text-[#00aff0]' : 'text-[#aaa]'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chain.color }} />
                  {chain.name}
                  <span className="ml-auto text-[10px] text-[#444]">{chain.id}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="p-2 text-[#555] hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* Wallet Connect */}
        <ConnectButton
          chainStatus="icon"
          accountStatus="avatar"
          showBalance={false}
        />
      </div>
    </header>
  );
}
