import React, { useState, useEffect } from 'react';
import './App.css';
import { chains } from './chains';

interface PaymentLinkFormProps {
  account: string;
  // connectWallet: () => void;
}

const networks: { [key: string]: string } = {
  '0x1': 'Mainnet',
  '0xaa36a7': 'Sepolia',
  '0x14a34': 'Base Sepolia'
};

const PaymentLinkForm: React.FC<PaymentLinkFormProps> = ({ account }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [network, setNetwork] = useState<string>('0x1');
  const [amountETH, setAmountETH] = useState<string>('');
  const [amountUSD, setAmountUSD] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (account) {
      setWalletAddress(account);
      setShowModal(false); // Automatically hide modal once the wallet is connected
    }
  }, [account]);

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNetwork(event.target.value);
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAmountETH(event.target.value);
    convertEthToUsd(event.target.value);
  };

  const convertEthToUsd = async (eth: string) => {
    const api_url = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
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
    const baseUrl = 'http://localhost:3000/pay';
    const newLink = `${baseUrl}?wallet=${walletAddress}&chain-id=${network}&amount=${amountETH}`;
    setLink(newLink);
  };

  return (
    <div className="container">
      {!account ? (
        <>
          <div className="headline">GimmeMyBloody.Money</div>
          <img src="/noun.png" alt="Noun" className="noun-icon" />
          {/* <button className="button" onClick={connectWallet}>Connect Wallet</button> */}
          <span className="info-icon" onMouseEnter={() => setShowModal(true)} onMouseLeave={() => setShowModal(false)}>ℹ️</span>
          {showModal && (
            <div className="modal">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="input-group">
            <span className="eth-symbol">Ξ</span>
            <input
              type="text"
              className="input"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Wallet Address (0x...)"
            />
          </div>
          <select className="input" value={network} onChange={handleNetworkChange}>
            {Object.entries(networks).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            className="input"
            value={amountETH}
            onChange={handleAmountChange}
            placeholder="Amount in ETH"
          />
          <p className="wallet-address">Amount in USD: ${amountUSD}</p>
          <button className="button" onClick={generateLink}>Generate Link</button>
          {link && (
            <div>
              <p>Payment Link: {link}</p>
              <button className="button" onClick={() => navigator.clipboard.writeText(link)}>Copy to Clipboard</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentLinkForm;
