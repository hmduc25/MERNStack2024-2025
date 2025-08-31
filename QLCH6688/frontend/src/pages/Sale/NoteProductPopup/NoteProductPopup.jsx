// src/components/Sale/NoteProductPopup.jsx
import React, { useState } from 'react';
import './NoteProductPopup.css'; // Tạo file CSS tương ứng

const NoteProductPopup = ({ initialData, onClose, onSave }) => {
    // Sử dụng từ khóa tìm kiếm ban đầu để điền sẵn vào tên sản phẩm
    const [productData, setProductData] = useState({
        name: initialData.name || '',
        productCode: initialData.productCode || '',
        barcode: initialData.barcode || '',
        sellingPrice: initialData.sellingPrice || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = () => {
        // Gọi hàm onSave được truyền từ component cha
        onSave(productData);
    };

    return (
        <div className="new-product-popup-overlay">
            <div className="new-product-popup-container">
                <div className="new-product-popup-header">
                    <h2>Thêm sản phẩm mới</h2>
                    <span className="close-btn" onClick={onClose}>
                        &times;
                    </span>
                </div>
                <div className="new-product-popup-body">
                    <p>Vui lòng điền thông tin cơ bản về sản phẩm để lưu tạm thời.</p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <div className="form-group">
                            <label htmlFor="name">Tên sản phẩm</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={productData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="productCode">Mã sản phẩm</label>
                            <input
                                type="text"
                                id="productCode"
                                name="productCode"
                                value={productData.productCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="barcode">Mã vạch</label>
                            <input
                                type="text"
                                id="barcode"
                                name="barcode"
                                value={productData.barcode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="sellingPrice">Giá bán</label>
                            <input
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={productData.sellingPrice}
                                onChange={handleChange}
                            />
                        </div>
                    </form>
                </div>
                <div className="new-product-popup-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="submit" className="btn-save" onClick={handleSave}>
                        Lưu tạm thời
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteProductPopup;
