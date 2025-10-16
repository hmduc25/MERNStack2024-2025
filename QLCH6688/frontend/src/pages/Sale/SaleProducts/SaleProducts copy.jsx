// src/Products/SaleProducts.jsx
import React, { useState, useContext, useMemo, useCallback, memo } from 'react';
import classNames from 'classnames';
import './SaleProducts.css';
import { StoreContext } from '../../../context/StoreContext';
import defaultImage from '../../../assets/images/Mystery-products.png';

// --- Component SaleCategoryQuickSelect ---
const SaleCategoryQuickSelect = memo(({ onCategorySelect, activeCategory }) => {
    // Lấy product_list và utilityFunctions (chứa convertCategory) từ StoreContext
    const { product_list, utilityFunctions } = useContext(StoreContext);
    const { convertCategory } = utilityFunctions || {}; // Dùng || {} để an toàn

    // Logic lấy danh sách category
    const categories = useMemo(() => {
        if (!product_list || product_list.length === 0) {
            return ['Tất cả'];
        }
        const uniqueCategories = Array.from(new Set(product_list.map((p) => p.category)));
        return ['Tất cả', ...uniqueCategories];
    }, [product_list]);

    const handleCategoryClick = useCallback(
        (category) => {
            onCategorySelect(category);
        },
        [onCategorySelect],
    );

    return (
        <div className="sale-category-quick-select-wrapper">
            <ul className="sale-category-quick-select">
                {categories.map((category) => (
                    <li
                        key={category}
                        className="category-button-item" // Ánh xạ mobile-category__item
                    >
                        <a
                            href="#category-select" // Thêm href để hoạt động như link
                            className={classNames('category-button', {
                                // ⚠️ Đã loại bỏ getColorClass(index)
                                'category-button--active': category === activeCategory,
                            })}
                            onClick={(e) => {
                                e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a
                                handleCategoryClick(category);
                            }}
                            title={`Lọc theo danh mục: ${category}`}
                        >
                            {/* Sử dụng convertCategory */}
                            {convertCategory
                                ? convertCategory(category.charAt(0).toUpperCase() + category.slice(1))
                                : category}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
});
// ------------------------------------------

// --- Component SaleProductCard ---
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

// --- Component SaleProducts ---
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
            products = products.filter((product) => product.category === selectedCategory);
        }

        // Giới hạn sản phẩm hiển thị (ví dụ 200 sản phẩm đầu tiên)
        return products.slice(0, 200);
    }, [product_list, selectedCategory]);

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
                            {selectedCategory === 'Tất cả' ? 'Tất cả' : selectedCategory}** để hiển thị nhanh.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SaleProducts;
