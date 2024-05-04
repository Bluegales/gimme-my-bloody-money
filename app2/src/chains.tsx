import { NETWORK } from './ccip/ccip/src/config'

export interface Chains {
    chainId: number;
    name: string;
    ccipName: NETWORK;
    currency: string;
    rpcUrl: string;
    USDC: string;
}

export const chains = [
    {
        chainId: 1,
        name: 'Ethereum',
        ccipName: 'ethereumMainnet',
        currency: 'ETH',
        rpcUrl: 'https://cloudflare-eth.com',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    {
        chainId: 0x2105,
        name: 'Base',
        ccipName: 'baseMainnet',
        currency: 'ETH',
        rpcUrl: 'https://mainnet.base.org',
        USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    },
    {
        chainId: 0xa,
        name: 'OP Mainnet',
        ccipName: 'optimismMainnet',
        currency: 'ETH',
        rpcUrl: 'https://mainnet.optimism.io',
        USDC: '0x0b2c639c533813f4aa9d7837caf62653d097ff85'
    },
    {
        chainId: 0xa4b1,
        name: 'Arbitrum One',
        ccipName: 'arbitrumMainnet',
        currency: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    },
    {
        chainId: 0x14a34,
        name: 'Base Sepolia',
        ccipName: 'baseSepolia',
        currency: 'ETH',
        rpcUrl: 'https://sepolia.base.org',
        USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
    },
    {
        chainId: 0xaa36a7,
        name: 'Sepolia',
        ccipName: 'ethereumSepolia',
        currency: 'ETH',
        rpcUrl: 'https://rpc.sepolia.org',
        USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
]


//https://developers.circle.com/stablecoins/docs/usdc-on-test-networks
