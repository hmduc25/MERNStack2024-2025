import React, { useState, useContext } from 'react';
import './ProductPopup.css';
import { StoreContext } from '../context/StoreContext';

const ProductPopup = ({ product, onClose }) => {
    const { urlImage, utilityFunctions } = useContext(StoreContext);
    const {
        formatDateTimeFromISO8601ToVietNamDateTime,
        formatDateFromYYYYMMDDToVietNamDate,
        formatCurrency,
        convertCategory,
        convertBrand,
        convertUnit,
    } = utilityFunctions;

    if (!product) return null;

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('popup-overlay')) {
            onClose();
        }
    };

    return (
        <div className="popup-overlay" onClick={handleOverlayClick}>
            <section className="product-popup">
                <header className="popup-header">
                    <h2 className="popup-title">Chi tiết sản phẩm</h2>
                    <button className="close-button" onClick={onClose}>
                        &times;
                    </button>
                </header>

                <div className="popup-body">
                    <div className="product-image-container">
                        <img
                            draggable={false}
                            src={`${urlImage}${product.image}`}
                            alt={product.name}
                            className="product-image"
                            onClick={() => window.open(`${urlImage}${product.image}`, '_blank')}
                        />
                    </div>

                    <div className="product-details">
                        <div className="detail-group">
                            <p className="detail-label">Tên sản phẩm:</p>
                            <p className="detail-value" title={product.name}>
                                {product.name}
                            </p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Mã sản phẩm:</p>
                            <p className="detail-value">{product.productCode}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Mã vạch:</p>
                            <p className="detail-value">{product.barcode}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Mô tả:</p>
                            <p className="detail-value">{product.description || 'Chưa có mô tả'}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Thương hiệu:</p>
                            <p className="detail-value">{convertBrand(product.brand)}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Đơn vị tính:</p>
                            <p className="detail-value">{convertUnit(product.unit)}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Đơn vị tính:</p>
                            <p className="detail-value">
                                {product.productStatus === 'active' ? 'Đang hoạt động' : 'Ngừng kinh doanh'}
                            </p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Loại hàng:</p>
                            <p className="detail-value">{convertCategory(product.category)}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Ngày nhập:</p>
                            <p className="detail-value">
                                {formatDateTimeFromISO8601ToVietNamDateTime(product.createdAt)}
                            </p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Lần cuối cập nhật:</p>
                            <p className="detail-value">
                                {formatDateTimeFromISO8601ToVietNamDateTime(product.updatedAt)}
                            </p>
                        </div>

                        <div className="detail-group">
                            <p className="detail-label">Giá bán:</p>
                            <p className="detail-value selling-price">{formatCurrency(product.sellingPrice)}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Tồn kho:</p>
                            <p className="detail-value">{product.totalQuantity}</p>
                        </div>
                        <div className="detail-group">
                            <p className="detail-label">Ghi chú:</p>
                            <p className="detail-value">{product.notes || 'Không có'}</p>
                        </div>

                        <div className="supplier-info">
                            <h4 className="supplier-title">Thông tin nhập hàng</h4>
                            <div className="detail-group">
                                <p className="detail-label">Nhà phân phối:</p>
                                <p className="detail-value">{product.supplier.name}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Số điện thoại:</p>
                                <p className="detail-value">{product.supplier.contact}</p>
                            </div>
                            <div className="detail-group">
                                <p className="detail-label">Địa chỉ:</p>
                                <p className="detail-value">{product.supplier.address}</p>
                            </div>
                        </div>

                        {product.batches && product.batches.length > 0 ? (
                            <div className="batches-info">
                                <h4 className="batches-title">Thông tin lô hàng</h4>
                                {product.batches.map((batch, index) => (
                                    <div key={index} className="batch-item">
                                        <div className="detail-group">
                                            <p className="detail-label">Số lô {index + 1}:</p>
                                            <p className="detail-value">{batch.batchNumber}</p>
                                        </div>
                                        <div className="detail-group">
                                            <p className="detail-label">Ngày nhập:</p>
                                            <p className="detail-value">
                                                {formatDateFromYYYYMMDDToVietNamDate(batch.entryDate)}
                                            </p>
                                        </div>
                                        <div className="detail-group">
                                            <p className="detail-label">Hạn sử dụng:</p>
                                            <p className="detail-value">
                                                {formatDateFromYYYYMMDDToVietNamDate(batch.expirationDate)}
                                            </p>
                                        </div>
                                        <div className="detail-group">
                                            <p className="detail-label">Số lượng:</p>
                                            <p className="detail-value">{batch.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-batches">Chưa có thông tin về các lô hàng.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ProductPopup;
