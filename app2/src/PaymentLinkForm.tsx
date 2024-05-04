import React, { useState, useEffect } from 'react';
import './App.css';
import { chains } from './chains';
import { IDKitWidget } from "@worldcoin/idkit";

interface PaymentLinkFormProps {
  account: string;
  // connectWallet: () => void;
}

const onSuccess = (result: any) => {
  console.log("Proof received from IDKit:\n", JSON.stringify(result));
  // const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], result.proof)[0]
  // console.log(unpackedProof)
  // console.log(result)
  // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
  window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
};

const PaymentLinkForm: React.FC<PaymentLinkFormProps> = ({ account }) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [network, setNetwork] = useState<string>('0x1');
  const [currency, setCurrency] = useState<string>('ETH');
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
    setNetwork(event.target.value)
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrency(event.target.value);
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
    const hexnetwork = '0x' + Number(network).toString(16);
    const newLink = `${baseUrl}?wallet=${walletAddress}&chain-id=${hexnetwork}&currency=${currency}&amount=${amountETH}`;
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
        <IDKitWidget
          app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
          action="test"
          signal="0x11118B057bC0F7cBCF85f1e4d6B61CD5fFB22773"
          // On-chain only accepts Orb verifications
          // verification_level={VerificationLevel.Orb}
          // handleVerify={handleProof}
          onSuccess={onSuccess}>
          {({ open }) => (
            <button className="button_worldid"
              onClick={open}
            >
              Verify with World ID
            </button>
          )}
      </IDKitWidget>
          <div className="input-group">
            <input
              type="text"
              className="input"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Wallet Address (0x...)"
            />
          </div>
          <select className="input" value={network} onChange={handleNetworkChange}>
            {chains.map((net) => (
                <option key={net.chainId} value={net.chainId}>{net.name}</option>
            ))}
        </select>
          <input
            type="number"
            className="input"
            value={amountETH}
            onChange={handleAmountChange}
            placeholder="eg. 0.0002"
          />
          <select className="button_currency" value={currency} onChange={handleCurrencyChange}>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
          </select>
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
