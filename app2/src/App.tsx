import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
import PaymentLinkForm from './PaymentLinkForm';
import PaymentReceiver from './PaymentReceiver';
import './App.css';

interface ConnectWalletProps {
  setAccount: (account: string) => void;
}

interface PaymentLinkFormProps {
  account: string;
}

interface PaymentReceiverProps {
  account: string;
  setAccount: (account: string) => void;
}

const App: React.FC = () => {
  const [account, setAccount] = useState<string>('');

  return (
    <Router>
      <div>
        <center>
          <h1>GiveMeMyBloody.Money</h1>
          <img src="./noun_gun.png" width="200" alt="App Icon"></img>
          {/* Render ConnectWallet only if account is not set */}
          {!account && <ConnectWallet setAccount={setAccount} />}
          <Routes>
            <Route path="/" element={account ? (
              <>
                {/* <p>Connected Account: {account}</p> */}
                <PaymentLinkForm account={account} />
              </>
            ) : null} />
            <Route path="/pay" element={<PaymentReceiver account={account} setAccount={setAccount} />} />
          </Routes>
        </center>
      </div>
    </Router>
  );
};

export default App;
