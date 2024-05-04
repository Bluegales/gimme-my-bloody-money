import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { IDKitWidget, ISuccessResult } from '@worldcoin/idkit';
import { chains, Chains } from './chains';
import { transferTokens } from './ccip/ccip/src/transfer-token-function'
import { NETWORK } from './ccip/ccip/src/config'

interface PaymentReceiverProps {
  account: string;
  setAccount: (account: string) => void;
}

const query = new URLSearchParams(window.location.search);

const PaymentReceiver: React.FC<PaymentReceiverProps> = ({ account, setAccount }) => {
  const [error, setError] = useState<string>('');
  const [hasFunds, setHasFunds] = useState<boolean>(false);
  const [FundsOtherChain, setFundsOtherChain] = useState<Chains | null>(null);
  const [positiveFeedback, setpositiveFeedback] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [reputationScore, setReputationScore] = useState<number | null>(null);

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
    setIsVerified(verified)
    setReputationScore(score)
    console.log(reputationScore)
  }

  const checkForFunds = async () => {
    if (!window.ethereum) {
      console.log("could not check funds")
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    var balance: bigint;
    if (params.currency == 'ETH') {
      balance = await destChainProvider.getBalance(signer.address);
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
    if (!window.ethereum) {
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
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
      const b = await tokenContract.balanceOf(signer.address)
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

  const worldIdFeedback = async (proof: ISuccessResult) => {
    console.log("Proof received from IDKit:\n", JSON.stringify(proof));
    if (!window.ethereum) {
      return;
    }
    const base = '0x14a34'
    if (window.ethereum.networkVersion !== base) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: base }]
        });
      } catch (error: any) {
        console.log(error)
        return;
      }
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const abi = [
      "function feedback(address signal, address account, uint256 root, uint256 nullifierHash, uint256[8] calldata proof) external"
    ];
    const contract = new ethers.Contract(
      "0xbD183dD402532f65f851c60cFa54140d7eE4E673",
      abi,
      signer
    );
    const coder = new ethers.AbiCoder;
  
    const types = ['uint256[8]'];
    const signal = positiveFeedback ? "0x0000000000000000000000000000000000000001" : "0x0000000000000000000000000000000000000000";
    const decodedData = coder.decode(types, proof.proof)[0];
    var mutableDecodedData = [...decodedData];
    const res = await contract.feedback(
      signal,
      params.wallet,
      BigInt(proof.merkle_root), 
      BigInt(proof.nullifier_hash),
      mutableDecodedData,
    )
    console.log(res);
    window.alert("Successfully verified with World ID! Your nullifier hash is: " + proof.nullifier_hash);
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

  function setFeedbackAndOpen(feedback: boolean, open: () => void) {

  }

  return (  
    <div>
      <p>--------------------</p>
      <h2>Payment Details</h2> 
      {/* Verify Personhood */}
      <div> {isVerified === true && (
        <div><img src="verified.png" alt="Verified Human" width="100px"></img></div>
      )} </div>
      <div>
        {reputationScore! < 0 && (
          <div>
            <p>❌ Potential Phishing. Bad reputation.❌</p>
          </div>
        )}
        {reputationScore == 0 && (
          <div>
            <p>🟠 No reputation. Make sure you know the person 🟠</p>
          </div>
        )}
        {reputationScore! > 0 && (
          <div>
            <p>✅ Looks great. Good reputation. Trustworthy requester. Grade A Nouner. ✅</p>
          </div>
        )}
      </div>
      <p>Wallet Address: {params.wallet}</p>
      <pre> {decimalAmount} {params.currency}  ({destChain.name})</pre>
      <p>--------------------</p>
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
      <IDKitWidget
        app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
        action={"vote" + params.wallet}
        // signal={positiveFeedback? "0x1" : "0x0"}
        signal="0x1"
        // On-chain only accepts Orb verifications
        // verification_level={VerificationLevel.Orb}
        // handleVerify={handleProof}
        onSuccess={worldIdFeedback}>
        {({ open }) => (
          <div>
          <button className="button_spam"
            onClick={() => {setpositiveFeedback(false); open()}}
            >
            Mark as spam
          </button>
          <button className="button_valid"
          onClick={() => {setpositiveFeedback(true); open()}}
          >
          Mark as valid
          </button>
          </div>
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
