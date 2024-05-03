import React, { useState, useEffect } from 'react';
//import { ethers } from 'ethers';

const ConnectWallet = ({ setAccount }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setError("Please connect to MetaMask.");
    } else if (accounts[0] !== undefined) {
      setAccount(accounts[0]);
    }
  };

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError("Please install MetaMask.");
    }
  };

  return (
    <div>
      <button onClick={connectWalletHandler}>Connect Wallet</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ConnectWallet;
