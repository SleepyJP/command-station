'use client';

import { useState, useEffect } from 'react';
import { BotCard } from './BotCard';
import { LiveActivity } from './LiveActivity';
import { loadBots, saveBots, type BotCharacter, BOT_TYPES } from '@/lib/botCharacters';
import { Plus, Wallet, TrendingUp, Zap, BarChart3 } from 'lucide-react';

export function BotDashboard() {
  const [bots, setBots] = useState<BotCharacter[]>([]);
  const [showAddBot, setShowAddBot] = useState(false);

  useEffect(() => {
    setBots(loadBots());
  }, []);

  const handleLaunch = (bot: BotCharacter) => {
    const updated = bots.map((b) =>
      b.id === bot.id ? { ...b, status: 'Active' as const } : b
    );
    setBots(updated);
    saveBots(updated);
  };

  const handleConfig = (bot: BotCharacter) => {
    // Open config modal — for now toggle status
    const updated = bots.map((b) =>
      b.id === bot.id ? { ...b, status: 'Standby' as const } : b
    );
    setBots(updated);
    saveBots(updated);
  };

  const handleAddBot = (type: string) => {
    const template = BOT_TYPES.find((t) => t.type === type);
    if (!template) return;
    const newBot: BotCharacter = {
      id: crypto.randomUUID(),
      name: `New ${template.label}`,
      subtitle: template.label,
      avatar: template.icon,
      status: 'Standby',
      type: type as BotCharacter['type'],
      chainId: 369,
      color: '#00aff0',
      stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
      settings: {},
      createdAt: Date.now(),
    };
    const updated = [...bots, newBot];
    setBots(updated);
    saveBots(updated);
    setShowAddBot(false);
  };

  const activeBots = bots.filter((b) => b.status === 'Active').length;
  const totalTrades = bots.reduce((sum, b) => sum + b.stats.totalTrades, 0);

  return (
    <div className="flex gap-6">
      {/* ═══ Main Content (Left) ═══ */}
      <div className="flex-1 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={<Zap className="w-5 h-5" />} label="Active Bots" value={`${activeBots}`} color="#4caf50" />
          <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Total Bots" value={`${bots.length}`} color="#00aff0" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Total Trades" value={`${totalTrades}`} color="#ff9800" />
          <StatCard icon={<Wallet className="w-5 h-5" />} label="Total P&L" value="0 PLS" color="#9c27b0" />
        </div>

        {/* Bot Characters Section */}
        <div className="ob-main-card">
          <div className="px-6 py-4 border-b-2 border-[#d4eaf7] flex items-center justify-between">
            <h3 className="font-bold text-[16px] text-[#1a1a2e]">bot character</h3>
            <button
              onClick={() => setShowAddBot(!showAddBot)}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-[#00aff0] hover:text-[#018cf1] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add bot character
            </button>
          </div>

          {/* Add Bot Type Selector */}
          {showAddBot && (
            <div className="p-4 bg-[#f5faff] border-b-2 border-[#d4eaf7]">
              <p className="text-[13px] text-[#8a96a3] mb-3 font-medium">Select bot type:</p>
              <div className="grid grid-cols-4 gap-2">
                {BOT_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => handleAddBot(bt.type)}
                    className="p-3 bg-white border-2 border-[#d4eaf7] rounded-xl text-center hover:border-[#00aff0] transition-colors"
                  >
                    <span className="text-2xl">{bt.icon}</span>
                    <p className="text-[11px] font-semibold text-[#1a1a2e] mt-1">{bt.label}</p>
                    <p className="text-[10px] text-[#8a96a3]">{bt.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bot Grid */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  bot={bot}
                  onLaunch={handleLaunch}
                  onConfig={handleConfig}
                />
              ))}

              {/* Add Bot Placeholder Card */}
              <button
                onClick={() => setShowAddBot(true)}
                className="ob-add-bot flex-col"
              >
                <Plus className="w-8 h-8" />
                <span className="text-[13px]">Add Bot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Live Activity Sidebar (Right) ═══ */}
      <div className="w-[280px] flex-shrink-0">
        <LiveActivity />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="ob-main-card p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-[#8a96a3] font-medium">{label}</p>
          <p className="text-[18px] font-bold text-[#1a1a2e]">{value}</p>
        </div>
      </div>
    </div>
  );
}
