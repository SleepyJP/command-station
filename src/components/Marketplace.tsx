'use client';

import { BOT_TYPES } from '@/lib/botCharacters';
import { Download, Star, Users } from 'lucide-react';

export function Marketplace() {
  return (
    <div className="space-y-6">
      <div className="ob-main-card px-6 py-4">
        <h3 className="font-bold text-[16px] text-[#1a1a2e]">Bot Marketplace</h3>
        <p className="text-[12px] text-[#8a96a3] mt-1">Browse and install pre-built bot configurations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BOT_TYPES.map((bt) => (
          <div key={bt.type} className="ob-bot-card">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#00aff0]/20 to-[#00aff0]/5 border-2 border-[#00aff0]/20 flex items-center justify-center">
              <span className="text-xl font-black text-[#00aff0]">{bt.icon}</span>
            </div>
            <h4 className="font-bold text-[14px] text-[#1a1a2e]">{bt.label}</h4>
            <p className="text-[11px] text-[#8a96a3] mt-1 mb-4">{bt.description}</p>

            <div className="flex items-center justify-center gap-4 mb-4 text-[11px] text-[#8a96a3]">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-[#ff9800]" /> 4.8
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" /> 142
              </span>
            </div>

            <button className="ob-btn-launch w-full flex items-center justify-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Install
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
