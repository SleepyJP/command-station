// ═══════════════════════════════════════════════════════════════════════════════
// ONLY_BOTS - Bot Characters
// Each bot has personality, avatar, name, and configurable settings
// ═══════════════════════════════════════════════════════════════════════════════

export type BotStatus = 'Active' | 'Standby' | 'Error' | 'Launching';

export interface BotCharacter {
  id: string;
  name: string;
  subtitle: string;
  avatar: string; // URL or emoji placeholder
  status: BotStatus;
  type: 'arbitrage' | 'volume' | 'gas' | 'printer' | 'sniper' | 'flash' | 'mev' | 'custom';
  chainId: number;
  contractAddress?: string;
  walletAddress?: string;
  color: string; // accent color for the card
  stats: {
    totalTrades: number;
    profitLoss: string;
    winRate: number;
    uptime: string;
  };
  settings: Record<string, unknown>;
  createdAt: number;
}

// ── Default Bot Characters (matching the mockup) ─────────────────────────────

export const DEFAULT_BOTS: BotCharacter[] = [
  {
    id: 'savant-arb',
    name: 'SavANT',
    subtitle: 'Arb Bot',
    avatar: '/bots/savant.svg',
    status: 'Active',
    type: 'arbitrage',
    chainId: 369,
    contractAddress: '0x6B80C21471b11c5105075fDa703660d546082D87',
    color: '#4caf50',
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
    settings: {
      minSpreadBps: 30,
      maxTradeSize: '5000',
      routers: ['PulseX V2', 'PulseX V1', '9inch'],
      scanInterval: 3000,
    },
    createdAt: Date.now(),
  },
  {
    id: 'onlyfrens-vol',
    name: "OnlyFren's",
    subtitle: 'Volume Bot',
    avatar: '/bots/onlyfrens.svg',
    status: 'Standby',
    type: 'volume',
    chainId: 369,
    contractAddress: '0x14Dda65788CA7156914b6B494131d9D26535Ee82',
    color: '#00aff0',
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
    settings: {
      targetToken: '',
      tradeAmountMin: '10',
      tradeAmountMax: '100',
      intervalMin: 30,
      intervalMax: 300,
      buySellRatio: 0.6,
    },
    createdAt: Date.now(),
  },
  {
    id: 'gasfixiation-gas',
    name: 'GaS-Fix-iaTioN',
    subtitle: 'Gas Bot',
    avatar: '/bots/gasfixiation.svg',
    status: 'Standby',
    type: 'gas',
    chainId: 369,
    color: '#9c27b0',
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
    settings: {
      maxGasGwei: 500,
      targetGasGwei: 100,
      autoAdjust: true,
    },
    createdAt: Date.now(),
  },
  {
    id: 'ipb-printer',
    name: 'IPB',
    subtitle: 'Prints Money Machine',
    avatar: '/bots/ipb.svg',
    status: 'Active',
    type: 'printer',
    chainId: 369,
    color: '#ff9800',
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
    settings: {
      printInterval: 60,
      minProfit: '10',
      autoCompound: true,
    },
    createdAt: Date.now(),
  },
  {
    id: 'mev-hunter',
    name: 'PREDATØR',
    subtitle: 'MEV Hunter',
    avatar: '/bots/mev-hunter.svg',
    status: 'Standby',
    type: 'mev',
    chainId: 369,
    color: '#f44336',
    stats: { totalTrades: 0, profitLoss: '0', winRate: 0, uptime: '0h' },
    settings: {
      mempoolScan: true,
      frontrunProtection: true,
      sandwichDetection: true,
      maxGasMultiplier: 2.5,
      minProfitWei: '1000000000000000',
    },
    createdAt: Date.now(),
  },
];

// ── Bot Type Configs ─────────────────────────────────────────────────────────

export const BOT_TYPES = [
  { type: 'arbitrage', label: 'Arbitrage Bot', icon: 'AB', description: 'Cross-DEX price arbitrage' },
  { type: 'volume', label: 'Volume Bot', icon: 'VB', description: 'Generate trading volume (Print.Tires style)' },
  { type: 'gas', label: 'Gas Bot', icon: 'GB', description: 'Gas optimization and management' },
  { type: 'printer', label: 'Money Printer', icon: 'MP', description: 'Automated profit extraction' },
  { type: 'sniper', label: 'Sniper Bot', icon: 'SN', description: 'Token launch sniping' },
  { type: 'flash', label: 'Flash Loan Bot', icon: 'FL', description: 'Zero-capital flash loan arb' },
  { type: 'mev', label: 'MEV Hunter', icon: 'MV', description: 'Mempool monitoring & MEV extraction' },
  { type: 'custom', label: 'Custom Bot', icon: 'CB', description: 'Build your own bot configuration' },
] as const;

// ── Storage ──────────────────────────────────────────────────────────────────

const BOTS_KEY = 'only_bots_characters';

export function saveBots(bots: BotCharacter[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BOTS_KEY, JSON.stringify(bots));
}

export function loadBots(): BotCharacter[] {
  if (typeof window === 'undefined') return DEFAULT_BOTS;
  const raw = localStorage.getItem(BOTS_KEY);
  if (!raw) return DEFAULT_BOTS;
  try { return JSON.parse(raw); } catch { return DEFAULT_BOTS; }
}
