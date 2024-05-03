import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ConnectWallet from './ConnectWallet';
import PaymentLinkForm from './PaymentLinkForm';
import PaymentReceiver from './PaymentReceiver';
import './App.css'

const App = () => {
  const [account, setAccount] = useState('');

  return (
    <Router>
      <div>
        <h1>GiveMeMyBloody.Money</h1>
        <ConnectWallet setAccount={setAccount} />
        <Routes>
          <Route path="/" element={account && (
              <>
                <p>Connected Account: {account}</p>
                <PaymentLinkForm account={account} />
              </>
            )} />
          <Route path="/pay" element={<PaymentReceiver account={account} setAccount={setAccount} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
