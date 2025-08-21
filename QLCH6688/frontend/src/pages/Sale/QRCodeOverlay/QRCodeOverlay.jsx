import { useState } from 'react';
import './QRCodeOverlay.css';
import qrCodeImage1 from '../../../assets/payments/qrcode/qr1.jpg';
import qrCodeImage2 from '../../../assets/payments/qrcode/qr2.jpg';
import qrCodeImage3 from '../../../assets/payments/qrcode/qr3.jpg';

// Dữ liệu mock tài khoản ngân hàng
const BANK_ACCOUNTS = [
    {
        id: 'vietinbank1',
        name: 'Hà Minh Đức',
        bank: 'Vietinbank',
        accountNumber: '0011001234567',
        qrCodeValue: qrCodeImage1,
    },
    {
        id: 'vietinbank2',
        name: 'Cửa hàng Trang Quyên',
        bank: 'Vietinbank',
        accountNumber: '19034567891011',
        qrCodeValue: qrCodeImage2,
    },
    {
        id: 'bidv',
        name: 'Hà Minh Đức',
        bank: 'BIDV',
        accountNumber: '24681357905968',
        qrCodeValue: qrCodeImage3,
    },
];

const QRCodeOverlay = ({ totalDue, onClose }) => {
    const [selectedAccount, setSelectedAccount] = useState(BANK_ACCOUNTS[0]);

    const handleBackdropClick = (event) => {
        if (event.target.classList.contains('qr-overlay')) {
            onClose();
        }
    };

    return (
        <div className="overlay-backdrop qr-overlay" onClick={handleBackdropClick}>
            <div className="qr-modal">
                <button className="qr-close-btn" onClick={onClose}>
                    &times;
                </button>
                <div className="qr-header">
                    <h2>Quét Mã QR để thanh toán</h2>
                    <p>
                        Số tiền cần thanh toán: <span className="qr-amount">{totalDue.toLocaleString('vi-VN')}đ</span>
                    </p>
                </div>
                <div className="qr-content">
                    <div className="qr-image-container">
                        <img src={selectedAccount.qrCodeValue} alt="QR Code" className="qr-image" />
                    </div>
                    <div className="bank-info">
                        <p>
                            <strong>Người nhận:</strong> {selectedAccount.name}
                        </p>
                        <p>
                            <strong>Ngân hàng:</strong> {selectedAccount.bank}
                        </p>
                        <p>
                            <strong>Số tài khoản:</strong> {selectedAccount.accountNumber}
                        </p>
                    </div>
                </div>
                <div className="bank-selection-container">
                    <h4>Chọn ngân hàng khác:</h4>
                    <div className="bank-selection-list">
                        {BANK_ACCOUNTS.map((account) => (
                            <button
                                key={account.id}
                                className={`bank-select-btn ${selectedAccount.id === account.id ? 'active' : ''}`}
                                onClick={() => setSelectedAccount(account)}
                            >
                                {account.bank}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRCodeOverlay;
