// ═══════════════════════════════════════════════════════════════════════════════
// ONLY_BOTS - Viem-compatible ABI definitions for wagmi hooks
// ═══════════════════════════════════════════════════════════════════════════════

export const botControlAbi = [
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'treasury',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'paused',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'unpause',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawProfits',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawToken',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const sniperBotAbi = [
  ...botControlAbi,
  {
    type: 'function',
    name: 'addToQueue',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'maxGasPrice', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeSnipe',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const flashLoanBotAbi = [
  ...botControlAbi,
  {
    type: 'function',
    name: 'minProfitBps',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'setMinProfitBps',
    inputs: [{ name: 'bps', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'executeFlashArb',
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const arbitrageBotAbi = [
  ...botControlAbi,
  {
    type: 'function',
    name: 'executeArbitrage',
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'routerA', type: 'address' },
      { name: 'routerB', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

export const volumeBotAbi = [
  ...botControlAbi,
  {
    type: 'function',
    name: 'executeTrade',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'isBuy', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTradeInterval',
    inputs: [{ name: 'intervalSeconds', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

// Map bot type to contract address
export const BOT_CONTRACT_MAP: Record<string, `0x${string}`> = {
  SNIPER: '0xa35c6fd547c3b9DE4FaC917184f1444f0B2E25f0',
  FLASH_LOAN: '0xc3043fe1deEc6CD7aad87bf10742EDB09075a657',
  ARBITRAGE: '0x6B80C21471b11c5105075fDa703660d546082D87',
  VOLUME: '0x14Dda65788CA7156914b6B494131d9D26535Ee82',
};
