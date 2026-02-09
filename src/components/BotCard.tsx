'use client';

import type { BotCharacter } from '@/lib/botCharacters';

interface BotCardProps {
  bot: BotCharacter;
  onLaunch: (bot: BotCharacter) => void;
  onConfig: (bot: BotCharacter) => void;
}

function isImagePath(avatar: string): boolean {
  return avatar.startsWith('/') || avatar.startsWith('http') || avatar.startsWith('data:');
}

export function BotCard({ bot, onLaunch, onConfig }: BotCardProps) {
  const isActive = bot.status === 'Active';

  return (
    <div className="ob-bot-card">
      {/* Avatar */}
      <div
        className="w-24 h-24 mx-auto mb-3 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${bot.color}20, ${bot.color}08)`,
          border: `2px solid ${bot.color}30`,
        }}
      >
        {isImagePath(bot.avatar) ? (
          <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-black tracking-tight" style={{ color: bot.color }}>
            {bot.avatar}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-bold text-[15px] text-[#1a1a2e]">{bot.name}</h3>
      <p className="text-[12px] text-[#8a96a3] font-medium">- {bot.subtitle}</p>

      {/* Status */}
      <div className="flex items-center justify-center gap-2 mt-3 mb-3">
        <span className={isActive ? 'ob-status-active' : 'ob-status-standby'} />
        <span
          className="text-[12px] font-semibold"
          style={{ color: isActive ? '#4caf50' : '#8a96a3' }}
        >
          {bot.status}
        </span>
      </div>

      {/* Action Button */}
      {isActive ? (
        <button className="ob-btn-config" onClick={() => onConfig(bot)}>
          Config
        </button>
      ) : (
        <button className="ob-btn-launch" onClick={() => onLaunch(bot)}>
          Launch
        </button>
      )}
    </div>
  );
}
