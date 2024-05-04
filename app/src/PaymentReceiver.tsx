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

// async function executeContractFunction() {
//   try {
//     // Ensure the signer is connected
//     const signer = provider.getSigner();

//     // Initialize the contract
//     const contract = new ethers.Contract(
//       process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
//       abi,
//       signer
//     );

//     // Call the smart contract function
//     const tx = await contract.verifyAndExecute(
//       account.address!,
//       BigInt(proof!.merkle_root).toString(),
//       BigInt(proof!.nullifier_hash).toString(),
//       decodeAbiParameters(
//         parseAbiParameters('uint256[8]'),
//         proof!.proof
//       )[0]
//     );

//     // Wait for the transaction to be mined
//     await tx.wait();
//     setDone(true);
//   } catch (error) {
//     // Basic error handling; adapt as necessary for your use case
//     console.error(error);
//     throw new Error(error.reason || "Failed to execute the contract function.");
//   }
// }

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

  const checkWorldIdVerified = async () => {
    const baseSepolia = chains.find(chain => chain.chainId === 0x14a34)!;
    const baseSepoliaProvider = new ethers.JsonRpcProvider(baseSepolia.rpcUrl);
    const tokenABI = [
      "function getScore(address account) view returns (bool, int64)",
    ];    
    const reputationContract = new ethers.Contract("0xbD183dD402532f65f851c60cFa54140d7eE4E673", tokenABI, baseSepoliaProvider);
    const result = await reputationContract.getScore(params.wallet)
    const verified = result[0];
    const score = result[1];

    console.log(result)
    console.log(verified)
    console.log(score)
  }

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

  useEffect(() => {
    checkWorldIdVerified();
    checkForFunds().then(() => {
      console.log("has funds:", hasFunds)
      if (!hasFunds && params.currency === 'USDC') {
        checkForFundsOtherChains();
      }
    });
  }, [])

  const worldIdFeedback = async () => {
  }

  const payWithCCIP = async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask to proceed with the payment.');
      return;
    }
    const hexnetwork = '0x' + FundsOtherChain!.chainId.toString(16);
    if (window.ethereum.networkVersion !== hexnetwork) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexnetwork }]
        });
      } catch (error: any) {
        setError(`Error switching network: ${error.message}`);
        return;
      }
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    transferTokens(
      FundsOtherChain!.ccipName,
      FundsOtherChain!.rpcUrl,
      destChain.ccipName as NETWORK,
      destChain.rpcUrl,
      params.wallet,
      FundsOtherChain!.USDC,
      params.amount,
      signer)
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
        onClick={payWithCCIP}
        disabled={hasFunds || !FundsOtherChain}
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
        onSuccess={worldIdFeedback}>
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
        onSuccess={worldIdFeedback}>
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

export { };

export { };
