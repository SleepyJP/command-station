'use client';

import { useEffect } from 'react';
import { useCommandStore } from '@/store/commandStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardPanel } from '@/components/panels/DashboardPanel';
import { WalletPanel } from '@/components/panels/WalletPanel';
import { BotPanel } from '@/components/panels/BotPanel';
import { AgentPanel } from '@/components/panels/AgentPanel';
import { BridgePanel } from '@/components/panels/BridgePanel';
import { SettingsPanel } from '@/components/panels/SettingsPanel';
import { LiveActivity } from '@/components/LiveActivity';
import { ToastContainer } from '@/components/Toast';
import { loadBotConfigs } from '@/lib/bots';
import { loadFleets } from '@/lib/wallet';
import { loadAgents, loadMissions, loadAssignments } from '@/lib/agents';

export default function CommandStation() {
  const { activeTab, setBots, setFleets, setAgents, setMissions, setAssignments } = useCommandStore();

  useEffect(() => {
    setBots(loadBotConfigs());
    setFleets(loadFleets());
    setAgents(loadAgents());
    setMissions(loadMissions());
    setAssignments(loadAssignments());
  }, [setBots, setFleets, setAgents, setMissions, setAssignments]);

  return (
    <div className="min-h-screen bg-[#0a0a14] flex">
      <ToastContainer />
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dashboard' && <DashboardPanel />}
            {activeTab === 'wallets' && <WalletPanel />}
            {activeTab === 'bots' && <BotPanel />}
            {activeTab === 'agents' && <AgentPanel />}
            {activeTab === 'bridge' && <BridgePanel />}
            {activeTab === 'settings' && <SettingsPanel />}
          </main>
          {/* Live Activity Sidebar — visible on dashboard and bots tabs */}
          {(activeTab === 'dashboard' || activeTab === 'bots') && (
            <aside className="w-[300px] flex-shrink-0 p-6 pl-0 overflow-y-auto">
              <LiveActivity />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
