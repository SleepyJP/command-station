'use client';

import { useState, useEffect } from 'react';
import { loadBots, saveBots, type BotCharacter } from '@/lib/botCharacters';
import { generateFleet, type WalletFleet, loadFleets, saveFleet, CHAIN_NAMES } from '@/lib/wallet';
import {
  Plus,
  Wallet,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Download,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Settings,
} from 'lucide-react';

export function MyBots() {
  const [bots, setBots] = useState<BotCharacter[]>([]);
  const [fleets, setFleets] = useState<WalletFleet[]>([]);
  const [showWalletGen, setShowWalletGen] = useState(false);
  const [fleetName, setFleetName] = useState('Bot Fleet Alpha');
  const [selectedBot, setSelectedBot] = useState<string | null>(null);
  const [showSeed, setShowSeed] = useState<Record<string, boolean>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setBots(loadBots());
    setFleets(loadFleets());
  }, []);

  const handleGenerateFleet = () => {
    const fleet = generateFleet(fleetName, 369);
    const updated = [...fleets, fleet];
    setFleets(updated);
    saveFleet(fleet);
    setShowWalletGen(false);
    setFleetName('Bot Fleet Alpha');
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Bot List with Details */}
      <div className="ob-main-card">
        <div className="px-6 py-4 border-b-2 border-[#d4eaf7] flex items-center justify-between">
          <h3 className="font-bold text-[16px] text-[#1a1a2e]">My Bot Characters</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowWalletGen(!showWalletGen)}
              className="flex items-center gap-1.5 ob-btn-launch"
            >
              <Wallet className="w-3.5 h-3.5" />
              Generate Wallets
            </button>
          </div>
        </div>

        {/* Bot Detail List */}
        <div className="divide-y-2 divide-[#d4eaf7]">
          {bots.map((bot) => (
            <div key={bot.id} className="p-5">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setSelectedBot(selectedBot === bot.id ? null : bot.id)}
              >
                <div className="flex items-center gap-4">
                  {selectedBot === bot.id ? (
                    <ChevronDown className="w-4 h-4 text-[#8a96a3]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-[#8a96a3]" />
                  )}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${bot.color}15`, border: `2px solid ${bot.color}30` }}
                  >
                    {bot.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-[14px] text-[#1a1a2e]">
                      {bot.name} <span className="font-normal text-[#8a96a3]">- {bot.subtitle}</span>
                    </h4>
                    <p className="text-[11px] text-[#8a96a3]">
                      {bot.type} &middot; Chain {bot.chainId} &middot; {bot.contractAddress ? bot.contractAddress.slice(0, 10) + '...' : 'No contract'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={bot.status === 'Active' ? 'ob-status-active' : 'ob-status-standby'} />
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: bot.status === 'Active' ? '#4caf50' : '#8a96a3' }}
                    >
                      {bot.status}
                    </span>
                  </div>
                  <button className="ob-btn-config text-[11px] py-1 px-3">
                    <Settings className="w-3 h-3 inline mr-1" />
                    Config
                  </button>
                </div>
              </div>

              {/* Expanded Bot Details */}
              {selectedBot === bot.id && (
                <div className="mt-4 ml-8 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#f5faff] rounded-xl p-3 border border-[#d4eaf7]">
                      <p className="text-[10px] text-[#8a96a3] font-medium">Trades</p>
                      <p className="text-[16px] font-bold text-[#1a1a2e]">{bot.stats.totalTrades}</p>
                    </div>
                    <div className="bg-[#f5faff] rounded-xl p-3 border border-[#d4eaf7]">
                      <p className="text-[10px] text-[#8a96a3] font-medium">P&L</p>
                      <p className="text-[16px] font-bold text-[#1a1a2e]">{bot.stats.profitLoss} PLS</p>
                    </div>
                    <div className="bg-[#f5faff] rounded-xl p-3 border border-[#d4eaf7]">
                      <p className="text-[10px] text-[#8a96a3] font-medium">Win Rate</p>
                      <p className="text-[16px] font-bold text-[#1a1a2e]">{bot.stats.winRate}%</p>
                    </div>
                    <div className="bg-[#f5faff] rounded-xl p-3 border border-[#d4eaf7]">
                      <p className="text-[10px] text-[#8a96a3] font-medium">Uptime</p>
                      <p className="text-[16px] font-bold text-[#1a1a2e]">{bot.stats.uptime}</p>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-[#f5faff] rounded-xl p-4 border border-[#d4eaf7]">
                    <p className="text-[11px] text-[#8a96a3] font-semibold mb-2">Bot Settings</p>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(bot.settings).map(([key, value]) => (
                        <div key={key} className="flex justify-between bg-white rounded-lg px-3 py-2 border border-[#e8f0f8]">
                          <span className="text-[11px] text-[#8a96a3]">{key}</span>
                          <span className="text-[11px] font-mono text-[#1a1a2e] font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Fleet Generator */}
      {showWalletGen && (
        <div className="ob-main-card p-6 space-y-4" style={{ borderColor: '#00aff0' }}>
          <h3 className="font-bold text-[16px] text-[#1a1a2e]">Generate Bot Wallet Fleet</h3>
          <p className="text-[12px] text-[#8a96a3]">
            Creates 11 HD-derived wallets from a single seed phrase. Save your seed phrase securely!
          </p>

          <div>
            <label className="block text-[12px] text-[#8a96a3] font-semibold mb-1.5">Fleet Name</label>
            <input
              type="text"
              value={fleetName}
              onChange={(e) => setFleetName(e.target.value)}
              className="w-full bg-[#f5faff] border-2 border-[#d4eaf7] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1a2e] focus:border-[#00aff0] focus:outline-none"
            />
          </div>

          <div className="flex items-start gap-3 bg-[#fff8e1] border-2 border-[#ffe082] rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 text-[#ff9800] flex-shrink-0 mt-0.5" />
            <div className="text-[12px] text-[#795548]">
              <p className="font-semibold">Save your seed phrase!</p>
              <p className="mt-1">These are real wallets with real private keys. Only fund them with what you intend to use for bot operations.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleGenerateFleet} className="ob-btn-launch px-6 py-2.5 text-[13px]">
              Generate 11 Wallets
            </button>
            <button onClick={() => setShowWalletGen(false)} className="ob-btn-config px-6 py-2.5 text-[13px]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Existing Fleets */}
      {fleets.map((fleet) => (
        <div key={fleet.id} className="ob-main-card">
          <div className="px-6 py-4 border-b-2 border-[#d4eaf7] flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[14px] text-[#1a1a2e]">{fleet.name}</h3>
              <p className="text-[11px] text-[#8a96a3]">
                {fleet.wallets.length} wallets &middot; {CHAIN_NAMES[fleet.chainId]}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSeed((s) => ({ ...s, [fleet.id]: !s[fleet.id] }))}
                className="ob-btn-config text-[11px] py-1 px-3"
              >
                {showSeed[fleet.id] ? <EyeOff className="w-3 h-3 inline mr-1" /> : <Eye className="w-3 h-3 inline mr-1" />}
                Seed
              </button>
            </div>
          </div>

          {/* Seed Phrase */}
          {showSeed[fleet.id] && (
            <div className="px-6 py-3 bg-[#fff8e1] border-b-2 border-[#ffe082]">
              <div className="flex items-center justify-between">
                <code className="text-[12px] text-[#795548] font-mono">{fleet.mnemonic}</code>
                <button onClick={() => copyText(fleet.mnemonic, `seed-${fleet.id}`)} className="text-[#8a96a3] hover:text-[#00aff0]">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Wallet Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-[#8a96a3] font-semibold border-b-2 border-[#d4eaf7]">
                  <th className="text-left py-3 px-5">#</th>
                  <th className="text-left py-3 px-3">Name</th>
                  <th className="text-left py-3 px-3">Role</th>
                  <th className="text-left py-3 px-3">Address</th>
                  <th className="text-left py-3 px-3">Private Key</th>
                  <th className="text-right py-3 px-5">Balance</th>
                </tr>
              </thead>
              <tbody>
                {fleet.wallets.map((w) => (
                  <tr key={w.index} className="border-b border-[#e8f0f8] hover:bg-[#f5faff]">
                    <td className="py-2.5 px-5 text-[11px] text-[#8a96a3]">{w.index}</td>
                    <td className="py-2.5 px-3 text-[12px] text-[#1a1a2e] font-medium">{w.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-[#e3f2fd] text-[10px] text-[#00aff0] rounded-full font-semibold">
                        {w.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-[#555]">
                          {w.address.slice(0, 6)}...{w.address.slice(-4)}
                        </span>
                        <button onClick={() => copyText(w.address, `a-${w.index}`)} className="text-[#b0bec5] hover:text-[#00aff0]">
                          <Copy className="w-3 h-3" />
                        </button>
                        {copied === `a-${w.index}` && <span className="text-[10px] text-[#4caf50]">Copied</span>}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-[#aaa]">
                          {showKeys[`${fleet.id}-${w.index}`] ? w.privateKey.slice(0, 10) + '...' : '0x●●●●●●●●'}
                        </span>
                        <button
                          onClick={() => setShowKeys((s) => ({ ...s, [`${fleet.id}-${w.index}`]: !s[`${fleet.id}-${w.index}`] }))}
                          className="text-[#b0bec5] hover:text-[#00aff0]"
                        >
                          {showKeys[`${fleet.id}-${w.index}`] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-5 text-right text-[12px] font-mono text-[#1a1a2e]">
                      {w.balance ? `${parseFloat(w.balance).toFixed(4)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
