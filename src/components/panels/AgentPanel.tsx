'use client';

import { useState } from 'react';
import { useCommandStore } from '@/store/commandStore';
import { SYSTEM_AGENTS, MISSION_TEMPLATES, type Agent, type Mission, type AgentClass } from '@/lib/agents';
import {
  Brain,
  Shield,
  Eye,
  TrendingUp,
  BarChart3,
  Lock,
  Plus,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Link,
} from 'lucide-react';

const AGENT_ICONS: Record<AgentClass, React.ElementType> = {
  AQUEMINI: Brain,
  SENTINEL: Shield,
  ORACLE: Eye,
  TRADER: TrendingUp,
  ANALYST: BarChart3,
  GUARDIAN: Lock,
};

const AGENT_COLORS: Record<AgentClass, string> = {
  AQUEMINI: 'text-violet-400',
  SENTINEL: 'text-red-400',
  ORACLE: 'text-cyan-400',
  TRADER: 'text-green-400',
  ANALYST: 'text-blue-400',
  GUARDIAN: 'text-amber-400',
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  OFFLINE: { bg: 'bg-gray-700/20', text: 'text-gray-500' },
  IDLE: { bg: 'bg-green-500/10', text: 'text-green-400' },
  ON_MISSION: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
  EXECUTING: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  ERROR: { bg: 'bg-red-500/10', text: 'text-red-400' },
};

export function AgentPanel() {
  const { agents, setAgents, updateAgentStatus, missions, addMission, bots } = useCommandStore();
  const [showMissions, setShowMissions] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [assigningBot, setAssigningBot] = useState<string | null>(null);

  // Initialize agents if empty
  if (agents.length === 0) {
    setAgents(SYSTEM_AGENTS);
  }

  const handleToggleAgent = (agent: Agent) => {
    const newStatus = agent.status === 'OFFLINE' ? 'IDLE' : 'OFFLINE';
    updateAgentStatus(agent.id, newStatus);
  };

  const handleLaunchMission = (templateIndex: number) => {
    const template = MISSION_TEMPLATES[templateIndex];
    const mission: Mission = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      status: 'OPEN',
      assignedAgents: [],
    };
    addMission(mission);
    setShowMissions(false);
  };

  const handleAssignAgentToBot = (agentId: string, botId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      const updated = agents.map((a) =>
        a.id === agentId ? { ...a, assignedBot: botId, status: 'IDLE' as const } : a
      );
      setAgents(updated);
    }
    setAssigningBot(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Agent Orchestrator</h2>
          <p className="text-sm text-gray-500 mt-1">
            AI agents that control bots autonomously. Assign missions, monitor execution.
          </p>
        </div>
        <button
          onClick={() => setShowMissions(!showMissions)}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Launch Mission
        </button>
      </div>

      {/* Mission Templates */}
      {showMissions && (
        <div className="bg-gray-900 border border-cyan-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Available Missions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MISSION_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() => handleLaunchMission(idx)}
                className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-cyan-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-medium text-sm">{template.title}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = AGENT_ICONS[agent.class];
          const color = AGENT_COLORS[agent.class];
          const status = STATUS_BADGE[agent.status] || STATUS_BADGE.OFFLINE;

          return (
            <div
              key={agent.id}
              className={`bg-gray-900 border rounded-xl p-5 transition-colors ${
                selectedAgent === agent.id ? 'border-violet-500/50' : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">{agent.name}</h3>
                    <p className="text-xs text-gray-500">{agent.class}</p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                  {agent.status}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-xs text-gray-500">Rep</p>
                  <p className="text-sm font-bold text-white">{agent.reputation}</p>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-xs text-gray-500">Missions</p>
                  <p className="text-sm font-bold text-white">{agent.missionsCompleted}</p>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <p className="text-xs text-gray-500">Earned</p>
                  <p className="text-sm font-bold text-white">{agent.totalEarnings}</p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="flex flex-wrap gap-1 mb-4">
                {agent.capabilities.map((cap) => (
                  <span key={cap} className="px-2 py-0.5 bg-gray-800 text-xs text-gray-500 rounded">
                    {cap}
                  </span>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleAgent(agent);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                    agent.status === 'OFFLINE'
                      ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                      : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                  }`}
                >
                  {agent.status === 'OFFLINE' ? (
                    <>
                      <Play className="w-3 h-3" /> Activate
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Deactivate
                    </>
                  )}
                </button>

                {bots.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAssigningBot(assigningBot === agent.id ? null : agent.id);
                      }}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white text-xs transition-colors"
                    >
                      <Link className="w-3 h-3" />
                      Assign Bot
                    </button>
                    {assigningBot === agent.id && (
                      <div className="absolute right-0 top-10 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50">
                        {bots.map((bot) => (
                          <button
                            key={bot.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignAgentToBot(agent.id, bot.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                          >
                            {bot.name} ({bot.type})
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assigned Bot */}
              {agent.assignedBot && (
                <div className="mt-3 bg-gray-800 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-500">
                    Controlling: <span className="text-cyan-400">{bots.find((b) => b.id === agent.assignedBot)?.name || 'Unknown'}</span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Missions */}
      {missions.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Active Missions</h3>
          <div className="space-y-3">
            {missions.map((mission) => (
              <div key={mission.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
                <div>
                  <h4 className="text-sm font-medium text-white">{mission.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{mission.description.slice(0, 100)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {new Date(mission.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    mission.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                    mission.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-400' :
                    mission.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                    'bg-gray-700/20 text-gray-400'
                  }`}>
                    {mission.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
