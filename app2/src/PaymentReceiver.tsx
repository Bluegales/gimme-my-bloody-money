import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { IDKitWidget } from '@worldcoin/idkit';
import { chains, Chains } from './chains';
import { transferTokens } from './ccip/ccip/src/transfer-token-function'
import { NETWORK } from './ccip/ccip/src/config'

interface PaymentReceiverProps {
  account: string;
  setAccount: (account: string) => void;
}

const query = new URLSearchParams(window.location.search);

const onSuccess = (result: any) => {
  console.log("Proof received from IDKit:\n", JSON.stringify(result));
  // const unpackedProof = decodeAbiParameters([{ type: 'uint256[8]' }], result.proof)[0]
  // console.log(unpackedProof)
  // console.log(result)
  // This is where you should perform frontend actions once a user has been verified, such as redirecting to a new page
  window.alert("Successfully verified with World ID! Your nullifier hash is: " + result.nullifier_hash);
};

const PaymentReceiver: React.FC<PaymentReceiverProps> = ({ account, setAccount }) => {
  const [error, setError] = useState<string>('');
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const [FundsOtherChain, setFundsOtherChain] = useState<Chains | null>(null);

  const params = {
    wallet: query.get('wallet')!,
    chainId: query.get('chain-id')!,
    currency: query.get('currency')!,
    amount: BigInt(query.get('amount')!),
  };
  const destChain = chains.find(chain => chain.chainId === Number(params.chainId))!;
  const destChainProvider = new ethers.JsonRpcProvider(destChain.rpcUrl);

  const checkForFunds = async () => {
    var balance: bigint;
    if (params.currency == 'ETH') {
      balance = await destChainProvider.getBalance(params.wallet);
    } else {
      const currency = params.currency as keyof Chains
      const tokenAddress = destChain[currency] as string;
      const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint amount) returns (bool)"
      ];
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, destChainProvider);
      const b = await tokenContract.balanceOf(params.wallet)
      balance = BigInt(b)
    }
    console.log("found: " + balance + "tokens")
    if (balance >= params.amount) {
      setHasFunds(true);
    } else {
      setHasFunds(false);
    }
  }

  const checkForFundsOtherChains = async () => {
    var testchains: number[] = []
    if (destChain.chainId === 0x14a34 || destChain.chainId === 0xaa36a7) {
      testchains = testchains.concat([0x14a34, 0xaa36a7])
    } else {
      testchains = testchains.concat([0x2105, 0xa, 0xa4b1, 0x1])
    }
    console.log('trying to find funds on chains:', testchains)
    for (var chainid of testchains) {
      const sourceChain = chains.find(chain => chain.chainId === chainid)!;
      const sourceChainProvider = new ethers.JsonRpcProvider(sourceChain.rpcUrl);
      const currency = params.currency as keyof Chains
      const tokenAddress = sourceChain[currency] as string;
      const tokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint amount) returns (bool)"
      ];
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, sourceChainProvider);
      const b = await tokenContract.balanceOf(params.wallet)
      const balance = BigInt(b)
      if (balance >= params.amount) {
        setFundsOtherChain(sourceChain as Chains);
        console.log("found founds on chain:", sourceChain)
        return
      }
    }
  }

  useEffect(()=>{
    checkForFunds().then(() => {
      console.log("has funds:", hasFunds)
      if (!hasFunds && params.currency === 'USDC') {
        checkForFundsOtherChains();
      }
    });
  }, [])
  
  const payWithCCIP = async (signer: ethers.Wallet) => {
    transferTokens("baseSepolia", destChain.ccipName as NETWORK, params.wallet, destChain.USDC, params.amount, signer)
  }

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
      const signer = await provider.getSigner();
      if (params.currency === 'ETH') {
        const transaction = {
          to: params.wallet!,
          value: params.amount,
          chainId: parseInt(params.chainId!)
        };
        const txResponse = await signer.sendTransaction(transaction);
        console.log('Transaction sent:', txResponse);
      } else {
        // assume erc20
        const currency = params.currency as keyof Chains
        const tokenAddress = destChain[currency] as string;
        const tokenABI = [
          "function balanceOf(address owner) view returns (uint256)",
          "function transfer(address to, uint amount) returns (bool)"
        ];
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
        try {
          const transaction = await tokenContract.transfer(params.wallet, params.amount);
          console.log('Transaction hash:', transaction.hash);
          const receipt = await transaction.wait();
          console.log('Transaction confirmed in block:', receipt.blockNumber);
        } catch (error) {
          console.error('Transfer failed:', error);
        }
      }
    } catch (err: any) {
      console.error("Error while sending transaction:", err);
      setError(`Payment failed: ${err.message}`);
    }
    // TODO check currency
  };

  var decimalAmount = Number(params.amount)
  if (params.currency === 'ETH') {
    decimalAmount /= 10 ** 18;
  } else if (params.currency === 'USDC') {
    decimalAmount /= 10 ** 6;
  }

  return (
    <div>
      <h2>Payment Details</h2>
      <p>Wallet Address: {params.wallet}</p>
      <p>Network: {destChain.name}</p>
      <p>Currenct: {params.currency}</p>
      <p>Amount: {decimalAmount} </p>
      <button 
        className="button_pay" 
        onClick={handlePay}
        disabled={!hasFunds}
        >
         {hasFunds ? "Pay" : "Insufficient funds"}
      </button>
      <button
        title="Pay using Chainlink CCIP if you have enough funds"
        className="button_pay"
        disabled={hasFunds || !FundsOtherChain }
      >
        {hasFunds || !FundsOtherChain ?  "CCIP" : "Pay with CCIP"}
      </button>
      <br></br>
      {/* <Feedback></Feedback> */}
      <IDKitWidget
        app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
        action="test"
        signal="0x1"
        // On-chain only accepts Orb verifications
        // verification_level={VerificationLevel.Orb}
        // handleVerify={handleProof}
        onSuccess={onSuccess}>
        {({ open }) => (
          <button className="button_spam"
            onClick={open}
          >
            Mark as spam
          </button>
        )}
      </IDKitWidget>
      <IDKitWidget
        app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
        action="test"
        signal="0x0"
        // On-chain only accepts Orb verifications
        // verification_level={VerificationLevel.Orb}
        // handleVerify={handleProof}
        onSuccess={onSuccess}>
        {({ open }) => (
          <button className="button_valid"
            onClick={open}
          >
            Mark as valid
          </button>
        )}
      </IDKitWidget>
      {/* <button onClick={feedbackSpam}>Mark as spam</button>
      <button onClick={feedbackLegit}>Mark as legit</button> */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default PaymentReceiver;

export { }
