// ═══════════════════════════════════════════════════════════════════════════════
// ONLY_BOTS COMMAND STATION - WAGMI + RAINBOWKIT CONFIG
// PulseChain primary, Base + Ethereum secondary
// ═══════════════════════════════════════════════════════════════════════════════

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { mainnet, base, type Chain } from 'wagmi/chains';

// ── PulseChain Definition ───────────────────────────────────────────────────

export const pulsechain: Chain = {
  id: 369,
  name: 'PulseChain',
  nativeCurrency: { name: 'PLS', symbol: 'PLS', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.pulsechain.com'] },
  },
  blockExplorers: {
    default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' },
  },
};

// ── Wagmi Config ────────────────────────────────────────────────────────────

export const wagmiConfig = getDefaultConfig({
  appName: 'ONLY_BOTS Command Station',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'onlybots-command-station',
  chains: [pulsechain, base, mainnet],
  transports: {
    [pulsechain.id]: http('https://rpc.pulsechain.com'),
    [base.id]: http('https://mainnet.base.org'),
    [mainnet.id]: http('https://eth.llamarpc.com'),
  },
});
