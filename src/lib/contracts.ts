// ═══════════════════════════════════════════════════════════════════════════════
// PAISLEY COMMAND STATION - CONTRACT ADDRESSES & ABIs
// All deployed contracts across the ecosystem
// ═══════════════════════════════════════════════════════════════════════════════

export const TREASURY = '0x49bBEFa1d94702C0e9a5EAdDEc7c3C5D3eb9086B';
export const TREASURY_DEV1 = '0xdBDA1341890EFCc30734EEC5d5a462a69a29b0B7';
export const TREASURY_DEV2 = '0x4bD4f261e7057fC8eA8127E6CF96e4102cc4C8fB';

// ── Deployed Contract Addresses ──────────────────────────────────────────────

export interface DeployedContract {
  name: string;
  address: string;
  chainId: number;
  product: string;
  type: 'bot' | 'bridge' | 'launchpad' | 'dex' | 'token' | 'utility' | 'agent';
  abi?: string;
}

export const DEPLOYED_CONTRACTS: DeployedContract[] = [
  // ── MEV Bots (PulseChain) ────────────────────────────────────────────────
  {
    name: 'SniperBot',
    address: '0xa35c6fd547c3b9DE4FaC917184f1444f0B2E25f0',
    chainId: 369,
    product: 'ONLY_BOTS',
    type: 'bot',
  },
  {
    name: 'FlashLoanBot',
    address: '0xc3043fe1deEc6CD7aad87bf10742EDB09075a657',
    chainId: 369,
    product: 'ONLY_BOTS',
    type: 'bot',
  },

  {
    name: 'ArbitrageBot',
    address: '0x6B80C21471b11c5105075fDa703660d546082D87',
    chainId: 369,
    product: 'ONLY_BOTS',
    type: 'bot',
  },
  {
    name: 'VolumeBot',
    address: '0x14Dda65788CA7156914b6B494131d9D26535Ee82',
    chainId: 369,
    product: 'ONLY_BOTS',
    type: 'bot',
  },

  // ── BridgeIT Token (PulseChain) ──────────────────────────────────────────
  {
    name: 'BridgeIT Token',
    address: '0x43525d89507bb7423bee6b9e9075d3b14874b776',
    chainId: 369,
    product: 'BridgeIT',
    type: 'token',
  },

  // ── DEX Infrastructure ───────────────────────────────────────────────────
  {
    name: 'PulseX V2 Router',
    address: '0x165C3410fC91EF562C50559f7d2289fEbed552d9',
    chainId: 369,
    product: 'External',
    type: 'dex',
  },
  {
    name: 'PulseX V1 Router',
    address: '0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02',
    chainId: 369,
    product: 'External',
    type: 'dex',
  },
  {
    name: 'WPLS',
    address: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
    chainId: 369,
    product: 'External',
    type: 'token',
  },
];

// ── Bot Contract ABIs (simplified for control) ───────────────────────────────

export const SNIPER_BOT_ABI = [
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function addToQueue(address token, uint256 amount, uint256 maxGasPrice) external',
  'function removeFromQueue(address token) external',
  'function executeSnipe(address token) external',
  'function withdrawProfits() external',
  'function withdrawToken(address token) external',
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
] as const;

export const FLASH_LOAN_BOT_ABI = [
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function executeFlashArb(address tokenA, address tokenB, uint256 amount, address[] calldata path) external',
  'function withdrawProfits() external',
  'function withdrawToken(address token) external',
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
  'function minProfitBps() view returns (uint256)',
  'function setMinProfitBps(uint256 bps) external',
] as const;

export const ARBITRAGE_BOT_ABI = [
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function executeArbitrage(address tokenA, address tokenB, uint256 amountIn, address routerA, address routerB) external',
  'function withdrawProfits() external',
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
] as const;

export const VOLUME_BOT_ABI = [
  'function owner() view returns (address)',
  'function treasury() view returns (address)',
  'function executeTrade(address token, uint256 amount, bool isBuy) external',
  'function setTradeInterval(uint256 intervalSeconds) external',
  'function withdrawProfits() external',
  'function pause() external',
  'function unpause() external',
  'function paused() view returns (bool)',
] as const;

// ── TokenGate ABI (BridgeIT PulseChain <-> ICP) ─────────────────────────────

export const TOKEN_GATE_ABI = [
  'function bridgeToICP(address token, uint256 amount, string calldata icpRecipient) external payable returns (uint256)',
  'function bridgePLSToICP(string calldata icpRecipient) external payable returns (uint256)',
  'function confirmDeposit(uint256 depositId, bytes32 icpTxHash) external',
  'function initiateWithdrawal(address recipient, address token, uint256 amount, string calldata icpSender, bytes32 icpTxHash) external returns (uint256)',
  'function completeWithdrawal(uint256 withdrawalId) external',
  'function getBridgeStats() view returns (uint256 totalDeposits, uint256 totalWithdrawals, uint256 totalMessages, uint256 totalVolume)',
  'function depositCount() view returns (uint256)',
  'function withdrawalCount() view returns (uint256)',
  'function totalBridgedVolume() view returns (uint256)',
  'function paused() view returns (bool)',
  'function pause(bool _paused) external',
  'function addSupportedToken(address token, string calldata icpTokenId, uint8 decimals) external',
] as const;

// ── PaisleyBridgeGateway ABI ─────────────────────────────────────────────────

export const BRIDGE_GATEWAY_ABI = [
  'function protocolFeeRecipient() view returns (address)',
  'function protocolFeeBps() view returns (uint16)',
  'function isOperator(address) view returns (bool)',
  'function isPaused() view returns (bool)',
  'function isProcessed(bytes32) view returns (bool)',
  'function pause() external',
  'function unpause() external',
  'function setProtocolFee(uint16 feeBps, address recipient) external',
  'function addOperator(address operator) external',
  'function removeOperator(address operator) external',
] as const;

// ── Helper: Get contracts by product ─────────────────────────────────────────

export function getContractsByProduct(product: string): DeployedContract[] {
  return DEPLOYED_CONTRACTS.filter((c) => c.product === product);
}

export function getContractsByChain(chainId: number): DeployedContract[] {
  return DEPLOYED_CONTRACTS.filter((c) => c.chainId === chainId);
}

export function getContractsByType(type: DeployedContract['type']): DeployedContract[] {
  return DEPLOYED_CONTRACTS.filter((c) => c.type === type);
}
