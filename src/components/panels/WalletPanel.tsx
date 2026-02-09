'use client';

import { useState } from 'react';
import { useCommandStore } from '@/store/commandStore';
import { generateFleet, getFleetBalances, saveFleet, deleteFleet, CHAIN_NAMES, type WalletFleet } from '@/lib/wallet';
import {
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Download,
  Wallet,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

export function WalletPanel() {
  const { fleets, addFleet, removeFleet, updateWalletBalances, selectedChainId } = useCommandStore();
  const [showCreate, setShowCreate] = useState(false);
  const [fleetName, setFleetName] = useState('Bot Fleet Alpha');
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [expandedFleet, setExpandedFleet] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [showSeed, setShowSeed] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCreateFleet = () => {
    const fleet = generateFleet(
      fleetName,
      selectedChainId,
      customMnemonic || undefined
    );
    addFleet(fleet);
    saveFleet(fleet);
    setShowCreate(false);
    setFleetName('Bot Fleet Alpha');
    setCustomMnemonic('');
    setExpandedFleet(fleet.id);
  };

  const handleRefreshBalances = async (fleet: WalletFleet) => {
    setRefreshing(fleet.id);
    try {
      const updated = await getFleetBalances(fleet);
      updateWalletBalances(fleet.id, updated);
    } catch {
      // silently fail
    }
    setRefreshing(null);
  };

  const handleDeleteFleet = (id: string) => {
    removeFleet(id);
    deleteFleet(id);
    if (expandedFleet === id) setExpandedFleet(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const exportFleet = (fleet: WalletFleet) => {
    const data = {
      name: fleet.name,
      chain: CHAIN_NAMES[fleet.chainId],
      chainId: fleet.chainId,
      mnemonic: fleet.mnemonic,
      wallets: fleet.wallets.map((w) => ({
        index: w.index,
        name: w.name,
        role: w.role,
        address: w.address,
        privateKey: w.privateKey,
        path: w.derivationPath,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fleet.name.replace(/\s+/g, '-').toLowerCase()}-${fleet.chainId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wallet Fleet Manager</h2>
          <p className="text-sm text-gray-500 mt-1">
            Generate HD wallets, manage bot wallets, fund fleet, export keys
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Generate Fleet
        </button>
      </div>

      {/* Create Fleet Form */}
      {showCreate && (
        <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Generate New Wallet Fleet</h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Fleet Name</label>
            <input
              type="text"
              value={fleetName}
              onChange={(e) => setFleetName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-violet-500 focus:outline-none"
              placeholder="Bot Fleet Alpha"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Chain</label>
            <div className="text-sm text-white bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5">
              {CHAIN_NAMES[selectedChainId]} ({selectedChainId})
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Custom Mnemonic <span className="text-gray-600">(optional — leave blank to generate new)</span>
            </label>
            <input
              type="text"
              value={customMnemonic}
              onChange={(e) => setCustomMnemonic(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:border-violet-500 focus:outline-none font-mono"
              placeholder="word1 word2 word3 ... word12"
            />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-300">
                <p className="font-medium">Save your seed phrase!</p>
                <p className="text-amber-400/70 mt-1">
                  This generates real wallets with real private keys. Write down the mnemonic and store it securely.
                  These are bot wallets — only fund them with what you&apos;re willing to use for trading.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateFleet}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-sm font-medium"
            >
              Generate {11} Wallets
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-2.5 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Fleet List */}
      {fleets.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Wallet className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No wallet fleets yet. Generate one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fleets.map((fleet) => (
            <div key={fleet.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Fleet Header */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => setExpandedFleet(expandedFleet === fleet.id ? null : fleet.id)}
              >
                <div className="flex items-center gap-4">
                  {expandedFleet === fleet.id ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <h3 className="text-white font-medium">{fleet.name}</h3>
                    <p className="text-xs text-gray-500">
                      {fleet.wallets.length} wallets &middot; {CHAIN_NAMES[fleet.chainId]} &middot;{' '}
                      {new Date(fleet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRefreshBalances(fleet);
                    }}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                    title="Refresh balances"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing === fleet.id ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportFleet(fleet);
                    }}
                    className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                    title="Export fleet"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFleet(fleet.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                    title="Delete fleet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Fleet Details */}
              {expandedFleet === fleet.id && (
                <div className="border-t border-gray-800">
                  {/* Seed Phrase */}
                  <div className="p-5 border-b border-gray-800 bg-gray-950/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400 font-medium">Seed Phrase</span>
                      <button
                        onClick={() => setShowSeed((s) => ({ ...s, [fleet.id]: !s[fleet.id] }))}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        {showSeed[fleet.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showSeed[fleet.id] ? 'Hide' : 'Reveal'}
                      </button>
                    </div>
                    <div className="font-mono text-sm bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                      <span className={showSeed[fleet.id] ? 'text-amber-300' : 'text-gray-600'}>
                        {showSeed[fleet.id] ? fleet.mnemonic : '●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●● ●●●●'}
                      </span>
                      {showSeed[fleet.id] && (
                        <button
                          onClick={() => copyToClipboard(fleet.mnemonic, `seed-${fleet.id}`)}
                          className="ml-3 text-gray-500 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Wallet Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-800">
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
                          <tr key={w.index} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="py-3 px-5 text-xs text-gray-600">{w.index}</td>
                            <td className="py-3 px-3 text-sm text-white">{w.name}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-gray-800 text-xs text-gray-400 rounded font-mono">
                                {w.role}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-300">
                                  {w.address.slice(0, 6)}...{w.address.slice(-4)}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(w.address, `addr-${w.index}`)}
                                  className="text-gray-600 hover:text-white"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {copied === `addr-${w.index}` && (
                                  <span className="text-xs text-green-400">Copied</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-gray-600">
                                  {showKeys[`${fleet.id}-${w.index}`]
                                    ? w.privateKey.slice(0, 10) + '...' + w.privateKey.slice(-6)
                                    : '0x●●●●●●●●●●●●'}
                                </span>
                                <button
                                  onClick={() =>
                                    setShowKeys((s) => ({
                                      ...s,
                                      [`${fleet.id}-${w.index}`]: !s[`${fleet.id}-${w.index}`],
                                    }))
                                  }
                                  className="text-gray-600 hover:text-white"
                                >
                                  {showKeys[`${fleet.id}-${w.index}`] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </button>
                                {showKeys[`${fleet.id}-${w.index}`] && (
                                  <button
                                    onClick={() => copyToClipboard(w.privateKey, `pk-${w.index}`)}
                                    className="text-gray-600 hover:text-white"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-5 text-right text-sm font-mono text-white">
                              {w.balance ? `${parseFloat(w.balance).toFixed(4)}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
