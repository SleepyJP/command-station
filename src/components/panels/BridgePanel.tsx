'use client';

import { TREASURY } from '@/lib/contracts';
import {
  ArrowLeftRight,
  ExternalLink,
  Shield,
  Activity,
  Globe,
} from 'lucide-react';

const BRIDGE_PRODUCTS = [
  {
    name: 'PaisleyBridgeGateway',
    description: 'UUPS upgradeable fee-extracting bridge gateway. EIP-712 signed operator requests, dual fee extraction.',
    status: 'READY TO DEPLOY',
    chain: 'Multi-chain',
    repo: '~/paisley-bridge-gateway/',
    features: ['UUPS Proxy', 'EIP-712 Signatures', 'Operator System', 'Protocol + Dev Fees', 'Emergency Withdrawal'],
    tests: '24/24 passing',
  },
  {
    name: 'TokenGate',
    description: 'PulseChain <-> ICP cross-chain bridge. Lock & Mint / Burn & Release with threshold signatures.',
    status: 'DEPLOYED',
    chain: 'PulseChain <-> ICP',
    repo: '~/paisley-protocol/src/bridge/TokenGate.sol',
    features: ['Lock & Mint', 'Burn & Release', 'Time-Locked Withdrawals', 'Multi-Sig Validators', 'Cross-Chain Messaging'],
    tests: 'Production',
  },
  {
    name: 'X402BridgePayment',
    description: 'HTTP 402 payment protocol for API monetization. USDC gasless payments via EIP-3009.',
    status: 'READY',
    chain: 'Base',
    repo: '~/bridge-it/src/X402BridgePayment.sol',
    features: ['EIP-3009 transferWithAuthorization', 'Gasless USDC Payments', 'Facilitator Settlement', 'API Monetization'],
    tests: 'Complete',
  },
  {
    name: 'BridgeIT Frontend',
    description: 'Next.js frontend with LI.FI integration, Stripe/Transak onramp, stained glass UI.',
    status: 'BUILT',
    chain: '100+ chains via LI.FI',
    repo: '~/bridgeit/',
    features: ['LI.FI Bridge Aggregator', 'Stripe Crypto Onramp', 'Transak Fiat Gateway', 'x402 Middleware', '40+ Chain Configs'],
    tests: 'Build passes',
  },
];

export function BridgePanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">BridgeIT Control</h2>
        <p className="text-sm text-gray-500 mt-1">
          Cross-chain bridge infrastructure under Paisley Protocol. Treasury: {TREASURY.slice(0, 6)}...{TREASURY.slice(-4)}
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-gray-400">Supported Chains</span>
          </div>
          <p className="text-2xl font-bold text-white">100+</p>
          <p className="text-xs text-gray-600">via LI.FI aggregator</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowLeftRight className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">Bridge Protocols</span>
          </div>
          <p className="text-2xl font-bold text-white">30+</p>
          <p className="text-xs text-gray-600">aggregated routes</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-gray-400">Gateway Tests</span>
          </div>
          <p className="text-2xl font-bold text-white">24/24</p>
          <p className="text-xs text-gray-600">all passing</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-gray-400">Fiat Onramps</span>
          </div>
          <p className="text-2xl font-bold text-white">2</p>
          <p className="text-xs text-gray-600">Stripe + Transak</p>
        </div>
      </div>

      {/* Bridge Products */}
      <div className="space-y-4">
        {BRIDGE_PRODUCTS.map((product) => (
          <div key={product.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    product.status === 'DEPLOYED' || product.status === 'BUILT'
                      ? 'bg-green-500/20 text-green-400'
                      : product.status.includes('READY')
                      ? 'bg-cyan-500/20 text-cyan-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
              </div>
              <span className="text-xs text-gray-600">{product.chain}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {product.features.map((feature) => (
                <span key={feature} className="px-2 py-1 bg-gray-800 text-xs text-gray-400 rounded">
                  {feature}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-600">
              <span className="font-mono">{product.repo}</span>
              <span>Tests: {product.tests}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy Actions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Deployment Commands</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Deploy PaisleyBridgeGateway to PulseChain</p>
            <code className="text-sm text-cyan-400 font-mono">
              cd ~/paisley-bridge-gateway && PRIVATE_KEY=0x... forge script script/Deploy.s.sol --rpc-url https://rpc.pulsechain.com --broadcast
            </code>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Deploy to Base</p>
            <code className="text-sm text-cyan-400 font-mono">
              cd ~/paisley-bridge-gateway && PRIVATE_KEY=0x... forge script script/Deploy.s.sol --rpc-url https://mainnet.base.org --broadcast
            </code>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2">Start BridgeIT Frontend</p>
            <code className="text-sm text-cyan-400 font-mono">
              cd ~/bridgeit && npm run dev
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
