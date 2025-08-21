import { useState } from 'react';
import './InvoiceOverlay.css';
import QRCodeOverlay from '../QRCodeOverlay/QRCodeOverlay';
import axios from 'axios';

const InvoiceOverlay = ({ data, onClose, setLoading, url }) => {
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [showQRCode, setShowQRCode] = useState(false);

    const formatCurrency = (amount, includeUnit = true) => {
        if (amount === null || amount === undefined) {
            return '0 đ';
        }
        const formattedAmount = amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        if (includeUnit) {
            return formattedAmount.replace('₫', 'đ');
        } else {
            return formattedAmount.replace('₫', '').trim();
        }
    };

    const handleCheckout = async (status) => {
        if (Object.keys(data.cartItems).length === 0) {
            alert('Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán.');
            onClose(false);
            return;
        }

        // Tách riêng logic lọc các sản phẩm có số lượng > 0
        const itemsToSell = Object.entries(data.cartItems).filter(([id, quantity]) => quantity > 0);

        if (itemsToSell.length === 0) {
            alert('Giỏ hàng không có sản phẩm nào có số lượng > 0. Vui lòng kiểm tra lại.');
            onClose(false);
            return;
        }

        setLoading(true);

        try {
            const lastInvoiceResponse = await axios.get(`${url}api/banhang/laymahoadoncuoicung`);
            const lastCode = lastInvoiceResponse.data.lastCode;

            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayPrefix = `HD${yyyy}${mm}${dd}`;

            let newInvoiceCode;
            if (lastCode && lastCode.startsWith(todayPrefix)) {
                const lastNumber = parseInt(lastCode.slice(10));
                const newNumber = lastNumber + 1;
                newInvoiceCode = `${todayPrefix}${newNumber.toString().padStart(4, '0')}`;
            } else {
                newInvoiceCode = `${todayPrefix}0001`;
            }

            // Tạo salesData chỉ từ các sản phẩm đã được lọc
            const salesData = itemsToSell.map(([id, quantity]) => ({
                productId: id,
                quantitySold: quantity,
            }));

            const cashier = { id: '67462c8a77a41c1f4e5a9c0c', name: 'Min' };
            const customerName = 'Khách lẻ';

            const paymentDetails = {
                method: paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
                soTienDaNhan: data.khachThanhToan,
            };

            const postData = {
                salesData,
                invoiceCode: newInvoiceCode,
                customerName,
                cashier,
                paymentDetails,
                discounts: data.giamGia,
                status: status,
            };

            const response = await axios.post(`${url}api/banhang/sell`, postData);

            if (response.data.success) {
                alert(`Thanh toán ${status === 'completed' ? 'thành công' : 'chờ xử lý'}! Hóa đơn đã được ghi nhận.`);
                onClose(true);
            } else {
                alert(`Thanh toán thất bại: ${response.data.message}`);
                onClose(false);
            }
        } catch (error) {
            console.error('Lỗi khi thanh toán:', error);
            alert(`Đã xảy ra lỗi: ${error.response?.data?.message || error.message}`);
            onClose(false);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        if (method === 'bank') {
            setShowQRCode(true);
        } else {
            setShowQRCode(false);
        }
    };

    const handleCloseQRCode = () => {
        setShowQRCode(false);
    };

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(
        2,
        '0',
    )}/${today.getFullYear()} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(
        2,
        '0',
    )}:${String(today.getSeconds()).padStart(2, '0')}`;

    // Tính toán tổng số lượng và tổng tiền hàng
    const totalQuantity = Object.values(data.cartItems).reduce((sum, quantity) => sum + quantity, 0);
    const totalAmount = data.cartProducts.reduce((sum, item) => sum + item.sellingPrice * data.cartItems[item._id], 0);

    return (
        <div className="overlay-backdrop">
            <div className="invoice-modal">
                <button className="invoice-close-btn" onClick={() => onClose(false)}>
                    &times;
                </button>
                <div className="invoice-header">
                    <h2>Hóa đơn bán hàng</h2>
                    <p>Ngày: {formattedDate}</p>
                </div>

                <div className="invoice-content">
                    {/* Phần Bên Trái: Danh sách sản phẩm */}
                    <div className="invoice-left-panel">
                        <h3>Danh sách sản phẩm</h3>
                        <div className="invoice-body">
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên sản phẩm</th>
                                        <th>SL</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.cartProducts.map((item, index) => (
                                        <tr key={item._id}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td>{data.cartItems[item._id]}</td>
                                            <td>{formatCurrency(item.sellingPrice)}</td>
                                            <td>{formatCurrency(item.sellingPrice * data.cartItems[item._id])}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* THÊM HÀNG TỔNG Ở ĐÂY */}
                                <tfoot>
                                    <tr>
                                        <td colSpan="2">
                                            <b>Tổng cộng</b>
                                        </td>
                                        <td>
                                            <b>{totalQuantity}</b>
                                        </td>
                                        <td colSpan="2">
                                            <b>{formatCurrency(totalAmount)}</b>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Phần Bên Phải: Tóm tắt hóa đơn và nút hành động */}
                    <div className="invoice-right-panel">
                        <div className="invoice-summary">
                            <div className="summary-row">
                                <span>Tổng tiền hàng:</span>
                                <span>{formatCurrency(data.tongTien)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Chiết khấu:</span>
                                <span>{formatCurrency(data.giamGia)}</span>
                            </div>
                            <hr />
                            <div className="summary-row total-amount">
                                <span>Tiền phải trả:</span>
                                <span>{formatCurrency(data.tongTienSauGiamGia)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tiền khách trả:</span>
                                <span>{formatCurrency(data.khachThanhToan)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Tiền thừa:</span>
                                <span>{formatCurrency(data.tienThuaTraKhach)}</span>
                            </div>
                        </div>

                        {/* Phần Phương thức thanh toán */}
                        <div className="payment-method-container">
                            <p>Phương thức thanh toán</p>
                            <div className={`slide-toggle-switch ${paymentMethod}`}>
                                <div className="slide-toggle-handle"></div>
                                <button
                                    className={`toggle-option cash ${paymentMethod === 'cash' ? 'active' : ''}`}
                                    onClick={() => handlePaymentMethodChange('cash')}
                                >
                                    Tiền Mặt
                                </button>
                                <button
                                    className={`toggle-option bank ${paymentMethod === 'bank' ? 'active' : ''}`}
                                    onClick={() => handlePaymentMethodChange('bank')}
                                >
                                    Chuyển Khoản
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="invoice-action-buttons">
                    <button className="invoice-action-btn invoice-paid" onClick={() => handleCheckout('completed')}>
                        Đã thanh toán thành công
                    </button>
                    <button className="invoice-action-btn invoice-pending" onClick={() => handleCheckout('pending')}>
                        Để sau (Pending)
                    </button>
                    <button className="invoice-action-btn invoice-cancel" onClick={() => onClose(false)}>
                        Hủy hóa đơn
                    </button>
                </div>

                <div className="invoice-footer">Cảm ơn quý khách đã mua hàng. Hẹn gặp lại! 😊</div>
            </div>
            {showQRCode && <QRCodeOverlay totalDue={data.tongTienSauGiamGia} onClose={handleCloseQRCode} />}
        </div>
    );
};

export default InvoiceOverlay;
