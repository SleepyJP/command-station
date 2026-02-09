'use client';

import { useState, useEffect, useCallback } from 'react';
import { Activity, Loader2 } from 'lucide-react';
import { createPublicClient, http, formatEther, type Address } from 'viem';
import { BOT_CONTRACT_MAP } from '@/lib/botAbis';

// PulseChain client for event queries
const publicClient = createPublicClient({
  chain: {
    id: 369,
    name: 'PulseChain',
    nativeCurrency: { name: 'PLS', symbol: 'PLS', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.pulsechain.com'] } },
  },
  transport: http('https://rpc.pulsechain.com'),
});

interface ActivityItem {
  id: string;
  message: string;
  timestamp: number;
  type: 'trade' | 'bot' | 'agent' | 'system' | 'alert';
}

const BOT_NAMES: Record<string, string> = {
  SNIPER: 'SniperBot',
  FLASH_LOAN: 'FlashLoanBot',
  ARBITRAGE: 'ArbitrageBot',
  VOLUME: 'VolumeBot',
};

export function LiveActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContractActivity = useCallback(async () => {
    const items: ActivityItem[] = [];

    try {
      // Fetch recent transactions to each bot contract
      const blockNumber = await publicClient.getBlockNumber();
      const fromBlock = blockNumber - 500n; // ~25 minutes of blocks

      for (const [botType, address] of Object.entries(BOT_CONTRACT_MAP)) {
        try {
          // Get contract balance
          const balance = await publicClient.getBalance({ address: address as Address });
          const balStr = parseFloat(formatEther(balance)).toFixed(2);

          items.push({
            id: `bal-${botType}`,
            message: `${BOT_NAMES[botType]} balance: ${balStr} PLS`,
            timestamp: Date.now(),
            type: 'system',
          });

          // Get recent transactions TO the contract
          const logs = await publicClient.getLogs({
            address: address as Address,
            fromBlock,
            toBlock: blockNumber,
          });

          for (const log of logs.slice(-3)) {
            items.push({
              id: `log-${log.transactionHash}-${log.logIndex}`,
              message: `${BOT_NAMES[botType]} event in block ${log.blockNumber}`,
              timestamp: Date.now() - Number(blockNumber - (log.blockNumber || 0n)) * 12000,
              type: 'trade',
            });
          }
        } catch {
          // Individual contract query failed — skip
        }
      }

      // Get latest block info
      const block = await publicClient.getBlock({ blockNumber });
      items.push({
        id: `block-${blockNumber}`,
        message: `PulseChain block #${blockNumber} (${block.transactions.length} txns)`,
        timestamp: Number(block.timestamp) * 1000,
        type: 'system',
      });

      // Gas price
      const gasPrice = await publicClient.getGasPrice();
      const gasPriceGwei = Number(gasPrice) / 1e9;
      items.push({
        id: `gas-${Date.now()}`,
        message: `Gas price: ${gasPriceGwei.toFixed(1)} gwei`,
        timestamp: Date.now(),
        type: 'system',
      });
    } catch {
      items.push({
        id: 'error-rpc',
        message: 'RPC query failed — retrying...',
        timestamp: Date.now(),
        type: 'alert',
      });
    }

    // Sort by timestamp descending
    items.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContractActivity();
    const interval = setInterval(fetchContractActivity, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchContractActivity]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00aff0]" />
          <h3 className="font-bold text-[15px] text-white">Live Activity</h3>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-3 h-3 text-gray-500 animate-spin" />}
          <div className="w-2 h-2 rounded-full bg-[#00d97e] ob-pulse" />
        </div>
      </div>

      {/* Activity Feed */}
      <div className="overflow-y-auto max-h-[500px]">
        {activities.length === 0 && loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-gray-600 animate-spin mx-auto mb-3" />
            <p className="text-xs text-gray-600">Querying PulseChain...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-gray-600">No recent activity</p>
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="px-4 py-2.5 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5">
                  {item.type === 'trade' && <span className="text-xs">💰</span>}
                  {item.type === 'bot' && <span className="text-xs">🤖</span>}
                  {item.type === 'agent' && <span className="text-xs">🧠</span>}
                  {item.type === 'system' && <span className="text-xs">⚙️</span>}
                  {item.type === 'alert' && <span className="text-xs">🔔</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
