import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import defaultImage from '../../assets/images/Mystery-products.png';
import './ProductCard.css';

// Component để hiển thị một sản phẩm dưới dạng Card/Thẻ
const ProductCard = memo(({ product, urlImage, utilityFunctions }) => {
    const { formatCurrency, convertCategory } = utilityFunctions;

    // Sử dụng useCallback để tạo ra một hàm ổn định.
    const handleDetail = useCallback(() => {
        // Có thể thay đổi thành Link nếu bạn muốn điều hướng nội bộ mà không mở tab mới
        const url = `/sanpham/chitietsanpham/${product._id}`;
        window.open(url, '_blank');
    }, [product._id]);

    return (
        <div className="product-card">
            <div className="card-image-container">
                <img
                    draggable={false}
                    // src={`${urlImage}/${product.image}`}
                    src={product.image}
                    alt={product.name || 'Sản phẩm'}
                    className="product-card-image"
                    onError={(e) => {
                        e.target.src = defaultImage;
                    }}
                />
            </div>
            <div className="card-info">
                {/* Mã sản phẩm */}
                <div className="product-code">
                    <span className="label">Mã SP:</span>
                    <span className="value">{product.productCode}</span>
                </div>

                {/* Tên sản phẩm */}
                <div className="product-name">{product.name}</div>

                {/* Giá bán */}
                <div className="product-price">{formatCurrency(product.sellingPrice)}</div>

                {/* Nhóm hàng & Tồn kho */}
                <div className="product-details-row">
                    <span className="product-category">{convertCategory(product.category)}</span>
                    <span className="product-stock">
                        Tồn: <strong>{product.totalQuantity}</strong>
                    </span>
                </div>
            </div>
            <div className="card-actions">
                <button className="detail-btn" onClick={handleDetail}>
                    Chi tiết
                </button>
            </div>
        </div>
    );
});

export default ProductCard;
