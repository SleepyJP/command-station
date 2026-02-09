// ═══════════════════════════════════════════════════════════════════════════════
// PAISLEY COMMAND STATION - AGENT ORCHESTRATOR
// Control AI agents, assign missions, monitor autonomous operations
// ═══════════════════════════════════════════════════════════════════════════════

import { Contract, JsonRpcProvider, Wallet, parseEther, formatEther } from 'ethers';
import { CHAIN_RPC } from './wallet';

// ── Types ────────────────────────────────────────────────────────────────────

export type AgentClass = 'AQUEMINI' | 'SENTINEL' | 'ORACLE' | 'TRADER' | 'ANALYST' | 'GUARDIAN';

export type AgentStatus = 'OFFLINE' | 'IDLE' | 'ON_MISSION' | 'EXECUTING' | 'ERROR';

export type MissionStatus = 'OPEN' | 'IN_PROGRESS' | 'CONSENSUS' | 'COMPLETED' | 'FAILED';

export interface Agent {
  id: string;
  name: string;
  class: AgentClass;
  status: AgentStatus;
  reputation: number;
  missionsCompleted: number;
  totalEarnings: string;
  capabilities: string[];
  assignedBot?: string;
  lastActive: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  reward: string;
  assignedAgents: string[];
  createdAt: number;
  completedAt?: number;
  result?: string;
}

// ── Default Agents ───────────────────────────────────────────────────────────

export const SYSTEM_AGENTS: Agent[] = [
  {
    id: 'aquemini-001',
    name: 'AQUEMINI Prime',
    class: 'AQUEMINI',
    status: 'IDLE',
    reputation: 100,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['BUILD', 'REVIEW', 'DEPLOY', 'TRADE', 'ANALYZE', 'MONITOR'],
    lastActive: Date.now(),
  },
  {
    id: 'sentinel-001',
    name: 'SENTINEL Alpha',
    class: 'SENTINEL',
    status: 'IDLE',
    reputation: 85,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['MONITOR', 'ALERT', 'PAUSE', 'DEFEND'],
    lastActive: Date.now(),
  },
  {
    id: 'trader-001',
    name: 'TRADER Viper',
    class: 'TRADER',
    status: 'IDLE',
    reputation: 90,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['TRADE', 'ARBITRAGE', 'SNIPE', 'VOLUME'],
    lastActive: Date.now(),
  },
  {
    id: 'analyst-001',
    name: 'ANALYST Cortex',
    class: 'ANALYST',
    status: 'IDLE',
    reputation: 88,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['ANALYZE', 'PREDICT', 'SCAN', 'REPORT'],
    lastActive: Date.now(),
  },
  {
    id: 'oracle-001',
    name: 'ORACLE Nexus',
    class: 'ORACLE',
    status: 'IDLE',
    reputation: 92,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['PRICE_FEED', 'DATA', 'CROSS_CHAIN', 'VERIFY'],
    lastActive: Date.now(),
  },
  {
    id: 'guardian-001',
    name: 'GUARDIAN Shield',
    class: 'GUARDIAN',
    status: 'IDLE',
    reputation: 95,
    missionsCompleted: 0,
    totalEarnings: '0',
    capabilities: ['PROTECT', 'RISK_ASSESS', 'CIRCUIT_BREAK', 'RECOVER'],
    lastActive: Date.now(),
  },
];

// ── Mission Templates ────────────────────────────────────────────────────────

export const MISSION_TEMPLATES: Omit<Mission, 'id' | 'createdAt'>[] = [
  {
    title: '24/7 Arbitrage Scanning',
    description: 'Continuously scan PulseX V1/V2, 9inch, and 9mm for cross-DEX arbitrage opportunities. Execute profitable trades automatically.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
  {
    title: 'MEV Protection Patrol',
    description: 'Monitor mempool for sandwich attacks targeting our wallets. Deploy counter-strategies when detected.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
  {
    title: 'New Token Scout',
    description: 'Watch for new token launches on PUMP.FUD and PulseX. Evaluate tokenomics, check for honeypots, report promising opportunities.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
  {
    title: 'Volume Generation Campaign',
    description: 'Generate organic-looking trading volume for specified tokens using multiple wallets with randomized amounts and timing.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
  {
    title: 'Cross-Chain Bridge Monitor',
    description: 'Monitor BridgeIT TokenGate for pending deposits/withdrawals. Validate ICP confirmations. Alert on delays.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
  {
    title: 'Treasury Health Check',
    description: 'Audit all treasury addresses across chains. Track incoming fees, verify distributions, report anomalies.',
    status: 'OPEN',
    reward: '0',
    assignedAgents: [],
  },
];

// ── Agent-Bot Assignment ─────────────────────────────────────────────────────

export interface AgentBotAssignment {
  agentId: string;
  botId: string;
  mission?: string;
  autoExecute: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  maxLossPerTrade: string;
  maxDailyLoss: string;
}

// ── Storage ──────────────────────────────────────────────────────────────────

const AGENTS_STORAGE_KEY = 'paisley_command_agents';
const MISSIONS_STORAGE_KEY = 'paisley_command_missions';
const ASSIGNMENTS_STORAGE_KEY = 'paisley_command_assignments';

export function saveAgents(agents: Agent[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
}

export function loadAgents(): Agent[] {
  if (typeof window === 'undefined') return SYSTEM_AGENTS;
  const raw = localStorage.getItem(AGENTS_STORAGE_KEY);
  if (!raw) return SYSTEM_AGENTS;
  try {
    return JSON.parse(raw);
  } catch {
    return SYSTEM_AGENTS;
  }
}

export function saveMissions(missions: Mission[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(missions));
}

export function loadMissions(): Mission[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MISSIONS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAssignments(assignments: AgentBotAssignment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments));
}

export function loadAssignments(): AgentBotAssignment[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
