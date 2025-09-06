// src/components/Sale.jsx
import { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import './Sale.css';
import { StoreContext } from '../../context/StoreContext.jsx';
import { icons } from '../../assets/products.js';
import ProductPopup from '../../components/ProductPopup.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import InvoiceOverlay from './InvoiceOverlay/InvoiceOverlay';
import { getPaymentSuggestions } from '../../utils/paymentSuggestions';
import NoteProductPopup from './NoteProductPopup/NoteProductPopup';

// SỬA ĐỔI CÁCH IMPORT WEB WORKER
// Nếu bạn sử dụng Create React App hoặc Vite, bạn có thể dùng cú pháp đặc biệt này:
// src/workers/search.worker.js
import SearchWorker from '../../workers/search.worker.js?worker';
// Hoặc đơn giản và phổ biến hơn, sử dụng cú pháp URL như sau:
// const searchWorkerUrl = new URL('../../workers/search.worker.js', import.meta.url);

const MAX_QUANTITY = 999;

const Sale = () => {
    const {
        url,
        urlImage,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        utilityFunctions,
        getTotalCartAmount,
        clearCart,
        product_list,
    } = useContext(StoreContext);

    const { formatCurrency } = utilityFunctions;

    // State cho giao diện chính
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [paymentWarning, setPaymentWarning] = useState('');
    const [giamGia, setGiamGia] = useState(0);
    const [khachThanhToan, setKhachThanhToan] = useState(0);
    const [khachThanhToanDisplay, setKhachThanhToanDisplay] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showInvoiceOverlay, setShowInvoiceOverlay] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showAddProductPopup, setShowAddProductPopup] = useState(false);
    const [selectedProductData, setSelectedProductData] = useState(null);

    // Khai báo một state mới cho kết quả tìm kiếm từ worker
    const [suggestions, setSuggestions] = useState([]);

    // useRef để lưu instance của worker
    const searchWorkerRef = useRef(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const searchRef = useRef(null);

    // === MEMOIZED VALUES & FUNCTIONS ===
    const TONG_SO_LUONG_SAN_PHAM = useMemo(() => {
        return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
    }, [cartItems]);

    // === EFFECTS ===
    useEffect(() => {
        // Khởi tạo Web Worker khi component được mount
        searchWorkerRef.current = new SearchWorker();

        // Lắng nghe kết quả từ worker
        searchWorkerRef.current.onmessage = (event) => {
            setSuggestions(event.data);
        };

        // Dọn dẹp worker khi component unmount
        return () => {
            if (searchWorkerRef.current) {
                searchWorkerRef.current.terminate();
            }
        };
    }, []);

    // Gửi yêu cầu tìm kiếm đến Web Worker mỗi khi `debouncedSearchTerm` thay đổi
    useEffect(() => {
        if (searchWorkerRef.current) {
            searchWorkerRef.current.postMessage({
                searchTerm: debouncedSearchTerm,
                productList: product_list,
            });
        }
    }, [debouncedSearchTerm, product_list]);

    const cartProducts = useMemo(() => {
        return product_list.filter((item) => cartItems[item._id] > 0);
    }, [product_list, cartItems]);

    const tongTien = useMemo(() => getTotalCartAmount(), [getTotalCartAmount]);
    const tongTienSauGiamGia = useMemo(() => tongTien - giamGia, [tongTien, giamGia]);
    const tienThuaTraKhach = useMemo(() => khachThanhToan - tongTienSauGiamGia, [khachThanhToan, tongTienSauGiamGia]);

    const paymentSuggestions = useMemo(() => {
        return getPaymentSuggestions(tongTienSauGiamGia);
    }, [tongTienSauGiamGia]);

    // === EFFECTS ===
    useEffect(() => {
        if (khachThanhToan > 0 && tienThuaTraKhach < 0) {
            setPaymentWarning(`KHÁCH HÀNG CHƯA THANH TOÁN ĐỦ, CÒN THIẾU ${formatCurrency(Math.abs(tienThuaTraKhach))}`);
        } else {
            setPaymentWarning('');
        }
    }, [tienThuaTraKhach, khachThanhToan, formatCurrency]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'F3') {
                event.preventDefault();
                searchRef.current.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // === HANDLERS ===
    const handleSearchChange = (event) => {
        const rawValue = event.target.value;
        const regex = /[!@#$%^&*()\-+=\[\]{}|\\;:'",.<>/?~`]/g;

        // Áp dụng regex để thay thế các ký tự không hợp lệ
        const sanitizedValue = rawValue.replace(regex, '');

        // Cập nhật state với giá trị đã được làm sạch
        setSearchTerm(sanitizedValue);
        setError('');
        setShowAddProductPopup(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const firstMatch = suggestions[0];
        if (firstMatch) {
            addToCart(firstMatch._id);
            setSearchTerm('');
        } else if (searchTerm) {
            setError(`Không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchTerm}"`);
        }
    };

    const handleSuggestionClick = useCallback(
        (product) => {
            addToCart(product._id);
            setSearchTerm('');
            setError('');
        },
        [addToCart],
    );

    const handleAmountChange = (event) => {
        // const rawValue = event.target.value.replace(/[^0-9]/g, '');
        // // Chuyển đổi thành số nguyên
        // const numericValue = parseInt(rawValue, 10) || 0;

        // console.log('numericValue: ', numericValue);
        // // Cập nhật state với giá trị số
        // setKhachThanhToan(numericValue);

        const rawValue = event.target.value;
        const numericValue = parseInt(rawValue.replace(/[^0-9]/g, ''), 10) || 0;
        setKhachThanhToan(numericValue);
        const formattedValue = formatCurrencyForInput(numericValue, false);
        setKhachThanhToanDisplay(formattedValue);
    };

    const handleGiamGiaChange = (event) => {
        let value = parseInt(event.target.value, 10) || 0;
        if (value < 0) value = 0;
        setGiamGia(value);
    };

    const handlePaymentSuggestionClick = useCallback((amount) => {
        setKhachThanhToan(amount);
        setKhachThanhToanDisplay(formatCurrencyForInput(amount, false));
    }, []);

    const handleCheckoutButton = () => {
        if (Object.keys(cartItems).length === 0) {
            setPaymentWarning('Giỏ hàng trống. Vui lòng thêm sản phẩm để thanh toán.');
            return;
        }

        const totalDue = tongTienSauGiamGia;
        if (khachThanhToan < totalDue && tongTien > 0) {
            setPaymentWarning(`Tiền khách trả không đủ. Còn thiếu ${formatCurrency(totalDue - khachThanhToan)}.`);
            return;
        }
        setShowInvoiceOverlay(true);
    };

    const formatCurrencyForInput = (amount, includeUnit = true) => {
        const formattedAmount = amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
        if (includeUnit) {
            return formattedAmount.replace('₫', 'đ');
        } else {
            return formattedAmount.replace('₫', '').trim();
        }
    };

    const handleCloseInvoiceOverlay = (shouldClearCart) => {
        setShowInvoiceOverlay(false);
        if (shouldClearCart) {
            clearCart();
            setGiamGia(0);
            setKhachThanhToan(0);
            setKhachThanhToanDisplay('');
            setError('');
            setPaymentWarning('');
        }
    };

    // Gói dữ liệu để truyền cho InvoiceOverlay
    const invoiceData = {
        cartProducts,
        tongTien,
        giamGia,
        tongTienSauGiamGia,
        khachThanhToan,
        tienThuaTraKhach,
        cartItems,
    };

    // === HÀM TIỆN ÍCH PHÂN TÍCH TỪ KHÓA TÌM KIẾM ===
    const analyzeSearchTerm = useCallback(() => {
        const term = searchTerm.trim();
        if (!term) return { name: '', productCode: '', barcode: '', sellingPrice: '' };

        // Regex để nhận diện Mã hàng (ví dụ: SP000000, P001,...)
        const productCodeRegex = /^[a-zA-Z]{1,2}\d{5,}$/i;
        // Regex để nhận diện Mã vạch (thường là 12 hoặc 13 chữ số)
        const barcodeRegex = /^\d{12,13}$/;
        // Regex để nhận diện Giá (chỉ gồm các chữ số)
        const priceRegex = /^\d+$/;

        if (barcodeRegex.test(term)) {
            return {
                name: '',
                productCode: '',
                barcode: term,
                sellingPrice: '',
            };
        } else if (productCodeRegex.test(term)) {
            return {
                name: '',
                productCode: term,
                barcode: '',
                sellingPrice: '',
            };
        } else if (priceRegex.test(term)) {
            return {
                name: '',
                productCode: '',
                barcode: '',
                sellingPrice: term,
            };
        } else {
            return {
                name: term,
                productCode: '',
                barcode: '',
                sellingPrice: '',
            };
        }
    }, [searchTerm]);

    // ⚡️ Thêm hàm xử lý khi đóng popup thêm sản phẩm
    const handleCloseAddProductPopup = useCallback(() => {
        setShowAddProductPopup(false);
    }, []);

    const handleShowAddProductPopup = useCallback(() => {
        // Phân tích searchTerm để có dữ liệu điền sẵn
        const initialData = analyzeSearchTerm();
        setSelectedProductData(initialData);
        setShowAddProductPopup(true);
    }, [analyzeSearchTerm]);

    return (
        <div className="sale-container">
            {/* Cột trái: Tìm kiếm & Danh sách sản phẩm trong giỏ hàng */}
            <div className="sale-left">
                <form onSubmit={handleSearch} className="sale-search-form" autoComplete="off">
                    <input
                        id="search-input"
                        type="text"
                        ref={searchRef}
                        className="sale-search-input"
                        placeholder="Tìm kiếm sản phẩm (Tên sản phẩm, Mã hàng, Mã vạch) - F3"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        autoFocus
                        maxLength={125}
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
                {error && (
                    <div className="sale-search__error">
                        <p className="sale-error-message">{error}</p>
                        {suggestions.length === 0 && (
                            <span className="sale-search__add-link" onClick={handleShowAddProductPopup}>
                                Sản phẩm chưa có? Thêm ngay!
                            </span>
                        )}
                    </div>
                )}

                {/* {error && <p className="sale-error-message">{error}</p>} */}
                <div className="sale-cart-list">
                    {cartProducts.map((item) => (
                        <div key={item._id} className="cart-item-container">
                            <img
                                draggable={false}
                                onClick={() => setSelectedProduct(item)}
                                title="Nhấn để xem chi tiết"
                                className="cart-item-image"
                                src={`${urlImage}${item.image}`}
                                alt={''}
                            />
                            <div className="cart-item-details">
                                <p
                                    onClick={() => setSelectedProduct(item)}
                                    title="Nhấn để xem chi tiết"
                                    className="cart-item-name"
                                >
                                    {item.name}
                                </p>
                                <p className="cart-item-price-per-unit">{formatCurrency(item.sellingPrice)}</p>
                            </div>
                            <div className="cart-item-counter">
                                <img
                                    title="Xóa sản phẩm khỏi giỏ hàng"
                                    onClick={() => removeFromCart(item._id)}
                                    src={icons.remove_icon_red}
                                    alt="icon xóa sản phẩm"
                                    draggable={false}
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
                                            value = MAX_QUANTITY;
                                            alert(`Số lượng sản phẩm không thể vượt quá ${MAX_QUANTITY}.`);
                                        }
                                        updateCartItemQuantity(item._id, value);
                                    }}
                                />
                                <img
                                    title="Thêm sản phẩm vào giỏ hàng"
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
                                    draggable={false}
                                />
                            </div>
                            <p className="cart-item-total-price">
                                {formatCurrency(item.sellingPrice * cartItems[item._id])}
                            </p>
                        </div>
                    ))}
                </div>
                {selectedProduct && <ProductPopup product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
            </div>

            {/* Cột phải: Hóa đơn bán hàng */}
            <div className="sale-right">
                <div className="cart-summary">
                    <h2>Hóa đơn bán hàng</h2>
                    <div>
                        <div className="summary-row">
                            <p>Tổng số lượng sản phẩm</p>
                            <p className="summary-row-tong-so-luong">{TONG_SO_LUONG_SAN_PHAM}</p>
                        </div>
                        <div className="summary-row">
                            <p>Tổng tiền hàng</p>
                            <p>{formatCurrency(tongTien)}</p>
                        </div>
                        <hr />
                        <div className="summary-row">
                            <label>Giảm giá:</label>
                            <input
                                disabled
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
                            <b className="animated-money">{formatCurrency(tongTienSauGiamGia)}</b>
                        </div>
                        <hr />
                        <div className="summary-row">
                            <label>Khách thanh toán:</label>
                            <div className="summary-wrapper-input">
                                <input
                                    maxLength={12}
                                    id="payment"
                                    type="text"
                                    value={khachThanhToanDisplay}
                                    onChange={handleAmountChange}
                                    onFocus={() => setPaymentWarning('')}
                                />
                                <p>₫</p>
                            </div>
                        </div>
                        <div className="payment-suggestion-container">
                            <h4>Gợi ý tiền khách trả</h4>
                            <div className="payment-suggestion-list">
                                {paymentSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePaymentSuggestionClick(suggestion)}
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
                            <b className="animated-money">{formatCurrency(tienThuaTraKhach)}</b>
                        </div>
                    </div>
                    <button onClick={handleCheckoutButton} className="checkout-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'THANH TOÁN'}
                    </button>
                </div>
            </div>

            {showInvoiceOverlay && (
                <InvoiceOverlay
                    data={invoiceData}
                    onClose={handleCloseInvoiceOverlay}
                    setLoading={setLoading}
                    url={url}
                />
            )}

            {showAddProductPopup && (
                <NoteProductPopup initialData={selectedProductData} onClose={handleCloseAddProductPopup} url={url} />
            )}
        </div>
    );
};

export default Sale;
