'use client';

import { useState } from 'react';
import { useCommandStore } from '@/store/commandStore';
import { BOT_TEMPLATES, type BotConfig, type BotType } from '@/lib/bots';
import { saveBotConfig, deleteBotConfig } from '@/lib/bots';
import { botControlAbi, BOT_CONTRACT_MAP } from '@/lib/botAbis';
import { useToastStore } from '@/lib/useToast';
import { useReadContract, useWriteContract, useBalance, useAccount } from 'wagmi';
import { pulsechain } from '@/lib/wagmiConfig';
import { formatEther, type Address } from 'viem';
import {
  Plus,
  Play,
  Pause,
  Square,
  Settings,
  Trash2,
  Bot,
  Crosshair,
  Zap,
  TrendingUp,
  BarChart3,
  Skull,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Loader2,
} from 'lucide-react';

const BOT_ICONS: Record<BotType, React.ElementType> = {
  SNIPER: Crosshair,
  FLASH_LOAN: Zap,
  ARBITRAGE: TrendingUp,
  VOLUME: BarChart3,
  SANDWICH: Skull,
  MEV_HUNTER: Skull,
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  IDLE: { bg: 'bg-gray-700/20', text: 'text-gray-400', dot: 'bg-gray-500' },
  RUNNING: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500 animate-pulse' },
  PAUSED: { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-500' },
  ERROR: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
  STOPPED: { bg: 'bg-gray-700/20', text: 'text-gray-500', dot: 'bg-gray-600' },
};

function ContractStatus({ address }: { address: Address }) {
  const { data: paused, isLoading } = useReadContract({
    address,
    abi: botControlAbi,
    functionName: 'paused',
    chainId: pulsechain.id,
  });

  const { data: owner } = useReadContract({
    address,
    abi: botControlAbi,
    functionName: 'owner',
    chainId: pulsechain.id,
  });

  const { data: balance } = useBalance({
    address,
    chainId: pulsechain.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" /> Reading contract...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-500">On-Chain Status</p>
        <p className={`text-sm font-bold ${paused ? 'text-amber-400' : 'text-green-400'}`}>
          {paused ? 'PAUSED' : 'ACTIVE'}
        </p>
      </div>
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-500">Balance</p>
        <p className="text-sm font-bold text-white">
          {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} PLS` : '—'}
        </p>
      </div>
      <div className="bg-gray-800 rounded-lg p-3">
        <p className="text-xs text-gray-500">Owner</p>
        <p className="text-xs font-mono text-cyan-400 truncate">
          {owner ? `${String(owner).slice(0, 6)}...${String(owner).slice(-4)}` : '—'}
        </p>
      </div>
    </div>
  );
}

export function BotPanel() {
  const { bots, addBot, updateBotStatus, removeBot, fleets } = useCommandStore();
  const { addToast } = useToastStore();
  const { isConnected } = useAccount();
  const [showTemplates, setShowTemplates] = useState(false);
  const [expandedBot, setExpandedBot] = useState<string | null>(null);
  const [editingSettings, setEditingSettings] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const handleAddBot = (templateIndex: number) => {
    const template = BOT_TEMPLATES[templateIndex];
    const bot: BotConfig = {
      ...template,
      id: crypto.randomUUID(),
      walletIndex: 0,
    };
    addBot(bot);
    saveBotConfig(bot);
    setShowTemplates(false);
    setExpandedBot(bot.id);
    addToast(`${template.name} deployed to bot list`, 'success');
  };

  const handleToggleBot = async (bot: BotConfig) => {
    const contractAddress = bot.contractAddress || BOT_CONTRACT_MAP[bot.type];
    if (!contractAddress) {
      const newStatus = bot.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
      updateBotStatus(bot.id, newStatus);
      saveBotConfig({ ...bot, status: newStatus });
      addToast(`${bot.name} ${newStatus === 'RUNNING' ? 'started' : 'paused'} (local only)`, 'info');
      return;
    }

    if (!isConnected) {
      addToast('Connect your wallet to control on-chain bots', 'error');
      return;
    }

    try {
      const isPausing = bot.status === 'RUNNING';
      addToast(`${isPausing ? 'Pausing' : 'Unpausing'} ${bot.name}...`, 'info');

      await writeContractAsync({
        address: contractAddress as Address,
        abi: botControlAbi,
        functionName: isPausing ? 'pause' : 'unpause',
        chainId: pulsechain.id,
      });

      const newStatus = isPausing ? 'PAUSED' : 'RUNNING';
      updateBotStatus(bot.id, newStatus);
      saveBotConfig({ ...bot, status: newStatus });
      addToast(`${bot.name} ${newStatus === 'RUNNING' ? 'unpaused' : 'paused'} on-chain`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.slice(0, 100) : 'Transaction failed';
      addToast(`Failed: ${msg}`, 'error');
    }
  };

  const handleWithdrawProfits = async (bot: BotConfig) => {
    const contractAddress = bot.contractAddress || BOT_CONTRACT_MAP[bot.type];
    if (!contractAddress || !isConnected) {
      addToast('Connect wallet & ensure contract address exists', 'error');
      return;
    }

    try {
      addToast(`Withdrawing profits from ${bot.name}...`, 'info');
      await writeContractAsync({
        address: contractAddress as Address,
        abi: botControlAbi,
        functionName: 'withdrawProfits',
        chainId: pulsechain.id,
      });
      addToast(`Profits withdrawn from ${bot.name} to treasury`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.slice(0, 100) : 'Transaction failed';
      addToast(`Withdraw failed: ${msg}`, 'error');
    }
  };

  const handleStopBot = (bot: BotConfig) => {
    updateBotStatus(bot.id, 'STOPPED');
    saveBotConfig({ ...bot, status: 'STOPPED' });
    addToast(`${bot.name} stopped`, 'info');
  };

  const handleDeleteBot = (botId: string) => {
    const bot = bots.find((b) => b.id === botId);
    removeBot(botId);
    deleteBotConfig(botId);
    addToast(`${bot?.name || 'Bot'} removed`, 'info');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bot Control Center</h2>
          <p className="text-sm text-gray-500 mt-1">
            Deploy, configure, and control trading bots. {isConnected ? 'Wallet connected — on-chain controls active.' : 'Connect wallet for on-chain controls.'}
          </p>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Deploy Bot
        </button>
      </div>

      {/* Bot Templates */}
      {showTemplates && (
        <div className="bg-gray-900 border border-green-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select Bot Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOT_TEMPLATES.map((template, idx) => {
              const Icon = BOT_ICONS[template.type];
              return (
                <button
                  key={idx}
                  onClick={() => handleAddBot(idx)}
                  className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-green-500/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded text-gray-400">{template.type}</span>
                    <span className="text-xs text-gray-600">Chain: {template.chainId}</span>
                    {template.contractAddress && (
                      <span className="text-xs text-cyan-400/60 font-mono">{template.contractAddress.slice(0, 8)}...</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bot List */}
      {bots.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Bot className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No bots deployed. Click &quot;Deploy Bot&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bots.map((bot) => {
            const Icon = BOT_ICONS[bot.type];
            const status = STATUS_STYLES[bot.status] || STATUS_STYLES.IDLE;
            const isExpanded = expandedBot === bot.id;
            const contractAddr = (bot.contractAddress || BOT_CONTRACT_MAP[bot.type]) as Address | undefined;

            return (
              <div key={bot.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Bot Header */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpandedBot(isExpanded ? null : bot.id)}
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{bot.name}</h3>
                      <p className="text-xs text-gray-500">
                        {bot.type} &middot; Chain {bot.chainId}
                        {contractAddr && <span className="text-cyan-400/50 ml-2 font-mono">{contractAddr.slice(0, 8)}...</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${status.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={`text-xs font-medium ${status.text}`}>{bot.status}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleBot(bot)}
                        className="p-2 text-gray-500 hover:text-green-400 transition-colors"
                        title={bot.status === 'RUNNING' ? 'Pause' : 'Start'}
                      >
                        {bot.status === 'RUNNING' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      {contractAddr && (
                        <button
                          onClick={() => handleWithdrawProfits(bot)}
                          className="p-2 text-gray-500 hover:text-amber-400 transition-colors"
                          title="Withdraw Profits"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStopBot(bot)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Stop"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBot(bot.id)}
                        className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-800 p-5 space-y-4">
                    {/* On-Chain Status */}
                    {contractAddr && <ContractStatus address={contractAddr} />}

                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Total Trades</p>
                        <p className="text-lg font-bold text-white">{bot.stats.totalTrades}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">P&L</p>
                        <p className={`text-lg font-bold ${parseFloat(bot.stats.profitLoss) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.stats.profitLoss} PLS
                        </p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Win Rate</p>
                        <p className="text-lg font-bold text-white">{bot.stats.winRate}%</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Gas Spent</p>
                        <p className="text-lg font-bold text-white">{bot.stats.gasSpent} PLS</p>
                      </div>
                    </div>

                    {/* Settings */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-300">Settings</h4>
                        <button
                          onClick={() => setEditingSettings(editingSettings === bot.id ? null : bot.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                          <Settings className="w-3 h-3" />
                          {editingSettings === bot.id ? 'Close' : 'Edit'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(bot.settings).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between bg-gray-800 rounded px-3 py-2">
                            <span className="text-xs text-gray-500">{key}</span>
                            <span className="text-xs text-white font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contract Address */}
                    {contractAddr && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Contract Address</p>
                        <p className="text-xs font-mono text-cyan-400">{contractAddr}</p>
                      </div>
                    )}

                    {/* Wallet Assignment */}
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-2">Assigned Wallet</p>
                      {fleets.length > 0 ? (
                        <select className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white">
                          <option value="">Select a wallet...</option>
                          {fleets.flatMap((f) =>
                            f.wallets.map((w) => (
                              <option key={`${f.id}-${w.index}`} value={`${f.id}-${w.index}`}>
                                {w.name} ({w.address.slice(0, 6)}...{w.address.slice(-4)}) — {f.name}
                              </option>
                            ))
                          )}
                        </select>
                      ) : (
                        <p className="text-xs text-gray-600">No fleets available. Generate a wallet fleet first.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
