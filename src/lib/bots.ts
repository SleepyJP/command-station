// ═══════════════════════════════════════════════════════════════════════════════
// PAISLEY COMMAND STATION - BOT CONTROLLER
// Start/stop/configure all bot types from one interface
// ═══════════════════════════════════════════════════════════════════════════════

import { Contract, JsonRpcProvider, Wallet, formatEther, parseEther } from 'ethers';
import { CHAIN_RPC } from './wallet';
import {
  SNIPER_BOT_ABI,
  FLASH_LOAN_BOT_ABI,
  ARBITRAGE_BOT_ABI,
  VOLUME_BOT_ABI,
} from './contracts';

// ── Types ────────────────────────────────────────────────────────────────────

export type BotType = 'SNIPER' | 'FLASH_LOAN' | 'ARBITRAGE' | 'VOLUME' | 'SANDWICH' | 'MEV_HUNTER';

export type BotStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR' | 'STOPPED';

export interface BotConfig {
  id: string;
  type: BotType;
  name: string;
  description: string;
  contractAddress?: string;
  chainId: number;
  walletIndex: number;
  status: BotStatus;
  settings: Record<string, unknown>;
  stats: BotStats;
  lastActivity?: number;
}

export interface BotStats {
  totalTrades: number;
  profitLoss: string;
  winRate: number;
  gasSpent: string;
  uptime: number;
  lastTrade?: number;
}

// ── Bot Templates ────────────────────────────────────────────────────────────

export const BOT_TEMPLATES: Omit<BotConfig, 'id' | 'walletIndex'>[] = [
  {
    type: 'SNIPER',
    name: 'Token Sniper',
    description: 'Monitors new token launches and executes snipe trades with configurable parameters',
    contractAddress: '0xa35c6fd547c3b9DE4FaC917184f1444f0B2E25f0',
    chainId: 369,
    status: 'IDLE',
    settings: {
      maxGasPrice: '500', // gwei
      maxBuyAmount: '1000', // PLS
      minLiquidity: '10000', // PLS
      autoSell: true,
      sellMultiplier: 2.0,
      blacklistHoneypots: true,
    },
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, gasSpent: '0', uptime: 0 },
  },
  {
    type: 'FLASH_LOAN',
    name: 'Flash Loan Arbitrage',
    description: 'Executes zero-capital arbitrage via flash loans across PulseX V1/V2 and 9inch',
    contractAddress: '0xc3043fe1deEc6CD7aad87bf10742EDB09075a657',
    chainId: 369,
    status: 'IDLE',
    settings: {
      minProfitBps: 50, // 0.5%
      maxGasGwei: 300,
      targetPairs: ['WPLS/USDC', 'WPLS/USDT', 'HEX/WPLS'],
      scanInterval: 2000, // ms
    },
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, gasSpent: '0', uptime: 0 },
  },
  {
    type: 'ARBITRAGE',
    name: 'Cross-DEX Arbitrage',
    description: 'Finds and executes price discrepancies between PulseX, 9inch, and 9mm',
    contractAddress: '0x6B80C21471b11c5105075fDa703660d546082D87',
    chainId: 369,
    status: 'IDLE',
    settings: {
      minSpreadBps: 30,
      maxTradeSize: '5000', // PLS
      routers: [
        '0x165C3410fC91EF562C50559f7d2289fEbed552d9', // PulseX V2
        '0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02', // PulseX V1
      ],
      scanInterval: 3000,
    },
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, gasSpent: '0', uptime: 0 },
  },
  {
    type: 'VOLUME',
    name: 'Volume Bot',
    description: 'Generates organic-looking trading volume for specified tokens. Like OGwebchef Print.Tires setup.',
    contractAddress: '0x14Dda65788CA7156914b6B494131d9D26535Ee82',
    chainId: 369,
    status: 'IDLE',
    settings: {
      targetToken: '',
      tradeAmountMin: '10', // PLS
      tradeAmountMax: '100',
      intervalMin: 30, // seconds
      intervalMax: 300,
      buySellRatio: 0.6, // 60% buys
      randomizeAmounts: true,
      maxDailyTrades: 200,
      useMultipleWallets: true,
    },
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, gasSpent: '0', uptime: 0 },
  },
  {
    type: 'MEV_HUNTER',
    name: 'MEV Hunter / Predator',
    description: 'Monitors mempool for MEV opportunities. Detects sandwich bots and runs counter-strategies.',
    chainId: 369,
    status: 'IDLE',
    settings: {
      mode: 'OBSERVE', // OBSERVE | HUNT | COUNTER
      minProfitPls: 10,
      maxGasGwei: 500,
      targetStrategies: ['SANDWICH_TRAP', 'BACKRUN', 'ARBITRAGE'],
      botDetectionThreshold: 0.7,
      learningRate: 0.01,
    },
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, gasSpent: '0', uptime: 0 },
  },
];

// ── Bot Controller ───────────────────────────────────────────────────────────

export class BotController {
  private provider: JsonRpcProvider;
  private signer: Wallet;
  private chainId: number;

  constructor(privateKey: string, chainId: number) {
    const rpc = CHAIN_RPC[chainId];
    if (!rpc) throw new Error(`No RPC for chain ${chainId}`);
    this.provider = new JsonRpcProvider(rpc);
    this.signer = new Wallet(privateKey, this.provider);
    this.chainId = chainId;
  }

  async getSniperBotStatus(contractAddress: string): Promise<{ paused: boolean; owner: string; treasury: string }> {
    const contract = new Contract(contractAddress, SNIPER_BOT_ABI, this.provider);
    const [paused, owner, treasury] = await Promise.all([
      contract.paused(),
      contract.owner(),
      contract.treasury(),
    ]);
    return { paused, owner, treasury };
  }

  async pauseBot(contractAddress: string, abi: readonly string[]): Promise<string> {
    const contract = new Contract(contractAddress, abi, this.signer);
    const tx = await contract.pause();
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async unpauseBot(contractAddress: string, abi: readonly string[]): Promise<string> {
    const contract = new Contract(contractAddress, abi, this.signer);
    const tx = await contract.unpause();
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async withdrawProfits(contractAddress: string, abi: readonly string[]): Promise<string> {
    const contract = new Contract(contractAddress, abi, this.signer);
    const tx = await contract.withdrawProfits();
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async executeSniperQueue(contractAddress: string, tokenAddress: string): Promise<string> {
    const contract = new Contract(contractAddress, SNIPER_BOT_ABI, this.signer);
    const tx = await contract.executeSnipe(tokenAddress);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async executeFlashArb(
    contractAddress: string,
    tokenA: string,
    tokenB: string,
    amount: string,
    path: string[]
  ): Promise<string> {
    const contract = new Contract(contractAddress, FLASH_LOAN_BOT_ABI, this.signer);
    const tx = await contract.executeFlashArb(tokenA, tokenB, parseEther(amount), path);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async getContractBalance(contractAddress: string): Promise<string> {
    const balance = await this.provider.getBalance(contractAddress);
    return formatEther(balance);
  }
}

// ── Bot Storage ──────────────────────────────────────────────────────────────

const BOTS_STORAGE_KEY = 'paisley_command_bots';

export function saveBotConfig(config: BotConfig): void {
  if (typeof window === 'undefined') return;
  const existing = loadBotConfigs();
  const idx = existing.findIndex((b) => b.id === config.id);
  if (idx >= 0) {
    existing[idx] = config;
  } else {
    existing.push(config);
  }
  localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(existing));
}

export function loadBotConfigs(): BotConfig[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(BOTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteBotConfig(botId: string): void {
  if (typeof window === 'undefined') return;
  const existing = loadBotConfigs().filter((b) => b.id !== botId);
  localStorage.setItem(BOTS_STORAGE_KEY, JSON.stringify(existing));
}
