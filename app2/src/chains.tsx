export interface Network {
    chainId: number;
    name: string;
    currency: string;
    explorerUrl: string;
    rpcUrl: string;
    USDC: string;
}

export const chains = [
    {
        chainId: 1,
        name: 'Ethereum',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io',
        rpcUrl: 'https://cloudflare-eth.com',
        USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
    },
    {
        chainId: 0x14a34,
        name: 'Base Sepolia',
        currency: 'ETH',
        explorerUrl: 'https://sepolia.basescan.org/',
        rpcUrl: 'https://sepolia.base.org',
        USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
    },
    {
        chainId: 0xaa36a7,
        name: 'Sepolia',
        currency: 'ETH',
        explorerUrl: 'https://sepolia.etherscan.io/',
        rpcUrl: 'https://rpc.sepolia.org',
        USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    }
]


//https://developers.circle.com/stablecoins/docs/usdc-on-test-networks
