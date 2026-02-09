'use client';

import { useCommandStore } from '@/store/commandStore';
import { TREASURY, TREASURY_DEV1, TREASURY_DEV2 } from '@/lib/contracts';
import { CHAIN_RPC, CHAIN_NAMES } from '@/lib/wallet';
import { Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export function SettingsPanel() {
  const { selectedChainId, setSelectedChainId } = useCommandStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-sm text-gray-500 mt-1">ONLY_BOTS Command Station configuration</p>
      </div>

      {/* Treasury Addresses */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Treasury Addresses</h3>
        <div className="space-y-3">
          <AddressRow label="Primary Treasury (EVM)" address={TREASURY} onCopy={copy} copied={copied} />
          <AddressRow label="Dev Wallet 1" address={TREASURY_DEV1} onCopy={copy} copied={copied} />
          <AddressRow label="Dev Wallet 2" address={TREASURY_DEV2} onCopy={copy} copied={copied} />
          <AddressRow label="ICP Treasury" address="iyupi-26e6a-z56ra-6a5tz-yyj6i-kvxe4-joccp-pgapo-vpcvb-zxtmq-oae" onCopy={copy} copied={copied} />
          <AddressRow label="Solana Treasury" address="2VoPPkUxL3iwic7kUzrgnvnKFr1Z8Zop15UArVKtdA4L" onCopy={copy} copied={copied} />
          <AddressRow label="SUI Treasury" address="0x0773108e2bf7080977a87fcc26c37191386bedbed5b12d6b01a13dfe0d43856c" onCopy={copy} copied={copied} />
        </div>
      </div>

      {/* Chain Configuration */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Configuration</h3>
        <div className="space-y-3">
          {Object.entries(CHAIN_RPC).map(([chainId, rpc]) => (
            <div key={chainId} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
              <div>
                <p className="text-sm text-white font-medium">{CHAIN_NAMES[Number(chainId)]}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{rpc}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">Chain {chainId}</span>
                <div className={`w-2 h-2 rounded-full ${Number(chainId) === selectedChainId ? 'bg-green-500' : 'bg-gray-600'}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Contract Addresses */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deployed Bot Contracts (PulseChain)</h3>
        <div className="space-y-3">
          <AddressRow label="SniperBot" address="0xa35c6fd547c3b9DE4FaC917184f1444f0B2E25f0" onCopy={copy} copied={copied} />
          <AddressRow label="FlashLoanBot" address="0xc3043fe1deEc6CD7aad87bf10742EDB09075a657" onCopy={copy} copied={copied} />
          <AddressRow label="ArbitrageBot" address="0x6B80C21471b11c5105075fDa703660d546082D87" onCopy={copy} copied={copied} />
          <AddressRow label="VolumeBot" address="0x14Dda65788CA7156914b6B494131d9D26535Ee82" onCopy={copy} copied={copied} />
          <AddressRow label="BridgeIT Token" address="0x43525d89507bb7423bee6b9e9075d3b14874b776" onCopy={copy} copied={copied} />
        </div>
      </div>

      {/* DEX Routers */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">DEX Router Addresses</h3>
        <div className="space-y-3">
          <AddressRow label="PulseX V2 Router" address="0x165C3410fC91EF562C50559f7d2289fEbed552d9" onCopy={copy} copied={copied} />
          <AddressRow label="PulseX V1 Router" address="0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02" onCopy={copy} copied={copied} />
          <AddressRow label="WPLS" address="0xA1077a294dDE1B09bB078844df40758a5D0f9a27" onCopy={copy} copied={copied} />
        </div>
      </div>

      {/* Ecosystem Repos */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ecosystem Paths (Paisley Protocol)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { name: 'Command Station', path: '~/command-station/' },
            { name: 'BridgeIT Frontend', path: '~/bridgeit/' },
            { name: 'Bridge Gateway', path: '~/paisley-bridge-gateway/' },
            { name: 'Bridge Contracts', path: '~/bridge-it/' },
            { name: 'MEV Bots', path: '~/mev-bots/' },
            { name: 'ONLY_BOTS (Backend)', path: '~/onlybots/' },
            { name: 'ONLY_BOTS (Dashboard)', path: '~/only-bots/' },
            { name: 'PUMP.FUD', path: '~/pump-fud/' },
            { name: 'PUMP.FUD UI', path: '~/pump-fud-ui/' },
            { name: 'Paisley Protocol', path: '~/paisley-protocol/' },
            { name: 'Paisley Swap', path: '~/paisley-swap/' },
            { name: 'Paisley Swap UI', path: '~/paisley-swap-ui/' },
            { name: 'XENEX.FUN', path: '~/xenex-fun/' },
            { name: 'FAIR.FUN (X1)', path: '~/fair-fun-x1/' },
            { name: 'TranscenDEX', path: '~/TrancenDEX/' },
            { name: 'pD-Ai Predictions', path: '~/pdai-predictions/' },
            { name: 'Digital Forge', path: '~/phud-ecosystem/' },
            { name: 'Agent Swarm', path: '~/AGENTS_ØNLY/' },
            { name: 'God Suite (ICP)', path: '~/god-suite/' },
            { name: 'Paisley Bot', path: '~/paisley-bot/' },
          ].map((repo) => (
            <div key={repo.path} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
              <span className="text-xs text-gray-400">{repo.name}</span>
              <span className="text-xs text-gray-600 font-mono">{repo.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AddressRow({
  label,
  address,
  onCopy,
  copied,
}: {
  label: string;
  address: string;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-white font-mono mt-0.5">{address}</p>
      </div>
      <button
        onClick={() => onCopy(address, label)}
        className="p-2 text-gray-600 hover:text-white transition-colors"
      >
        {copied === label ? (
          <span className="text-xs text-green-400">Copied</span>
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
