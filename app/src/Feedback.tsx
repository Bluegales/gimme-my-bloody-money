import { IDKitWidget } from '@worldcoin/idkit';
import React, { useState } from 'react';

function Feedback() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [action, setAction] = useState("0x0");
    const [signal, setSignal] = useState("0x0");

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const onSuccess = (data: any) => {
        console.log("Verification success:", data);
        handleCloseModal();
        // You can handle additional logic after success here
    };

    return (
        <div>
            <button onClick={handleOpenModal}>Open Verification</button>
            
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={handleCloseModal}>&times;</span>
                        <IDKitWidget
                            app_id="app_staging_51c06a1df3fa4b5f004db3fb8dfe6569"
                            action={action}
                            signal={signal}
                            onSuccess={onSuccess}>
                            {({ open }) => (
                                <button onClick={open}>Verify with World ID</button>
                            )}
                        </IDKitWidget>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Feedback;
