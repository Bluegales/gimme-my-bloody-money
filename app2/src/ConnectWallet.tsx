import React, { useState, useEffect } from 'react';

// Declaring a module to augment the Window type for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      networkVersion: string;
      request: ({ method }: { method: string, params?: any }) => Promise<string[]>;
      on: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener: (event: string, callback: (accounts: string[]) => void) => void;
    };
  }
}

interface ConnectWalletProps {
  setAccount: (account: string) => void;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ setAccount }) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]): void => {
      if (accounts.length === 0) {
        setError("Please connect to MetaMask.");
      } else if (accounts[0] !== undefined) {
        setAccount(accounts[0]);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [setAccount]);

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
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
