import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Notes.css';

const API_BASE_URL = 'http://localhost:6868/api/raw-product';

// Hàm để định dạng ngày tháng
const formatDateTime = (isoDateString) => {
    const date = new Date(isoDateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };
    return date.toLocaleString('vi-VN', options);
};

const Notes = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function để fetch dữ liệu từ API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/danhsachghichu`);
            setProducts(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', err);
            setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component được mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Function để cập nhật trạng thái của một ghi chú
    const handleUpdateNote = async (productId) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/capnhattrangthaighichu`, {
                id: productId,
            });

            if (response.data.success) {
                // Cập nhật trạng thái của sản phẩm trong state
                setProducts((prevProducts) =>
                    prevProducts.map((product) =>
                        product._id === productId ? { ...product, isUpdated: true } : product,
                    ),
                );
                alert(response.data.message);
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            alert('Lỗi khi cập nhật trạng thái. Vui lòng kiểm tra console.');
        }
    };

    if (loading) {
        return <div className="notes__status">Đang tải...</div>;
    }

    if (error) {
        return <div className="notes__status notes__status--error">{error}</div>;
    }

    return (
        <div className="notes">
            <h1 className="notes__title">Danh sách Ghi chú Sản phẩm</h1>
            <ul className="notes__list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <li key={product._id} className="notes__item">
                            <div className="notes__info">
                                <h3 className="notes__name">{product.name}</h3>
                                <p className="notes__code">Mã sản phẩm: {product.productCode}</p>
                                <p className="notes__price">Giá bán: {product.sellingPrice}</p>
                                <p className="notes__date">
                                    Thời gian tạo ghi chú: {formatDateTime(product.createdAt)}
                                </p>
                            </div>
                            {!product.isUpdated && (
                                <button
                                    className="notes__button notes__button--update"
                                    onClick={() => handleUpdateNote(product._id)}
                                >
                                    Đã cập nhật
                                </button>
                            )}
                        </li>
                    ))
                ) : (
                    <div className="notes__status">Không có ghi chú nào.</div>
                )}
            </ul>
        </div>
    );
};

export default Notes;
