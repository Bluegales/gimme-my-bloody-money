import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers'; // Ensures we're importing ethers correctly

// Manually implementing parseEther
function parseEther(value) {
  const ether = parseFloat(value);
  return (ether * Math.pow(10, 18)).toString();
}

const PaymentReceiver = ({ account, setAccount }) => {
  const [details, setDetails] = useState({
    wallet: '',
    network: '',
    amount: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setDetails({
      wallet: query.get('wallet'),
      chainId: query.get('chain-id'),
      amount: query.get('amount'),
    });
  }, []);

  const handlePay = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to proceed with the payment.');
      return;
    }
    // is this needed?
    // if (!account) {
    //   setError('Please connect your wallet.');
    //   return;
    // }
    if (window.ethereum.networkVersion !== details.chainId) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: details.chainId }]
      });
    }
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); // Correct use of await to resolve the signer
      console.log("Signer object:", signer); // Now this should log the actual signer object, not a Promise
      console.log("Available methods on signer:", Object.keys(Object.getPrototypeOf(signer))); // This will list methods available on the signer object
  
      const transaction = {
        to: details.wallet,
        value: parseEther(details.amount.toString()),
        chainId: details.chainId
      };
  
      const txResponse = await signer.sendTransaction(transaction);
      console.log('Transaction sent:', txResponse);
    } catch (err) {
      console.error("Error while sending transaction:", err);
      setError(`Payment failed: ${err.message}`);
    }
  };  

  return (
    <div>
      <h1>Payment Details</h1>
      <p>Wallet Address: {details.wallet}</p>
      <p>Network: {details.network}</p>
      <p>Amount: {details.amount} ETH</p>
      <button onClick={handlePay}>Pay</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PaymentReceiver;
