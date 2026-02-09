'use client';

import { CHAIN_NAMES, CHAIN_RPC } from '@/lib/wallet';
import { TREASURY } from '@/lib/contracts';
import { Copy, Palette, Layout, Globe } from 'lucide-react';
import { useState } from 'react';

export function BotSettings() {
  const [copied, setCopied] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState('#00aff0');

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Theme Customization */}
      <div className="ob-main-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-[#00aff0]" />
          <h3 className="font-bold text-[16px] text-[#1a1a2e]">Appearance</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] text-[#8a96a3] font-semibold mb-1.5">Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-[#d4eaf7] cursor-pointer"
              />
              <span className="text-[13px] font-mono text-[#555]">{accentColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-[#8a96a3] font-semibold mb-1.5">Layout</label>
            <select className="w-full bg-[#f5faff] border-2 border-[#d4eaf7] rounded-xl px-4 py-2.5 text-[13px] text-[#1a1a2e]">
              <option>Grid View (Default)</option>
              <option>List View</option>
              <option>Compact View</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-[12px] text-[#8a96a3] font-semibold mb-1.5">Quick Colors</label>
          <div className="flex gap-2">
            {['#00aff0', '#4caf50', '#ff9800', '#9c27b0', '#f44336', '#607d8b', '#e91e63', '#00bcd4'].map((c) => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className="w-8 h-8 rounded-lg border-2 transition-all"
                style={{
                  background: c,
                  borderColor: accentColor === c ? '#1a1a2e' : 'transparent',
                  transform: accentColor === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Network Configuration */}
      <div className="ob-main-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-[#00aff0]" />
          <h3 className="font-bold text-[16px] text-[#1a1a2e]">Networks</h3>
        </div>
        <div className="space-y-2">
          {Object.entries(CHAIN_RPC).map(([chainId, rpc]) => (
            <div key={chainId} className="flex items-center justify-between bg-[#f5faff] border border-[#d4eaf7] rounded-xl p-3">
              <div>
                <p className="text-[13px] text-[#1a1a2e] font-semibold">{CHAIN_NAMES[Number(chainId)]}</p>
                <p className="text-[11px] text-[#8a96a3] font-mono">{rpc}</p>
              </div>
              <span className="text-[11px] text-[#8a96a3]">Chain {chainId}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Treasury */}
      <div className="ob-main-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="w-5 h-5 text-[#00aff0]" />
          <h3 className="font-bold text-[16px] text-[#1a1a2e]">Treasury</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Primary (EVM)', address: TREASURY },
            { label: 'ICP', address: 'iyupi-26e6a-z56ra-6a5tz-yyj6i-kvxe4-joccp-pgapo-vpcvb-zxtmq-oae' },
            { label: 'Solana', address: '2VoPPkUxL3iwic7kUzrgnvnKFr1Z8Zop15UArVKtdA4L' },
          ].map((t) => (
            <div key={t.label} className="flex items-center justify-between bg-[#f5faff] border border-[#d4eaf7] rounded-xl p-3">
              <div>
                <p className="text-[11px] text-[#8a96a3] font-semibold">{t.label}</p>
                <p className="text-[12px] text-[#1a1a2e] font-mono">{t.address}</p>
              </div>
              <button onClick={() => copy(t.address, t.label)} className="text-[#b0bec5] hover:text-[#00aff0]">
                {copied === t.label ? <span className="text-[10px] text-[#4caf50]">Copied</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-[11px] text-[#b0bec5] py-4">
        ONLY_BOTS v1.0 &middot; A Paisley Protocol Product
      </div>
    </div>
  );
}
