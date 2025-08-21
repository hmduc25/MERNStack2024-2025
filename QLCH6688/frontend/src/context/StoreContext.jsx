import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
// import { product_list } from '../assets/assets_vn';
// import { products as product_list } from '../assets/products.js';

// Tạo Context: Context này sẽ giúp chia sẻ dữ liệu trong toàn bộ ứng dụng mà không cần phải truyền qua props từng cấp
export const StoreContext = createContext(null);

/** StoreContextProvider Component
 * StoreContextProvider là một component bao bọc (wrapper) được sử dụng để cung cấp giá trị của product_list cho các component con thông qua Context.
 * contextValue: Được khởi tạo với product_list, đây chính là giá trị sẽ được truyền tới các component con.
 * StoreContext.Provider: Sử dụng Provider để cung cấp contextValue cho tất cả các component con bên trong ({props.children}).
 */
const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    // backend url
    // 'http://localhost:6868/';
    const url = import.meta.env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL;
    // 'http://localhost:6868/images/';
    const urlImage = import.meta.env.VITE_BACKEND_IMAGE_URL || process.env.VITE_BACKEND_IMAGE_URL;

    const [token, setToken] = useState('');
    const [product_list, setProductList] = useState([]);

    // ADD TO CART
    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            // Thêm món ăn vào giỏ hàng: tạo ra một đối tượng mới, sao chép tất cả các mục từ prev, và thêm mục mới cho itemId với giá trị là 1.
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            // Cập nhật số lượng món ăn nếu đã tồn tại: lấy số lượng hiện tại (prev[itemId]) và cộng thêm 1
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }

        if (token) {
            await axios.post(url + 'api/cart/add', { itemId }, { headers: { token } });
        }
    };

    // REMOVE FROM CART
    const removeFromCart = async (itemId) => {
        // CASE 1
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));

        // CASE 2
        // if (cartItems[itemId] > 1) {
        //     // Cập nhật số lượng món ăn nếu đã tồn tại: lấy số lượng hiện tại (prev[itemId]) và trừ đi 1
        //     setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
        // } else {
        //     // Xóa món ăn khỏi giỏ hàng: tạo ra đối tượng mới, sao chép tất cả các mục từ prev, và loại bỏ mục mới cho itemId
        //     setCartItems((prev) => {
        //         const newCartItems = { ...prev };
        //         delete newCartItems[itemId];
        //         return newCartItems;
        //     });
        // }

        if (token) {
            await axios.post(url + 'api/cart/remove', { itemId }, { headers: { token } });
        }
    };

    // UPDATE CART (Theo số lượng user nhập vào)
    const updateCartItemQuantity = async (itemId, quantity) => {
        // Đảm bảo số lượng hợp lệ (>= 0)
        if (quantity < 0) return;

        setCartItems((prev) => ({
            ...prev,
            [itemId]: quantity,
        }));

        // Cập nhật số lượng trong API nếu có token
        if (token) {
            await axios.post(url + 'api/cart/update', { itemId, quantity }, { headers: { token } });
        }
    };

    // ⬅️ START: HÀM CLEAR CART MỚI
    const clearCart = () => {
        setCartItems({});
    };
    // ⬅️ END: HÀM CLEAR CART MỚI

    const getTotalCartAmount = () => {
        let totalAmount = 0;

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                // Tìm sản phẩm tương ứng trong danh sách product_list dựa trên _id | Để tăng hiệu suất tìm kiếm có thể thay `find()` bằng cách sử dụng `map()`
                let itemInfo = product_list.find((product) => product._id === item);
                // Tính tổng tiền
                totalAmount += itemInfo.sellingPrice * cartItems[item];
            }
        }
        return totalAmount;
    };

    const getTotalCartQuantity = () => {
        let totalQuantity = 0;

        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                totalQuantity += cartItems[item];
            }
        }

        return totalQuantity;
    };

    const fetchProductList = async () => {
        const response = await axios.get(url + 'api/sanpham/danhsachsanpham');
        setProductList(response.data.data);
    };

    const loadCartData = async (token) => {
        const response = await axios.post(url + 'api/cart/get', {}, { headers: { token } });
        setCartItems(response.data.cartData);
    };

    // Test
    // useEffect(() => {
    //     console.log('cartItems: ', cartItems);
    // }, [cartItems]);

    // get data from local storage
    useEffect(() => {
        async function loadData() {
            await fetchProductList();
            // if (localStorage.getItem('token')) {
            //     setToken(localStorage.getItem('token'));
            //     await loadCartData(localStorage.getItem('token'));
            // }
        }
        loadData();
    }, []);

    // Global Functions
    const utilityFunctions = {
        getTotalItems: () => Object.values(cartItems).reduce((sum, qty) => sum + qty, 0), // Tổng số lượng sản phẩm trong giỏ hàng
        calculateDiscount: (totalAmount, discountPercentage) => totalAmount * (1 - discountPercentage / 100), // Hàm tính giảm giá
        getCartItems: () => cartItems, // Trả về giỏ hàng hiện tại
        formatCurrency: (amount) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
        formatDateTimeFromISO8601ToVietNamDateTime: (dateString) => {
            // Sửa lại cú pháp của hàm
            const date = new Date(dateString);

            // Lấy giờ, phút, giây
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            // Lấy ngày, tháng, năm
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();

            // Trả về định dạng hh:mm:ss dd/mm/yyyy
            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        },
        formatDateFromYYYYMMDDToVietNamDate: (dateString) => {
            // Tạo đối tượng Date từ chuỗi theo định dạng 'YYYY-MM-DD'
            const date = new Date(dateString);

            // Lấy ngày, tháng, năm
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();

            // Trả về định dạng dd/mm/yyyy
            return `${day}/${month}/${year}`;
        },
        convertCategory: (category) => {
            const categoryMap = {
                dientu: 'Điện tử',
                thoitrang: 'Thời trang',
                giadung: 'Gia dụng',
                thucpham: 'Thực phẩm',
                mypham: 'Mỹ phẩm',
                thuocla: 'Thuốc lá',
                sua: 'Sữa',
                keocaosu: 'Kẹo cao su',
                nuocngot: 'Nước ngọt',
                thucphamanlien: 'Thực phẩm ăn liền',
                caphe: 'Cà phê',
                mitom: 'Mì tôm',
                pho: 'Phở',
                bun: 'Bún',
                chao: 'Cháo',
                mien: 'Miến',
                giavi: 'Gia vị',
                nuocmam: 'Nước mắm',
                thucphamdonghop: 'Thực phẩm đóng hộp',
                dauan: 'Dầu ăn',
                dodungnhabep: 'Đồ dùng nhà bếp',
                nguyenlieu: 'Nguyên liệu',
                banhkeo: 'Bánh, kẹo',
                thach: 'Thạch',
            };

            return categoryMap[category.toLowerCase()] || category;
        },
        removeSpecialChars: (input, key) => {
            const specialChars = '!@#$%^&*()_+={}[]|\\:;"\'<>,.?/~`-';
            // Nếu trường là 'name', không loại bỏ dấu ( và )
            if (key === 'name') {
                return input
                    .split('')
                    .filter(
                        (char) =>
                            !specialChars.includes(char) ||
                            char === '(' ||
                            char === ')' ||
                            char === '-' ||
                            char === ',',
                    )
                    .join('');
            }
            // Nếu trường là 'unit'
            if (key === 'unit') {
                return input
                    .split('')
                    .filter((char) => !specialChars.includes(char) || char === ',')
                    .join('');
            }
            // Nếu không phải là 'name', 'unit', hay 'purchasePrice', loại bỏ tất cả các ký tự đặc biệt
            return input
                .split('')
                .filter((char) => !specialChars.includes(char))
                .join('');
        },
    };

    const contextValue = {
        fetchProductList,
        product_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        getTotalCartAmount,
        getTotalCartQuantity,
        utilityFunctions,
        url,
        urlImage,
        token,
        setToken,
        clearCart, // ⬅️ Thêm hàm clearCart vào context value
    };
    return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
