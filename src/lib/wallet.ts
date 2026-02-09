// ═══════════════════════════════════════════════════════════════════════════════
// PAISLEY COMMAND STATION - WALLET MANAGER
// Generate HD wallets, manage bot fleet, export keys
// ═══════════════════════════════════════════════════════════════════════════════

import { HDNodeWallet, Mnemonic, Wallet, JsonRpcProvider, formatEther, parseEther } from 'ethers';

// ── Types ────────────────────────────────────────────────────────────────────

export interface BotWallet {
  index: number;
  name: string;
  role: WalletRole;
  address: string;
  privateKey: string;
  derivationPath: string;
  balance?: string;
  nonce?: number;
  active: boolean;
}

export interface WalletFleet {
  id: string;
  name: string;
  mnemonic: string;
  createdAt: number;
  wallets: BotWallet[];
  chainId: number;
}

export type WalletRole =
  | 'MASTER'
  | 'ARBITER'
  | 'HUNTER'
  | 'PUMPER'
  | 'FLASHER'
  | 'SNIPER'
  | 'PREDATOR'
  | 'VOLUME'
  | 'SCOUT'
  | 'RESERVE';

// ── Default Fleet Configuration ──────────────────────────────────────────────

export const DEFAULT_FLEET_ROLES: { role: WalletRole; name: string; count: number }[] = [
  { role: 'MASTER', name: 'Master Controller', count: 1 },
  { role: 'ARBITER', name: 'Arbitrage Executor', count: 3 },
  { role: 'HUNTER', name: 'Opportunity Hunter', count: 2 },
  { role: 'PUMPER', name: 'Volume Operator', count: 2 },
  { role: 'FLASHER', name: 'Flash Loan Executor', count: 1 },
  { role: 'SNIPER', name: 'Token Sniper', count: 1 },
  { role: 'PREDATOR', name: 'MEV Predator', count: 1 },
];

// ── Chain RPC Endpoints ──────────────────────────────────────────────────────

export const CHAIN_RPC: Record<number, string> = {
  369: 'https://rpc.pulsechain.com',
  8453: 'https://mainnet.base.org',
  1: 'https://eth.llamarpc.com',
};

export const CHAIN_NAMES: Record<number, string> = {
  369: 'PulseChain',
  8453: 'Base',
  1: 'Ethereum',
};

// ── Wallet Generation ────────────────────────────────────────────────────────

const HD_PATH_PREFIX = "m/44'/60'/0'/0";

export function generateMnemonic(): string {
  const wallet = HDNodeWallet.createRandom();
  return wallet.mnemonic!.phrase;
}

export function deriveWallet(mnemonic: string, index: number): { address: string; privateKey: string; path: string } {
  const path = `${HD_PATH_PREFIX}/${index}`;
  const mn = Mnemonic.fromPhrase(mnemonic);
  const hdNode = HDNodeWallet.fromMnemonic(mn, path);
  return {
    address: hdNode.address,
    privateKey: hdNode.privateKey,
    path,
  };
}

export function generateFleet(
  name: string,
  chainId: number,
  mnemonic?: string,
  roles?: typeof DEFAULT_FLEET_ROLES
): WalletFleet {
  const phrase = mnemonic || generateMnemonic();
  const fleetRoles = roles || DEFAULT_FLEET_ROLES;

  let walletIndex = 0;
  const wallets: BotWallet[] = [];

  for (const roleConfig of fleetRoles) {
    for (let i = 0; i < roleConfig.count; i++) {
      const derived = deriveWallet(phrase, walletIndex);
      const suffix = roleConfig.count > 1 ? ` ${String.fromCharCode(65 + i)}` : '';
      wallets.push({
        index: walletIndex,
        name: `${roleConfig.name}${suffix}`,
        role: roleConfig.role,
        address: derived.address,
        privateKey: derived.privateKey,
        derivationPath: derived.path,
        active: true,
      });
      walletIndex++;
    }
  }

  return {
    id: crypto.randomUUID(),
    name,
    mnemonic: phrase,
    createdAt: Date.now(),
    wallets,
    chainId,
  };
}

// ── Balance Queries ──────────────────────────────────────────────────────────

export async function getWalletBalance(address: string, chainId: number): Promise<string> {
  const rpc = CHAIN_RPC[chainId];
  if (!rpc) return '0';
  const provider = new JsonRpcProvider(rpc);
  const balance = await provider.getBalance(address);
  return formatEther(balance);
}

export async function getFleetBalances(fleet: WalletFleet): Promise<BotWallet[]> {
  const provider = new JsonRpcProvider(CHAIN_RPC[fleet.chainId]);
  const updated = await Promise.all(
    fleet.wallets.map(async (w) => {
      try {
        const [balance, nonce] = await Promise.all([
          provider.getBalance(w.address),
          provider.getTransactionCount(w.address),
        ]);
        return { ...w, balance: formatEther(balance), nonce };
      } catch {
        return { ...w, balance: '0', nonce: 0 };
      }
    })
  );
  return updated;
}

// ── Fund Distribution ────────────────────────────────────────────────────────

export async function fundWallet(
  fromPrivateKey: string,
  toAddress: string,
  amountEther: string,
  chainId: number
): Promise<string> {
  const provider = new JsonRpcProvider(CHAIN_RPC[chainId]);
  const signer = new Wallet(fromPrivateKey, provider);
  const tx = await signer.sendTransaction({
    to: toAddress,
    value: parseEther(amountEther),
  });
  const receipt = await tx.wait();
  return receipt!.hash;
}

export async function distributeToFleet(
  masterPrivateKey: string,
  fleet: WalletFleet,
  amountPerWallet: string
): Promise<{ wallet: string; txHash: string; error?: string }[]> {
  const results: { wallet: string; txHash: string; error?: string }[] = [];
  const provider = new JsonRpcProvider(CHAIN_RPC[fleet.chainId]);
  const signer = new Wallet(masterPrivateKey, provider);

  for (const w of fleet.wallets) {
    if (w.role === 'MASTER') continue;
    try {
      const tx = await signer.sendTransaction({
        to: w.address,
        value: parseEther(amountPerWallet),
      });
      const receipt = await tx.wait();
      results.push({ wallet: w.address, txHash: receipt!.hash });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ wallet: w.address, txHash: '', error: msg });
    }
  }

  return results;
}

// ── Fleet Recall (sweep funds back to master) ────────────────────────────────

export async function recallFleetFunds(
  fleet: WalletFleet,
  masterAddress: string
): Promise<{ wallet: string; txHash: string; amount: string; error?: string }[]> {
  const results: { wallet: string; txHash: string; amount: string; error?: string }[] = [];
  const provider = new JsonRpcProvider(CHAIN_RPC[fleet.chainId]);

  for (const w of fleet.wallets) {
    if (w.role === 'MASTER') continue;
    try {
      const signer = new Wallet(w.privateKey, provider);
      const balance = await provider.getBalance(w.address);
      const gasPrice = (await provider.getFeeData()).gasPrice || 0n;
      const gasCost = gasPrice * 21000n;

      if (balance <= gasCost) {
        results.push({ wallet: w.address, txHash: '', amount: '0', error: 'Insufficient for gas' });
        continue;
      }

      const sendAmount = balance - gasCost;
      const tx = await signer.sendTransaction({
        to: masterAddress,
        value: sendAmount,
        gasLimit: 21000,
      });
      const receipt = await tx.wait();
      results.push({ wallet: w.address, txHash: receipt!.hash, amount: formatEther(sendAmount) });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      results.push({ wallet: w.address, txHash: '', amount: '0', error: msg });
    }
  }

  return results;
}

// ── Storage Helpers (localStorage) ───────────────────────────────────────────

const FLEET_STORAGE_KEY = 'paisley_command_fleets';

export function saveFleet(fleet: WalletFleet): void {
  if (typeof window === 'undefined') return;
  const existing = loadFleets();
  const idx = existing.findIndex((f) => f.id === fleet.id);
  if (idx >= 0) {
    existing[idx] = fleet;
  } else {
    existing.push(fleet);
  }
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(existing));
}

export function loadFleets(): WalletFleet[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(FLEET_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function deleteFleet(fleetId: string): void {
  if (typeof window === 'undefined') return;
  const existing = loadFleets().filter((f) => f.id !== fleetId);
  localStorage.setItem(FLEET_STORAGE_KEY, JSON.stringify(existing));
}
