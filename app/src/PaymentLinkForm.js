import React, { useState, useEffect } from 'react';

const networks = {
  mainnet: 'Mainnet',
  sepolia: 'Sepolia',
  goerli: 'Goerli'
};

const PaymentLinkForm = ({ account }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [network, setNetwork] = useState('sepolia');
  const [amountETH, setAmountETH] = useState('');
  const [amountUSD, setAmountUSD] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (account) {
      setWalletAddress(account); // Automatically update the wallet address when the account is connected
    }
  }, [account]); // Listen for changes in the account

  const handleNetworkChange = (event) => {
    setNetwork(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmountETH(event.target.value);
    convertEthToUsd(event.target.value); // This function will call an API to convert ETH to USD
  };

  const convertEthToUsd = async (eth) => {
    const api_url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`;
    try {
      const response = await fetch(api_url);
      const data = await response.json();
      const usdValue = data.ethereum.usd * parseFloat(eth);
      setAmountUSD(usdValue.toFixed(2));
    } catch (error) {
      console.error('Error fetching USD value:', error);
    }
  };

  const generateLink = () => {
    const baseUrl = 'http://localhost:3000/pay';  // Adjusted for local development
    const newLink = `${baseUrl}?wallet=${walletAddress}&network=${network}&amount=${amountETH}`;
    setLink(newLink);
  };

  return (
    <div>
      <input
        type="text"
        value={walletAddress}
        onChange={(e) => setWalletAddress(e.target.value)}
        placeholder="Wallet Address (0x...)"
      />
      <select value={network} onChange={handleNetworkChange}>
        {Object.entries(networks).map(([key, name]) => (
          <option key={key} value={key}>{name}</option>
        ))}
      </select>
      <input
        type="number"
        value={amountETH}
        onChange={handleAmountChange}
        placeholder="Amount in ETH"
      />
      <p>Amount in USD: ${amountUSD}</p>
      <button onClick={generateLink}>Generate Link</button>
      {link && <div>
        <p>Payment Link: {link}</p>
        <button onClick={() => navigator.clipboard.writeText(link)}>Copy to Clipboard</button>
      </div>}
    </div>
  );
};

export default PaymentLinkForm;
