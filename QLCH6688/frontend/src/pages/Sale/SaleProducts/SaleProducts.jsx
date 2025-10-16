// src/Products/SaleProducts.jsx
import React, { useState, useContext, useMemo, useCallback, memo } from 'react';
import classNames from 'classnames';
import './SaleProducts.css';
import { StoreContext } from '../../../context/StoreContext';
import defaultImage from '../../../assets/images/Mystery-products.png';

// --- Khai báo hằng số cho danh mục đặc biệt ---
const SPECIAL_CATEGORY_KEY = 'sp_dac_biet';
const SPECIAL_CATEGORY_DISPLAY = 'Sản phẩm đặc biệt';

// ------------------------------------------
// --- Component SaleCategoryQuickSelect ---
// ------------------------------------------
const SaleCategoryQuickSelect = memo(({ onCategorySelect, activeCategory }) => {
    // Lấy product_list và utilityFunctions (chứa convertCategory) từ StoreContext
    const { product_list, utilityFunctions } = useContext(StoreContext);
    const { convertCategory } = utilityFunctions || {}; // Dùng || {} để an toàn

    // Logic lấy danh sách category
    const categories = useMemo(() => {
        if (!product_list || product_list.length === 0) {
            return ['Tất cả'];
        }

        // 1. Lấy các category duy nhất hiện có (Loại bỏ trùng lặp)
        const uniqueCategories = Array.from(new Set(product_list.map((p) => p.category)));

        // Lấy danh sách category thông thường (không bao gồm 'Tất cả')
        const otherCategories = uniqueCategories.filter((c) => c !== 'Tất cả');

        // 2. Kiểm tra xem có sản phẩm đặc biệt (SKU_) nào không
        const hasSpecialProducts = product_list.some((p) => p.barcode && String(p.barcode).startsWith('SKU_'));

        // 3. Xây dựng danh sách cuối cùng theo thứ tự mong muốn: ['Tất cả', 'sp_dac_biet', ...còn lại]
        let result = ['Tất cả']; // Bắt đầu bằng 'Tất cả'

        if (hasSpecialProducts) {
            // Thêm category đặc biệt ngay sau 'Tất cả'
            result.push(SPECIAL_CATEGORY_KEY);
        }

        // Thêm các category thông thường còn lại
        result.push(...otherCategories);

        return result;
    }, [product_list]);

    const handleCategoryClick = useCallback(
        (category) => {
            onCategorySelect(category);
        },
        [onCategorySelect],
    );

    // Hàm chuyển đổi category key thành tên hiển thị
    const getCategoryDisplayName = useCallback(
        (category) => {
            if (category === SPECIAL_CATEGORY_KEY) {
                return SPECIAL_CATEGORY_DISPLAY;
            }

            // Xử lý category thông thường và áp dụng convertCategory
            if (category === 'Tất cả') {
                return 'Tất cả';
            }

            // Chuyển ký tự đầu tiên thành chữ hoa
            let displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
            return convertCategory ? convertCategory(displayCategory) : displayCategory;
        },
        [convertCategory],
    );

    return (
        <div className="sale-category-quick-select-wrapper">
            <ul className="sale-category-quick-select">
                {categories.map((category) => (
                    <li key={category} className="category-button-item">
                        <a
                            href="#category-select"
                            className={classNames('category-button', {
                                // ⚠️ Đã loại bỏ getColorClass(index)
                                'category-button--active': category === activeCategory,
                            })}
                            onClick={(e) => {
                                e.preventDefault();
                                handleCategoryClick(category);
                            }}
                            title={`Lọc theo danh mục: ${getCategoryDisplayName(category)}`}
                        >
                            {getCategoryDisplayName(category)}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
});
// ------------------------------------------

// ------------------------------------------
// --- Component SaleProductCard ---
// ------------------------------------------
const SaleProductCard = memo(({ product, urlImage, formatCurrency, addToCart }) => {
    // Chỉ cần hiển thị thông tin và nút/sự kiện thêm hàng
    const handleAddToCart = useCallback(() => {
        // Gọi hàm thêm vào giỏ hàng được truyền từ Sale.jsx
        addToCart(product);
    }, [addToCart, product]);

    return (
        <div
            className="product-card sale-card" // Thêm class sale-card để tùy chỉnh CSS cho màn hình bán hàng
            onClick={handleAddToCart}
            title={`Nhấn để thêm: ${product.name} | Giá: ${formatCurrency(product.sellingPrice)}`}
        >
            <img
                className="product-image"
                src={`${urlImage}${product.image}`}
                alt={product.name || 'Sản phẩm'}
                draggable={false}
                onError={(e) => {
                    e.target.src = defaultImage;
                }}
            />
            <div className="product-info">
                <p className="product-name">{product.name}</p>
                <p className="product-price">{formatCurrency(product.sellingPrice)}</p>
                <p className="product-barcode">{product.barcode}</p>
            </div>
        </div>
    );
});
// ------------------------------------------

// ------------------------------------------
// --- Component SaleProducts ---
// ------------------------------------------
const SaleProducts = ({ product_list, formatCurrency, urlImage, addToCart }) => {
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');

    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
    }, []);

    // Lọc danh sách sản phẩm theo category đã chọn
    const filteredProducts = useMemo(() => {
        if (!product_list || product_list.length === 0) {
            return [];
        }

        let products = product_list;

        if (selectedCategory !== 'Tất cả') {
            if (selectedCategory === SPECIAL_CATEGORY_KEY) {
                // Logic lọc cho Sản phẩm đặc biệt (barcode bắt đầu bằng 'SKU_')
                products = products.filter((product) => product.barcode && String(product.barcode).startsWith('SKU_'));
            } else {
                // Lọc theo category thông thường
                products = products.filter((product) => product.category === selectedCategory);
            }
        }

        // Giới hạn sản phẩm hiển thị (ví dụ 200 sản phẩm đầu tiên)
        return products.slice(0, 200);
    }, [product_list, selectedCategory]);

    // Hàm hỗ trợ để lấy tên hiển thị của category cho thông báo
    const getDisplayCategoryName = (category) => {
        if (category === SPECIAL_CATEGORY_KEY) {
            return SPECIAL_CATEGORY_DISPLAY;
        }
        // Hiển thị tên category với ký tự đầu viết hoa
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    return (
        <div className="sale-products-container">
            {/* Thanh chọn nhanh category */}
            <SaleCategoryQuickSelect onCategorySelect={handleCategorySelect} activeCategory={selectedCategory} />

            <div className="sale-products-grid-container__wrapper">
                <div className="sale-products-grid-container__grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                            <SaleProductCard
                                key={product._id}
                                product={product}
                                urlImage={urlImage}
                                formatCurrency={formatCurrency}
                                addToCart={addToCart}
                            />
                        ))
                    ) : (
                        <div className="sale-products-grid-container__message">
                            Không tìm thấy sản phẩm nào trong danh mục **
                            {getDisplayCategoryName(selectedCategory)}** để hiển thị nhanh.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaleProducts;
