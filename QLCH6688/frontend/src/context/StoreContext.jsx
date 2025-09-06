import axios from 'axios';
import { createContext, useEffect, useState } from 'react';

import { categories } from '../assets/categories';
import { brands, units } from '../assets/brandsAndSuppliers';

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = import.meta.env.VITE_BACKEND_URL || process.env.VITE_BACKEND_URL;
    const urlImage = import.meta.env.VITE_BACKEND_IMAGE_URL || process.env.VITE_BACKEND_IMAGE_URL;

    const [token, setToken] = useState('');
    const [product_list, setProductList] = useState([]);

    /**
     * @description Thêm sản phẩm vào giỏ hàng và cập nhật lên server nếu người dùng đã đăng nhập.
     * @param {string} itemId ID của sản phẩm cần thêm.
     */
    const addToCart = async (itemId) => {
        setCartItems((prev) => {
            const newCartItems = { ...prev };
            newCartItems[itemId] = (newCartItems[itemId] || 0) + 1;
            return newCartItems;
        });

        if (token) {
            await axios.post(url + 'api/cart/add', { itemId }, { headers: { token } });
        }
    };

    /**
     * @description Giảm số lượng hoặc xóa sản phẩm khỏi giỏ hàng và cập nhật lên server nếu người dùng đã đăng nhập.
     * @param {string} itemId ID của sản phẩm cần xóa.
     */
    const removeFromCart = async (itemId) => {
        setCartItems((prev) => {
            const newCartItems = { ...prev };
            if (newCartItems[itemId] > 1) {
                newCartItems[itemId] -= 1;
            } else {
                delete newCartItems[itemId];
            }
            return newCartItems;
        });

        if (token) {
            await axios.post(url + 'api/cart/remove', { itemId }, { headers: { token } });
        }
    };

    /**
     * @description Cập nhật số lượng sản phẩm trong giỏ hàng theo giá trị nhập vào và đồng bộ với server.
     * @param {string} itemId ID của sản phẩm.
     * @param {number} quantity Số lượng mới.
     */
    const updateCartItemQuantity = async (itemId, quantity) => {
        if (quantity < 0) return;

        setCartItems((prev) => ({
            ...prev,
            [itemId]: quantity,
        }));

        if (token) {
            await axios.post(url + 'api/cart/update', { itemId, quantity }, { headers: { token } });
        }
    };

    /**
     * @description Xóa tất cả sản phẩm khỏi giỏ hàng.
     */
    const clearCart = () => {
        setCartItems({});
    };

    /**
     * @description Tính tổng số tiền của các sản phẩm trong giỏ hàng.
     * @returns {number} Tổng số tiền.
     */
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = product_list.find((product) => product._id === item);
                if (itemInfo) {
                    totalAmount += itemInfo.sellingPrice * cartItems[item];
                }
            }
        }
        return totalAmount;
    };

    /**
     * @description Tính tổng số lượng sản phẩm trong giỏ hàng.
     * @returns {number} Tổng số lượng.
     */
    const getTotalCartQuantity = () => {
        return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
    };

    /**
     * @description Gọi API để lấy danh sách sản phẩm.
     */
    const fetchProductList = async () => {
        const response = await axios.get(url + 'api/sanpham/danhsachsanpham');
        setProductList(response.data.data);
    };

    /**
     * @description Tải dữ liệu giỏ hàng từ server.
     * @param {string} token Token xác thực người dùng.
     */
    const loadCartData = async (token) => {
        const response = await axios.post(url + 'api/cart/get', {}, { headers: { token } });
        setCartItems(response.data.cartData);
    };

    useEffect(() => {
        async function loadData() {
            await fetchProductList();
            if (localStorage.getItem('token')) {
                setToken(localStorage.getItem('token'));
                await loadCartData(localStorage.getItem('token'));
            }
        }
        loadData();
    }, []);

    const categoryMap = categories.reduce((map, category) => {
        map[category.value] = category.label;
        return map;
    }, {});

    const brandMap = brands.reduce((map, brand) => {
        map[brand.value] = brand.label;
        return map;
    }, {});

    const unitMap = units.reduce((map, unit) => {
        map[unit.value] = unit.label;
        return map;
    }, {});

    const utilityFunctions = {
        calculateDiscount: (totalAmount, discountPercentage) => totalAmount * (1 - discountPercentage / 100),
        getCartItems: () => cartItems,
        formatCurrency: (amount) =>
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
        formatDateTimeFromISO8601ToVietNamDateTime: (dateString) => {
            const date = new Date(dateString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
        },
        formatDateFromYYYYMMDDToVietNamDate: (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        convertCategory: (category) => {
            return categoryMap[category.toLowerCase()] || category;
        },
        convertBrand: (brand) => {
            return brandMap[brand.toLowerCase()] || brand;
        },
        convertUnit: (unit) => {
            return unitMap[unit.toLowerCase()] || unit;
        },
        removeSpecialChars: (input, key) => {
            const specialChars = '!@#$%^&*()_+={}[]|\\:;"\'<>,.?/~`'; // Bỏ gạch ngang '-' ra khỏi chuỗi

            if (key === 'name') {
                const allowedSpecialCharsForName = ['(', ')', '-', ','];
                return input
                    .split('')
                    .filter((char) => !specialChars.includes(char) || allowedSpecialCharsForName.includes(char))
                    .join('');
            }

            if (key === 'unit') {
                const allowedSpecialCharsForUnit = ['-', '_'];
                return input
                    .split('')
                    .filter((char) => !specialChars.includes(char) || allowedSpecialCharsForUnit.includes(char))
                    .join('');
            }

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
        clearCart,
    };

    return <StoreContext.Provider value={contextValue}>{props.children}</StoreContext.Provider>;
};

export default StoreContextProvider;
