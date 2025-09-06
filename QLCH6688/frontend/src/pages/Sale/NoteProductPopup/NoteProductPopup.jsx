// src/components/Sale/NoteProductPopup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './NoteProductPopup.css';
import { toast } from 'react-toastify';

const NoteProductPopup = ({ initialData, onClose, url }) => {
    const [productData, setProductData] = useState({
        name: initialData.name || '',
        productCode: initialData.productCode || '',
        barcode: initialData.barcode || '',
        sellingPrice: initialData.sellingPrice || '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!productData.name) {
            toast.error('Tên sản phẩm là bắt buộc.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(`${url}api/raw-product/themghichu`, productData);
            console.log('Sản phẩm thô đã được lưu vào database:', response.data);

            toast.success(`Đã lưu sản phẩm với "${productData.name}" vào ghi chú thành công`);

            setTimeout(() => {
                onClose();
            }, 2000); // Đóng popup sau 2 giây
        } catch (err) {
            console.error('Lỗi khi lưu sản phẩm thô:', err);
            toast.error('Lỗi khi lưu sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="note-product-popup">
            <div className="note-product-popup__container">
                <div className="note-product-popup__header">
                    <h2 className="note-product-popup__title">Thêm sản phẩm thô</h2>
                    <span className="note-product-popup__close-btn" onClick={onClose}>
                        &times;
                    </span>
                </div>
                <div className="note-product-popup__body">
                    <p className="note-product-popup__description">
                        Vui lòng điền thông tin cơ bản về sản phẩm để lưu vào database.
                    </p>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSave();
                        }}
                    >
                        <div className="note-product-popup__form-group">
                            <label className="note-product-popup__label" htmlFor="name">
                                Tên sản phẩm *
                            </label>
                            <input
                                className="note-product-popup__input"
                                type="text"
                                id="name"
                                name="name"
                                value={productData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="note-product-popup__form-group">
                            <label className="note-product-popup__label" htmlFor="productCode">
                                Mã sản phẩm
                            </label>
                            <input
                                className="note-product-popup__input"
                                type="text"
                                id="productCode"
                                name="productCode"
                                value={productData.productCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="note-product-popup__form-group">
                            <label className="note-product-popup__label" htmlFor="barcode">
                                Mã vạch
                            </label>
                            <input
                                className="note-product-popup__input"
                                type="number"
                                id="barcode"
                                name="barcode"
                                value={productData.barcode}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="note-product-popup__form-group">
                            <label className="note-product-popup__label" htmlFor="sellingPrice">
                                Giá bán
                            </label>
                            <input
                                className="note-product-popup__input"
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={productData.sellingPrice}
                                onChange={handleChange}
                            />
                        </div>
                    </form>
                </div>
                <div className="note-product-popup__footer">
                    <button
                        type="button"
                        className="note-product-popup__btn note-product-popup__btn--cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="note-product-popup__btn note-product-popup__btn--save"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu tạm thời'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteProductPopup;
