import React from 'react';
import './App.css';

import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { transferTokens } from './ccip/ccip/src/transfer-token-function';
// import { decodeAbiParameters } from 'viem'

// 1. Get projectId
const projectId = '09e06ffc02686ab6657c8d5684310785'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

// 3. Create a metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})

const onSuccess = (result: any) => {
  console.log("Proof received from IDKit:\n", JSON.stringify(result));
  // const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], result.proof)[0]
  // console.log(unpackedProof)
  // console.log(result)
  // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
  window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
};

function App() {
  return (
    <div className="App">
      <body>
      <w3m-button />
      <IDKitWidget
    app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
    action="test"
    signal="0x11118B057bC0F7cBCF85f1e4d6B61CD5fFB22773"
    // On-chain only accepts Orb verifications
    // verification_level={VerificationLevel.Orb}
    // handleVerify={handleProof}
    onSuccess={onSuccess}>
    {({ open }) => (
      <button
        onClick={open}
      >
        Verify with World ID
      </button>
    )}
</IDKitWidget>
      </body>
    </div>
  );
}

export default App;
