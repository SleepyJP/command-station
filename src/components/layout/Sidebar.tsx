'use client';

import { useCommandStore, type TabId } from '@/store/commandStore';
import {
  LayoutDashboard,
  Wallet,
  Bot,
  Brain,
  ArrowLeftRight,
  Settings,
} from 'lucide-react';

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'bots', label: 'Bots', icon: Bot },
  { id: 'agents', label: 'Agents', icon: Brain },
  { id: 'bridge', label: 'BridgeIT', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useCommandStore();

  return (
    <aside className="w-[240px] bg-[#0d0d1a] border-r border-[#1e1e35] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00aff0] to-[#0070a8] flex items-center justify-center shadow-lg shadow-[#00aff020]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-white tracking-tight">ONLY_BOTS</h1>
            <p className="text-[11px] text-[#666] font-medium">Command Station</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-[#1e1e35]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#00aff015] text-[#00aff0]'
                  : 'text-[#888] hover:text-white hover:bg-[#ffffff08]'
              }`}
            >
              {isActive && <div className="ob-active-indicator" />}
              <Icon className="w-[18px] h-[18px]" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-5 pt-3 border-t border-[#1e1e35]">
        <div className="text-[10px] text-[#444] text-center leading-relaxed">
          ONLY_BOTS v1.0
          <br />
          A Paisley Protocol Product
        </div>
      </div>
    </aside>
  );
}
