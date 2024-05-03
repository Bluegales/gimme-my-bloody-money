import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ensures we're importing ethers correctly
// import { chains } from './chains'; // Assumed type for chain
// import { createWeb3Modal, defaultConfig, Web3ModalConfig } from '@web3modal/ethers/react';

interface PaymentReceiverProps {
  account: string;
  setAccount: (account: string) => void;
}

interface PaymentDetails {
  wallet: string | null;
  chainId: string | null;
  currency: string | null;
  amount: string | null;
}

const query = new URLSearchParams(window.location.search);

const params = {
  wallet: query.get('wallet'),
  chainId: query.get('chain-id'),
  currency: query.get('currency'),
  amount: query.get('amount'),
};

console.log(params);
// console.log(chains);
// const chain = chains.find((c: Chain) => c.chainId === params.chainId) || chains[0];

// const projectId = '09e06ffc02686ab6657c8d5684310785';

// const metadata = {
//   name: 'My Website',
//   description: 'My Website description',
//   url: 'https://mywebsite.com',
//   icons: ['https://avatars.mywebsite.com/']
// };

// const ethersConfig: Web3ModalConfig = defaultConfig({
//   metadata,
//   enableEIP6963: true,
//   enableInjected: true,
//   enableCoinbase: true,
//   rpcUrl: '...', // used for the Coinbase SDK
//   defaultChainId: 1,
// });

// createWeb3Modal({
//   ethersConfig,
//   chains: [chain],
//   projectId,
//   enableAnalytics: true
// });

const parseEther = (value: string): string => {
  const ether = parseFloat(value);
  return (ether * Math.pow(10, 18)).toString();
};

const PaymentReceiver: React.FC<PaymentReceiverProps> = ({ account, setAccount }) => {
  // const [details, setDetails] = useState<PaymentDetails>({
  //   wallet: params.wallet,
  //   chainId: params.chainId,
  //   currency: params.currency,
  //   amount: params.amount,
  // });
  const [error, setError] = useState<string>('');

  // useEffect(() => {
  //   setDetails({
  //     wallet: query.get('wallet'),
  //     chainId: query.get('chain-id'),
  //     currency: query.get('currency'),
  //     amount: query.get('amount'),
  //   });
  // }, []);

  const handlePay = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to proceed with the payment.');
      return;
    }
    if (window.ethereum.networkVersion !== params.chainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: params.chainId }]
        });
      } catch (error: any) {
        setError(`Error switching network: ${error.message}`);
        return;
      }
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
    //   const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const transaction = {
        to: params.wallet!,
        value: parseEther(params.amount!),
        chainId: parseInt(params.chainId!)
      };
      const txResponse = await signer.sendTransaction(transaction);
      console.log('Transaction sent:', txResponse);
    } catch (err: any) {
      console.error("Error while sending transaction:", err);
      setError(`Payment failed: ${err.message}`);
    }
  };

  return (
    <div>
      {/* <w3m-button /> */}
      <h1>Payment Details</h1>
      <p>Wallet Address: {params.wallet}</p>
      <p>Network: {params.chainId}</p>
      <p>Amount: {params.amount} ETH</p>
      <button onClick={handlePay}>Pay</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PaymentReceiver;
