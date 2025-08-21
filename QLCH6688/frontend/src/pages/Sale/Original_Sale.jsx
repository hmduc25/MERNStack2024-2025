// src/components/Sale.jsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import './Sale.css';
import { StoreContext } from '../../context/StoreContext.jsx';
import { icons } from '../../assets/products.js';
import ProductPopup from '../../components/ProductPopup.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import axios from 'axios';

const MAX_QUANTITY = 999;

const Sale = () => {
    // === State Management ===
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [paymentWarning, setPaymentWarning] = useState('');
    const [giamGia, setGiamGia] = useState(0);
    const [khachThanhToan, setKhachThanhToan] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [displayedTienThua, setDisplayedTienThua] = useState(0);
    const [displayedTongTienSauGiamGia, setDisplayedTongTienSauGiamGia] = useState(0);
    const [loading, setLoading] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const {
        url,
        urlImage,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        utilityFunctions,
        getTotalCartAmount,
        getTotalCartQuantity,
        product_list,
        clearCart,
    } = useContext(StoreContext);

    const { formatCurrency } = utilityFunctions;
    const TONG_SO_LUONG_SAN_PHAM = getTotalCartQuantity();

    // === Product Filtering & Memoization ===
    const suggestions = useMemo(() => {
        if (!debouncedSearchTerm.trim()) return [];
        const removeSpecialChars = (input) => {
            const specialChars = '!@#$%^&*()_+={}[]|\\:;"\'<>,.?/~`-';
            return input
                .split('')
                .filter((char) => !specialChars.includes(char))
                .join('');
        };
        const sanitizedValue = removeSpecialChars(debouncedSearchTerm);
        return product_list
            .filter(
                (product) =>
                    product.name.toLowerCase().includes(sanitizedValue.toLowerCase()) ||
                    product.barcode.toLowerCase().includes(sanitizedValue.toLowerCase()) ||
                    product.sellingPrice.toString().includes(sanitizedValue),
            )
            .map((product) => ({
                name: product.name,
                barcode: product.barcode,
                sellingPrice: product.sellingPrice,
                image: product.image,
                _id: product._id,
            }));
    }, [debouncedSearchTerm, product_list]);

    const cartProducts = useMemo(() => {
        return product_list.filter((item) => cartItems[item._id] > 0);
    }, [product_list, cartItems]);

    // === Calculated Values (sử dụng useMemo) ===
    const tongTien = useMemo(() => getTotalCartAmount(), [getTotalCartAmount]);
    const tongTienSauGiamGia = useMemo(() => tongTien - giamGia, [tongTien, giamGia]);
    const tienThuaTraKhach = useMemo(() => khachThanhToan - tongTienSauGiamGia, [khachThanhToan, tongTienSauGiamGia]);

    // === Effects & Handlers ===
    useEffect(() => {
        if (debouncedSearchTerm) {
            setError('');
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (khachThanhToan > 0 && tienThuaTraKhach < 0) {
            setPaymentWarning(`KHÁCH HÀNG CHƯA THANH TOÁN ĐỦ, CÒN THIẾU ${formatCurrency(Math.abs(tienThuaTraKhach))}`);
        } else {
            setPaymentWarning('');
        }
    }, [tienThuaTraKhach, khachThanhToan, formatCurrency]);

    useEffect(() => {
        setDisplayedTienThua(tienThuaTraKhach);
    }, [tienThuaTraKhach]);

    useEffect(() => {
        setDisplayedTongTienSauGiamGia(tongTienSauGiamGia);
    }, [tongTienSauGiamGia]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'F3') {
                event.preventDefault();
                document.getElementById('search-input').focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };

    const handleClosePopup = () => {
        setSelectedProduct(null);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const firstMatch = suggestions[0];
        if (firstMatch) {
            addToCart(firstMatch._id);
            setSearchTerm('');
        } else {
            setError(`Không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchTerm}"`);
        }
    };

    const handleSuggestionClick = (product) => {
        addToCart(product._id);
        setSearchTerm('');
    };

    const handleAmountChange = (event) => {
        const value = parseInt(event.target.value, 10) || 0;
        setKhachThanhToan(value);
    };

    const handleGiamGiaChange = (event) => {
        let value = event.target.value.replace(/-/g, '');
        value = parseInt(value, 10) || 0;
        if (value < 0) value = 0;
        setGiamGia(value);
    };

    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];

    const suggestions2 = useMemo(() => {
        let paymentSuggestions = [];
        if (tongTienSauGiamGia > 0) {
            const minSuggestion = Math.ceil(tongTienSauGiamGia / 10000) * 10000;
            const filteredDenominations = denominations.filter((d) => d >= minSuggestion);
            paymentSuggestions = [tongTienSauGiamGia, ...filteredDenominations];
            if (paymentSuggestions.length > 8) {
                paymentSuggestions = paymentSuggestions.slice(0, 8);
            }
        }
        return paymentSuggestions;
    }, [tongTienSauGiamGia]);

    const handleSuggestionClick2 = useCallback((amount) => {
        setKhachThanhToan(amount);
    }, []);

    // ⬅️ START: HÀM THANH TOÁN ĐÃ CẬP NHẬT
    const handleCheckout = async () => {
        // ➡️ DEBUG: Log giỏ hàng hiện tại trước khi bắt đầu thanh toán
        console.log('Bắt đầu quy trình thanh toán...');
        console.log('Giỏ hàng hiện tại (cartItems): ', cartItems);
        console.log('Danh sách sản phẩm (cartProducts): ', cartProducts);

        if (Object.keys(cartItems).length === 0) {
            console.log('Lỗi: Giỏ hàng trống.'); // ➡️ DEBUG: Thêm log cho trường hợp lỗi
            alert('Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán.');
            return;
        }

        const isQuantityValid = Object.values(cartItems).every((quantity) => quantity > 0);
        // ➡️ DEBUG: Log giá trị của isQuantityValid
        console.log('Kiểm tra số lượng sản phẩm có hợp lệ không (isQuantityValid): ', isQuantityValid);
        if (!isQuantityValid) {
            console.log('Lỗi: Số lượng sản phẩm không hợp lệ.'); // ➡️ DEBUG: Thêm log cho trường hợp lỗi
            alert('Số lượng sản phẩm không hợp lệ.');
            return;
        }

        setLoading(true);

        try {
            // const lastInvoiceResponse = await axios.get(`${url}api/banhang/laymahoadoncuoicung`);
            // const lastCode = lastInvoiceResponse.data.lastCode;

            // // ➡️ START: Logic tạo mã hóa đơn theo định dạng mới
            // const today = new Date();
            // const yyyy = today.getFullYear();
            // const mm = String(today.getMonth() + 1).padStart(2, '0');
            // const dd = String(today.getDate()).padStart(2, '0');
            // const todayPrefix = `HD${yyyy}${mm}${dd}`;

            // let newInvoiceCode;
            // if (lastCode.startsWith(todayPrefix)) {
            //     // Nếu có hóa đơn hôm nay, tăng số thứ tự lên 1
            //     const lastNumber = parseInt(lastCode.slice(10)); // Lấy 6 số cuối
            //     const newNumber = lastNumber + 1;
            //     newInvoiceCode = `${todayPrefix}${newNumber.toString().padStart(6, '0')}`;
            // } else {
            //     // Nếu là ngày mới, bắt đầu từ 000001
            //     newInvoiceCode = `${todayPrefix}000001`;
            // }
            // // ➡️ END: Logic tạo mã hóa đơn theo định dạng mới

            // console.log('Mã hóa đơn cuối cùng từ backend:', lastCode);
            // console.log('Mã hóa đơn mới được tạo:', newInvoiceCode);

            const lastInvoiceResponse = await axios.get(`${url}api/banhang/laymahoadoncuoicung`);
            const lastCode = lastInvoiceResponse.data.lastCode;

            // ➡️ START: Logic tạo mã hóa đơn theo định dạng mới (4 chữ số)
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayPrefix = `HD${yyyy}${mm}${dd}`;

            let newInvoiceCode;
            if (lastCode && lastCode.startsWith(todayPrefix)) {
                // Nếu có hóa đơn hôm nay, tăng số thứ tự lên 1
                const lastNumber = parseInt(lastCode.slice(10)); // Lấy 4 số cuối
                const newNumber = lastNumber + 1;
                newInvoiceCode = `${todayPrefix}${newNumber.toString().padStart(4, '0')}`;
            } else {
                // Nếu là ngày mới hoặc không có hóa đơn nào, bắt đầu từ 0001
                newInvoiceCode = `${todayPrefix}0001`;
            }
            // ➡️ END: Logic tạo mã hóa đơn theo định dạng mới

            console.log('Mã hóa đơn cuối cùng từ backend:', lastCode);
            console.log('Mã hóa đơn mới được tạo:', newInvoiceCode);

            const salesData = Object.keys(cartItems).map((productId) => ({
                productId: productId,
                quantitySold: cartItems[productId],
            }));

            const cashier = {
                id: '67462c8a77a41c1f4e5a9c0c',
                name: 'Min',
            };
            const customerName = 'Khách lẻ';

            const paymentDetails = {
                method: 'Tiền mặt',
                soTienDaNhan: khachThanhToan,
            };

            const postData = {
                salesData: salesData,
                invoiceCode: newInvoiceCode,
                customerName: customerName,
                cashier: cashier,
                paymentDetails: paymentDetails,
                discounts: giamGia,
            };

            console.log('postData: ', postData);

            const response = await axios.post(`${url}api/banhang/sell`, postData);

            if (response.data.success) {
                alert('Thanh toán thành công!');
                clearCart();
                setGiamGia(0);
                setKhachThanhToan(0);
            } else {
                alert(`Thanh toán thất bại: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Lỗi khi thanh toán:', error);
            alert(`Đã xảy ra lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };
    // ⬅️ END: HÀM THANH TOÁN ĐÃ CẬP NHẬT

    console.log('product_list: ', product_list);

    return (
        <div className="sale-container">
            {/* Cột trái: Tìm kiếm & Danh sách sản phẩm trong giỏ hàng */}
            <div className="sale-left">
                <form onSubmit={handleSearch} className="sale-search-form" autoComplete="off">
                    <input
                        id="search-input"
                        type="text"
                        className="sale-search-input"
                        placeholder="Tìm kiếm sản phẩm (Tên, Mã hàng, Mã vạch) - F3"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                    <button type="submit" className="sale-btn-tim-kiem">
                        Tìm kiếm
                    </button>
                    {suggestions.length > 0 && (
                        <ul className="suggestion-list">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="list-item" onClick={() => handleSuggestionClick(suggestion)}>
                                    <img
                                        draggable={false}
                                        src={`${urlImage}${suggestion.image}`}
                                        alt={''}
                                        className="suggestion-item-image"
                                    />
                                    <div className="suggestion-item-details">
                                        <p className="suggestion-item-name">{suggestion.name}</p>
                                        <p className="suggestion-item-barcode">{suggestion.barcode}</p>
                                    </div>
                                    <p className="suggestion-item-price">{formatCurrency(suggestion.sellingPrice)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </form>
                {error && <p className="sale-error-message">{error}</p>}
                <div className="sale-cart-list">
                    {cartProducts.map((item) => (
                        <div key={item._id} className="cart-item-container">
                            <img
                                draggable={false}
                                onClick={() => handleProductClick(item)}
                                title="Nhấn để xem chi tiết"
                                className="cart-item-image"
                                src={`${urlImage}${item.image}`}
                                alt={''}
                            />
                            <div className="cart-item-details">
                                <p
                                    onClick={() => handleProductClick(item)}
                                    title="Nhấn để xem chi tiết"
                                    className="cart-item-name"
                                >
                                    {item.name}
                                </p>
                                <p className="cart-item-price-per-unit">{formatCurrency(item.sellingPrice)}</p>
                            </div>
                            <div className="cart-item-counter">
                                <img
                                    title="Xóa đi một sản phẩm"
                                    onClick={() => removeFromCart(item._id)}
                                    src={icons.remove_icon_red}
                                    alt="icon xóa sản phẩm"
                                />
                                <input
                                    max={MAX_QUANTITY}
                                    title="Nhập số lượng sản phẩm"
                                    className="cart-item-quantity-input"
                                    type="number"
                                    value={cartItems[item._id] || 0}
                                    onChange={(e) => {
                                        let value = parseInt(e.target.value, 10) || 0;
                                        if (value > MAX_QUANTITY) {
                                            value = value.toString().slice(0, 3);
                                            alert(`Số lượng sản phẩm không thể vượt quá ${MAX_QUANTITY}.`);
                                        }
                                        updateCartItemQuantity(item._id, value);
                                    }}
                                />
                                <img
                                    title="Thêm một sản phẩm"
                                    onClick={() => {
                                        const currentQuantity = cartItems[item._id] || 0;
                                        if (currentQuantity < MAX_QUANTITY) {
                                            addToCart(item._id);
                                        } else {
                                            alert(`Số lượng sản phẩm không thể vượt quá ${MAX_QUANTITY}.`);
                                        }
                                    }}
                                    src={icons.add_icon_green}
                                    alt="icon thêm sản phẩm"
                                />
                            </div>
                            <p className="cart-item-total-price">
                                {formatCurrency(item.sellingPrice * cartItems[item._id])}
                            </p>
                        </div>
                    ))}
                </div>
                <ProductPopup product={selectedProduct} onClose={handleClosePopup} />
            </div>

            {/* Cột phải: Hóa đơn bán hàng */}
            <div className="sale-right">
                <div className="cart-summary">
                    <h2>Hóa đơn bán hàng</h2>
                    <div>
                        <div className="summary-row">
                            <p>Tổng số lượng sản phẩm</p>
                            <p>{TONG_SO_LUONG_SAN_PHAM}</p>
                        </div>
                        <div className="summary-row">
                            <p>Tổng tiền hàng</p>
                            <p>{formatCurrency(tongTien)}</p>
                        </div>
                        <hr />
                        <div className="summary-row">
                            <label>Giảm giá:</label>
                            <input
                                step={1000}
                                type="number"
                                min={0}
                                value={giamGia}
                                onChange={handleGiamGiaChange}
                                placeholder="Nhập giảm giá"
                            />
                        </div>
                        <hr />
                        <div className="summary-row">
                            <b>Khách cần trả</b>
                            <b className="animated-money">{formatCurrency(displayedTongTienSauGiamGia)}</b>
                        </div>
                        <hr />
                        <div className="summary-row">
                            <label>Khách thanh toán:</label>
                            <input
                                step={1000}
                                type="number"
                                value={khachThanhToan}
                                onChange={handleAmountChange}
                                placeholder="Nhập số tiền khách thanh toán"
                            />
                        </div>
                        <div className="payment-suggestion-container">
                            <h4>Gợi ý tiền khách trả</h4>
                            <div className="payment-suggestion-list">
                                {suggestions2.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick2(suggestion)}
                                        className="payment-suggestion-btn"
                                    >
                                        {formatCurrency(suggestion)}
                                    </button>
                                ))}
                            </div>
                            {paymentWarning && <p className="payment-warning">{paymentWarning}</p>}
                        </div>
                        <hr className="split-line" />
                        <div className="summary-row summary-total">
                            <b>Tiền thừa trả khách</b>
                            <b className="animated-money">{formatCurrency(displayedTienThua)}</b>
                        </div>
                    </div>
                    {/* ⬅️ Gán hàm handleCheckout cho nút Thanh toán */}
                    <button onClick={handleCheckout} className="checkout-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'THANH TOÁN'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sale;
