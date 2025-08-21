import { useState, useEffect, useContext } from 'react';
import './Home.css';
import { StoreContext } from '../../context/StoreContext.jsx';
import { icons } from '../../assets/products.js';
import ProductPopup from '../../components/ProductPopup.jsx';

const Home = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [paymentWarning, setPaymentWarning] = useState('');

    const [tongTien, setTongTien] = useState(0);
    const [giamGia, setGiamGia] = useState(0); // Giảm giá nhập từ bàn phím
    const [tongTienSauGiamGia, setTongTienSauGiamGia] = useState(0);
    const [tienThuaTraKhach, setTienThuaTraKhach] = useState(0);
    const [khachThanhToan, setKhachThanhToan] = useState(0); // Khách thanh toán nhập từ bàn phím

    const {
        urlImage,
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        utilityFunctions,
        getTotalCartAmount,
        getTotalCartQuantity,
        product_list,
    } = useContext(StoreContext);

    const { formatCurrency } = utilityFunctions;
    const TONG_SO_LUONG_SAN_PHAM = getTotalCartQuantity();

    // Popups
    const [selectedProduct, setSelectedProduct] = useState(null); // Trạng thái sản phẩm được chọn

    const handleProductClick = (product) => {
        setSelectedProduct(product); // Hiển thị popup với sản phẩm được chọn
    };

    const handleClosePopup = () => {
        setSelectedProduct(null); // Đóng popup
    };

    // Shortcut tìm kiếm
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

    // Cập nhật tổng tiền mỗi khi giỏ hàng, giảm giá hoặc khách thanh toán thay đổi
    useEffect(() => {
        calcAmount();
    }, [cartItems, giamGia, khachThanhToan]);

    const handleSearchChange = (event) => {
        let value = event.target.value;
        // Loại bỏ ký tự đặc biệt
        const removeSpecialChars = (input) => {
            const specialChars = '!@#$%^&*()_+={}[]|\\:;"\'<>,.?/~`-';
            return input
                .split('')
                .filter((char) => !specialChars.includes(char))
                .join('');
        };
        value = removeSpecialChars(value);
        setSearchTerm(event.target.value);
        setSearchTerm(value);
        if (value.trim()) {
            const filteredSuggestions = product_list
                .filter(
                    (product) =>
                        product.name.toLowerCase().includes(value.toLowerCase()) ||
                        product.barcode.toLowerCase().includes(value.toLowerCase()) ||
                        product.sellingPrice.toString().includes(value),
                )
                .map((product) => ({
                    name: product.name,
                    barcode: product.barcode,
                    sellingPrice: product.sellingPrice,
                    image: product.image,
                }))
                .slice(0, 5); // Giới hạn 5 gợi ý
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Thực hiện tìm kiếm ở đây
        if (!searchTerm.trim()) {
            setError('Vui lòng nhập thông tin tìm kiếm!');
            return;
        }
        setError('');
        const filteredProducts = product_list.filter((product) => {
            const searchText = searchTerm.toLowerCase();
            return (
                product.name.toLowerCase().includes(searchText) ||
                product.productCode.toLowerCase().includes(searchText) ||
                product.barcode.toLowerCase().includes(searchText) ||
                product.sellingPrice.toString().includes(searchText)
            );
        });
        if (filteredProducts.length === 0) {
            setError(`Không tìm thấy sản phẩm nào phù hợp với từ khóa "${searchTerm}"`);
            return;
        }
        addToCart(filteredProducts[0]._id);
        setSearchResults(filteredProducts);
        setSearchTerm('');
        setSuggestions([]);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.name);
        setSuggestions([]);
    };

    const calcAmount = () => {
        const TONG_TIEN_SAN_PHAM = getTotalCartAmount();
        // const TONG_TIEN_SAN_PHAM = 100000;
        const TONG_TIEN_SAU_GIAM_GIA = TONG_TIEN_SAN_PHAM - giamGia;

        setTongTien(TONG_TIEN_SAN_PHAM);
        setTongTienSauGiamGia(TONG_TIEN_SAU_GIAM_GIA);

        const TIEN_THUA_TRA_KHACH = khachThanhToan - TONG_TIEN_SAU_GIAM_GIA;

        if (TIEN_THUA_TRA_KHACH < 0) {
            setPaymentWarning(
                `KHÁCH HÀNG CHƯA THANH TOÁN ĐỦ, CÒN THIẾU ${formatCurrency(Math.abs(TIEN_THUA_TRA_KHACH))}`,
            );
            setTienThuaTraKhach(0);
        } else {
            setPaymentWarning('');
            setTienThuaTraKhach(TIEN_THUA_TRA_KHACH);
        }
    };

    // ########### TEST #########
    // Mảng mệnh giá tiền
    const denominations = [1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];

    const getSuggestions = (amount) => {
        let suggestions = [];

        // Nếu số tiền lớn hơn 500000, gợi ý các mệnh giá bắt đầu từ 500000 và theo quy tắc tăng dần
        if (amount >= 500000) {
            let nextAmount = 500000;
            // Duyệt đến mệnh giá lớn hơn hoặc bằng amount
            while (nextAmount < amount) {
                nextAmount += 100000; // Tăng theo bội số 100000
            }
            // Thêm mệnh giá vào mảng gợi ý (tối thiểu là 500000, hoặc lớn hơn)
            while (nextAmount <= amount || suggestions.length < 8) {
                suggestions.push(nextAmount);
                nextAmount += 100000; // Tăng thêm bội số 100000
                if (suggestions.length >= 8) break; // Dừng lại khi đã có đủ 8 lựa chọn
            }
        } else {
            // Mảng mệnh giá tiền nếu số tiền nhỏ hơn hoặc bằng 500000
            suggestions = denominations.filter((denomination) => denomination >= amount);
        }

        if (!suggestions.includes(amount)) {
            suggestions.unshift(amount);
        }

        // Đảm bảo rằng danh sách không vượt quá 8 lựa chọn
        return suggestions.slice(0, 8);
    };

    const handleSuggestionClick2 = (amount) => {
        setKhachThanhToan(amount);
    };

    const handleAmountChange = (event) => {
        const value = parseInt(event.target.value, 10) || 0; // Đảm bảo giá trị luôn là số
        setKhachThanhToan(value);
    };

    const suggestions2 = getSuggestions(khachThanhToan);
    // ########### TEST #########

    return (
        <div className="sale-container">
            {/* DANH SÁCH SẢN PHẨM VÀ GỢI Ý TÌM KIẾM SẢN PHẨM */}
            <div style={{ backgroundColor: 'lightblue' }}>
                <form onSubmit={handleSearch} autoComplete="off">
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Tìm kiếm sản phẩm (Tên, Mã hàng, Mã vạch)"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                    <button type="submit" className="sale-btn-tim-kiem">
                        Tìm kiếm
                    </button>
                </form>

                {/* Hiển thị danh sách gợi ý */}
                {suggestions.length > 0 && (
                    <ul className="suggestion-list">
                        {suggestions.map((suggestion, index) => {
                            const searchText = searchTerm.toLowerCase();

                            // Tìm vị trí khớp trong từng trường
                            const nameStartIndex = suggestion.name.toLowerCase().indexOf(searchText);
                            const barcodeStartIndex = suggestion.barcode.toLowerCase().indexOf(searchText);
                            const priceStartIndex = suggestion.sellingPrice.toString().indexOf(searchText);

                            return (
                                <li
                                    key={index}
                                    className="list-item"
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="suggestion-item">
                                        {/* Hình ảnh sản phẩm */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                            }}
                                        >
                                            <img
                                                src={`${urlImage}${suggestion.image}`}
                                                alt={suggestion.name}
                                                style={{
                                                    width: '50px',
                                                    height: '50px',
                                                    objectFit: 'cover',
                                                    borderRadius: '5px',
                                                }}
                                            />
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    flex: 1,
                                                }}
                                            >
                                                <div>
                                                    {/* Hiển thị tên sản phẩm với từ khóa được tô đậm */}
                                                    {nameStartIndex !== -1 ? (
                                                        <div>
                                                            {suggestion.name.substring(0, nameStartIndex)}
                                                            <b>
                                                                {suggestion.name.substring(
                                                                    nameStartIndex,
                                                                    nameStartIndex + searchTerm.length,
                                                                )}
                                                            </b>
                                                            {suggestion.name.substring(
                                                                nameStartIndex + searchTerm.length,
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>{suggestion.name}</div>
                                                    )}

                                                    {/* Hiển thị mã vạch với từ khóa được tô đậm */}
                                                    {barcodeStartIndex !== -1 ? (
                                                        <div>
                                                            {suggestion.barcode.substring(0, barcodeStartIndex)}
                                                            <b>
                                                                {suggestion.barcode.substring(
                                                                    barcodeStartIndex,
                                                                    barcodeStartIndex + searchTerm.length,
                                                                )}
                                                            </b>
                                                            {suggestion.barcode.substring(
                                                                barcodeStartIndex + searchTerm.length,
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div>{suggestion.barcode}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    {/* Hiển thị giá bán với từ khóa được tô đậm */}
                                                    {priceStartIndex !== -1 ? (
                                                        <div>
                                                            {suggestion.sellingPrice
                                                                .toString()
                                                                .substring(0, priceStartIndex)}
                                                            <b>
                                                                {suggestion.sellingPrice
                                                                    .toString()
                                                                    .substring(
                                                                        priceStartIndex,
                                                                        priceStartIndex + searchTerm.length,
                                                                    )}
                                                            </b>
                                                            {suggestion.sellingPrice
                                                                .toString()
                                                                .substring(priceStartIndex + searchTerm.length)}{' '}
                                                            VND
                                                        </div>
                                                    ) : (
                                                        <div>{suggestion.sellingPrice} VND</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {error && <p style={{ color: 'red' }}>{error}</p>}
                {/* <div>
                    {searchResults.map((product) => (
                        <div key={product._id}>
                            <h4>{product.name}</h4>
                            <p>Mã hàng: {product.productCode}</p>
                            <p>Mã vạch: {product.barcode}</p>
                            <p>Mô tả: {product.description}</p>
                            <p>Giá bán: {product.sellingPrice} VND</p>
                            <img src={`${urlImage}${product.image}`} alt="image" />
                        </div>
                    ))}
                </div> */}

                <div>
                    {product_list.map(
                        (item) =>
                            cartItems[item._id] > 0 && (
                                <div key={item._id} className="cart-container">
                                    <div className="cart-items-title cart-items-item">
                                        <img
                                            onClick={() => handleProductClick(item)}
                                            title="Nhấn để xem chi tiết"
                                            className="img-san-pham"
                                            src={`${urlImage}${item.image}`}
                                            alt={item.name}
                                        />
                                        <p
                                            onClick={() => handleProductClick(item)} // Hiển thị popup khi nhấn vào tên
                                            title="Nhấn để xem chi tiết"
                                            className="cart-items-name"
                                        >
                                            {item.name}
                                        </p>
                                        <p title="Mã vạch sản phẩm">{item.barcode}</p>
                                        <p title="Giá bán sản phẩm">{formatCurrency(item.sellingPrice)}</p>
                                        {/* <p className="quantity"> - {cartItems[item._id]} + </p> */}
                                        {/* <p className="quantity">
                                            <img src={icons.remove_icon_red} alt="add icon" className="add" />
                                            {cartItems[item._id]}
                                            <img src={icons.add_icon_green} alt="add icon" className="add" />
                                        </p> */}
                                        {/* <img onClick={() => addToCart(id)} src={icon.add_icon_white} alt="add icon" className="add" /> */}
                                        {/* START */}
                                        <div className="product-item-counter">
                                            <img
                                                title="Xóa đi một sản phẩm"
                                                onClick={() => removeFromCart(item._id)}
                                                src={icons.remove_icon_red}
                                                alt="icon xóa sản phẩm"
                                            />
                                            {/* <p>{cartItems[item._id]}</p> */}
                                            <input
                                                title="Nhập số lượng sản phẩm"
                                                style={{
                                                    textAlign: 'center',
                                                    outline: 'none',
                                                    border: 'none',
                                                    maxWidth: '28px',
                                                    marginLeft: '-8px',
                                                    marginRight: '-8px',
                                                    backgroundColor: 'inherit',
                                                }}
                                                type="text"
                                                // value={cartItems[item._id]}
                                                // onChange={(e) => {
                                                //     // const value = parseInt(e.target.value, 10) || 0;
                                                //     // setGiamGia(value);
                                                // }}
                                                value={cartItems[item._id] || 0} // Hiển thị số lượng hiện tại
                                                onChange={(e) =>
                                                    updateCartItemQuantity(item._id, parseInt(e.target.value, 10) || 0)
                                                } // Gọi hàm cập nhật
                                                maxLength={3}
                                            />
                                            <img
                                                title="Thêm một sản phẩm"
                                                onClick={() => addToCart(item._id)}
                                                src={icons.add_icon_green}
                                                alt="icon thêm sản phẩm"
                                            />
                                        </div>
                                        {/* END */}
                                        <p title="Giá sản phẩm (giá bán x số lượng)">
                                            {formatCurrency(item.sellingPrice * cartItems[item._id])}
                                        </p>
                                        {/* <p onClick={() => removeFromCart(item._id)} className="cross">
                                                x
                                            </p> */}
                                    </div>
                                    <hr />
                                </div>
                            ),
                    )}

                    {/* Popup chi tiết sản phẩm */}
                    <ProductPopup product={selectedProduct} onClose={handleClosePopup} />
                </div>
            </div>

            {/* HÓA ĐƠN BÁN HÀNG */}
            <div style={{ height: '100%' }}>
                <div className="cart-bottom">
                    <div className="cart-total">
                        <h2 style={{ textAlign: 'center' }}>Hóa đơn bán hàng</h2>
                        <div>
                            <div className="cart-total-details">
                                <p>Tổng số lượng sản phẩm</p>
                                <p>{TONG_SO_LUONG_SAN_PHAM}</p>
                            </div>
                            <div className="cart-total-details">
                                <p>Tổng tiền hàng</p>
                                <p>{formatCurrency(tongTien)}</p>
                            </div>
                            <hr />
                            <div className="cart-total-details">
                                <label>Giảm giá:</label>
                                <input
                                    style={{ textAlign: 'right' }}
                                    type="text"
                                    value={giamGia}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value, 10) || 0; // Đảm bảo giá trị luôn là số
                                        setGiamGia(value);
                                    }}
                                    placeholder="Nhập giảm giá"
                                    maxLength={12}
                                />
                            </div>
                            <hr />
                            <div className="cart-total-details">
                                <p>Khách cần trả</p>
                                <p>{formatCurrency(tongTienSauGiamGia)}</p>
                            </div>
                            <hr />
                            <div className="cart-total-details">
                                <label>Khách thanh toán:</label>
                                <input
                                    style={{ textAlign: 'right' }}
                                    type="text"
                                    value={khachThanhToan}
                                    onChange={handleAmountChange}
                                    placeholder="Nhập số tiền khách thanh toán"
                                    maxLength={8}
                                />
                            </div>
                            {/* Gợi ý mệnh giá tiền */}
                            <div style={{ minHeight: '145px', maxHeight: '145px' }}>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <div>
                                        <h4>Gợi ý tiền khách trả</h4>
                                        <div>
                                            {suggestions2.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick2(suggestion)}
                                                    style={{ margin: '2px', maxWidth: '105px' }}
                                                >
                                                    {/* {suggestion.toLocaleString()} */}
                                                    {formatCurrency(suggestion)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/*  */}
                                <p style={{ color: 'red' }}>{paymentWarning}</p>
                            </div>
                            <hr />
                            <div className="cart-total-details" style={{ paddingTop: '50px' }}>
                                <b>Tiền thừa trả khách</b>
                                <b>{formatCurrency(tienThuaTraKhach)}</b>
                            </div>
                        </div>
                        <button onClick={() => console.log('Mua hàng')}>THANH TOÁN</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
