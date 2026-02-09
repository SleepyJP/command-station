// ═══════════════════════════════════════════════════════════════════════════════
// PAISLEY COMMAND STATION - ZUSTAND STORE
// Central state management for the entire command station
// ═══════════════════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import type { WalletFleet, BotWallet } from '@/lib/wallet';
import type { BotConfig, BotStatus } from '@/lib/bots';
import type { Agent, Mission, AgentBotAssignment } from '@/lib/agents';

// ── Types ────────────────────────────────────────────────────────────────────

export type TabId = 'dashboard' | 'wallets' | 'bots' | 'agents' | 'bridge' | 'settings';

interface CommandState {
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Wallet Fleet
  fleets: WalletFleet[];
  activeFleetId: string | null;
  setFleets: (fleets: WalletFleet[]) => void;
  setActiveFleet: (id: string | null) => void;
  addFleet: (fleet: WalletFleet) => void;
  removeFleet: (id: string) => void;
  updateWalletBalances: (fleetId: string, wallets: BotWallet[]) => void;

  // Bots
  bots: BotConfig[];
  setBots: (bots: BotConfig[]) => void;
  addBot: (bot: BotConfig) => void;
  updateBotStatus: (botId: string, status: BotStatus) => void;
  updateBotStats: (botId: string, stats: Partial<BotConfig['stats']>) => void;
  removeBot: (botId: string) => void;

  // Agents
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  updateAgentStatus: (agentId: string, status: Agent['status']) => void;

  // Missions
  missions: Mission[];
  setMissions: (missions: Mission[]) => void;
  addMission: (mission: Mission) => void;

  // Assignments
  assignments: AgentBotAssignment[];
  setAssignments: (assignments: AgentBotAssignment[]) => void;
  addAssignment: (assignment: AgentBotAssignment) => void;

  // Global
  selectedChainId: number;
  setSelectedChainId: (id: number) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useCommandStore = create<CommandState>((set) => ({
  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Wallet Fleet
  fleets: [],
  activeFleetId: null,
  setFleets: (fleets) => set({ fleets }),
  setActiveFleet: (id) => set({ activeFleetId: id }),
  addFleet: (fleet) => set((s) => ({ fleets: [...s.fleets, fleet] })),
  removeFleet: (id) =>
    set((s) => ({
      fleets: s.fleets.filter((f) => f.id !== id),
      activeFleetId: s.activeFleetId === id ? null : s.activeFleetId,
    })),
  updateWalletBalances: (fleetId, wallets) =>
    set((s) => ({
      fleets: s.fleets.map((f) => (f.id === fleetId ? { ...f, wallets } : f)),
    })),

  // Bots
  bots: [],
  setBots: (bots) => set({ bots }),
  addBot: (bot) => set((s) => ({ bots: [...s.bots, bot] })),
  updateBotStatus: (botId, status) =>
    set((s) => ({
      bots: s.bots.map((b) => (b.id === botId ? { ...b, status } : b)),
    })),
  updateBotStats: (botId, stats) =>
    set((s) => ({
      bots: s.bots.map((b) =>
        b.id === botId ? { ...b, stats: { ...b.stats, ...stats } } : b
      ),
    })),
  removeBot: (botId) => set((s) => ({ bots: s.bots.filter((b) => b.id !== botId) })),

  // Agents
  agents: [],
  setAgents: (agents) => set({ agents }),
  updateAgentStatus: (agentId, status) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agentId ? { ...a, status, lastActive: Date.now() } : a)),
    })),

  // Missions
  missions: [],
  setMissions: (missions) => set({ missions }),
  addMission: (mission) => set((s) => ({ missions: [...s.missions, mission] })),

  // Assignments
  assignments: [],
  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) => set((s) => ({ assignments: [...s.assignments, assignment] })),

  // Global
  selectedChainId: 369,
  setSelectedChainId: (id) => set({ selectedChainId: id }),
  isConnected: false,
  setIsConnected: (connected) => set({ isConnected: connected }),
}));
