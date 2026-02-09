'use client';

import { useCommandStore } from '@/store/commandStore';
import { TREASURY } from '@/lib/contracts';
import { BOT_CONTRACT_MAP } from '@/lib/botAbis';
import { useBalance, useAccount } from 'wagmi';
import { pulsechain } from '@/lib/wagmiConfig';
import { formatEther, type Address } from 'viem';
import {
  Wallet,
  Bot,
  Brain,
  TrendingUp,
  ArrowLeftRight,
  DollarSign,
  Activity,
  Zap,
  CheckCircle,
  Circle,
} from 'lucide-react';

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

function ContractBalanceCard({ name, address }: { name: string; address: Address }) {
  const { data: balance } = useBalance({ address, chainId: pulsechain.id });
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <div>
          <span className="text-white font-medium text-sm">{name}</span>
          <p className="text-xs text-gray-600 font-mono">{address.slice(0, 10)}...{address.slice(-6)}</p>
        </div>
      </div>
      <span className="text-sm font-mono text-white">
        {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} PLS` : '—'}
      </span>
    </div>
  );
}

export function DashboardPanel() {
  const { fleets, bots, agents, missions } = useCommandStore();
  const { isConnected, address } = useAccount();

  const totalWallets = fleets.reduce((sum, f) => sum + f.wallets.length, 0);
  const activeBots = bots.filter((b) => b.status === 'RUNNING').length;
  const activeAgents = agents.filter((a) => a.status !== 'OFFLINE').length;
  const activeMissions = missions.filter((m) => m.status === 'IN_PROGRESS').length;
  const totalPnL = bots.reduce((sum, b) => sum + parseFloat(b.stats.profitLoss || '0'), 0);
  const totalTrades = bots.reduce((sum, b) => sum + b.stats.totalTrades, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ONLY_BOTS Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            Bot fleet, agents, and autonomous operations. Treasury: {TREASURY.slice(0, 6)}...{TREASURY.slice(-4)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-green-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg">
              <Circle className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-500">Not connected</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Wallets" value={totalWallets} subtext={`${fleets.length} fleet(s)`} color="bg-violet-600" />
        <StatCard icon={Bot} label="Active Bots" value={`${activeBots}/${bots.length}`} subtext="Running / Total" color="bg-green-600" />
        <StatCard icon={Brain} label="Active Agents" value={`${activeAgents}/${agents.length}`} subtext="Online / Total" color="bg-cyan-600" />
        <StatCard icon={Zap} label="Active Missions" value={activeMissions} subtext={`${missions.length} total`} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total P&L" value={`${totalPnL.toFixed(2)} PLS`} color="bg-emerald-600" />
        <StatCard icon={Activity} label="Total Trades" value={totalTrades} color="bg-blue-600" />
        <StatCard icon={DollarSign} label="Treasury" value="View" subtext={TREASURY.slice(0, 10) + '...'} color="bg-purple-600" />
      </div>

      {/* Bot Contract Balances */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Bot Contract Balances (PulseChain)</h3>
        <div>
          {Object.entries(BOT_CONTRACT_MAP).map(([name, addr]) => (
            <ContractBalanceCard key={name} name={`${name} Bot`} address={addr} />
          ))}
          <ContractBalanceCard name="Treasury" address={TREASURY as Address} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            label="Generate Fleet"
            description="Create new HD wallet fleet"
            icon={Wallet}
            color="bg-violet-600/20 text-violet-400 border-violet-500/30"
            tab="wallets"
          />
          <QuickAction
            label="Deploy Bot"
            description="Configure and start a new bot"
            icon={Bot}
            color="bg-green-600/20 text-green-400 border-green-500/30"
            tab="bots"
          />
          <QuickAction
            label="Launch Mission"
            description="Assign agents to autonomous task"
            icon={Brain}
            color="bg-cyan-600/20 text-cyan-400 border-cyan-500/30"
            tab="agents"
          />
          <QuickAction
            label="Bridge Tokens"
            description="Cross-chain via BridgeIT"
            icon={ArrowLeftRight}
            color="bg-amber-600/20 text-amber-400 border-amber-500/30"
            tab="bridge"
          />
        </div>
      </div>

      {/* Product Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Paisley Protocol Products</h3>
        <div className="space-y-3">
          <ProductRow name="BridgeIT" status="READY" chain="Multi-chain" description="Cross-chain bridge gateway + TokenGate" />
          <ProductRow name="ONLY_BOTS" status="DEPLOYED" chain="PulseChain" description="MEV bot fleet (Sniper, Flash, Arb, Volume)" />
          <ProductRow name="PUMP.FUD" status="DEPLOYED" chain="PulseChain" description="Bonding curve memecoin launchpad" />
          <ProductRow name="TranscenDEX" status="LIVE" chain="ICP" description="Concentrated liquidity DEX on Internet Computer" />
          <ProductRow name="XENEX.FUN" status="REBRANDING" chain="X1" description="Bonding curve launchpad on X1 (Solana fork)" />
          <ProductRow name="pD-Ai Predictions" status="BUILDING" chain="PulseChain" description="Binary prediction markets" />
          <ProductRow name="The Digital Forge" status="DEPLOYED" chain="PulseChain" description="Fee-on-transfer token factory" />
          <ProductRow name="Digital Sigils" status="LIVE" chain="ICP" description="Generative NFT collection" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  label,
  description,
  icon: Icon,
  color,
  tab,
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  tab: string;
}) {
  const { setActiveTab } = useCommandStore();
  return (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`p-4 rounded-lg border ${color} text-left hover:opacity-80 transition-opacity`}
    >
      <Icon className="w-5 h-5 mb-2" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs opacity-60 mt-1">{description}</p>
    </button>
  );
}

function ProductRow({
  name,
  status,
  chain,
  description,
}: {
  name: string;
  status: string;
  chain: string;
  description: string;
}) {
  const statusColors: Record<string, string> = {
    LIVE: 'bg-green-500/20 text-green-400',
    DEPLOYED: 'bg-blue-500/20 text-blue-400',
    READY: 'bg-cyan-500/20 text-cyan-400',
    BUILDING: 'bg-amber-500/20 text-amber-400',
    REBRANDING: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm">{name}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-700 text-gray-400'}`}>
            {status}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">{description}</p>
      </div>
      <span className="text-xs text-gray-500">{chain}</span>
    </div>
  );
}
