// src/hooks/useProductApi.js
import { useState, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

const useProductApi = () => {
    const { url, fetchProductList } = useContext(StoreContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Lấy thông tin sản phẩm từ server
    const fetchProduct = async (id) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${url}api/sanpham/chitietsanpham/${id}`);
            return response.data;
        } catch (err) {
            console.error('Lỗi khi lấy sản phẩm:', err);
            setError('Không thể tải dữ liệu sản phẩm.');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Cập nhật thông tin sản phẩm
    const updateProduct = async (id, formData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${url}api/sanpham/capnhatsanpham/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchProductList(); // Gọi lại hàm cập nhật danh sách sản phẩm
            return { success: true, message: response.data.message };
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            setError('Cập nhật sản phẩm thất bại.');
            return { success: false, message: 'Cập nhật sản phẩm thất bại.' };
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa sản phẩm
    const deleteProduct = async (productId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${url}api/sanpham/xoasanpham`, { id: productId });
            if (response.data.success) {
                fetchProductList(); // Cập nhật lại danh sách
            }
            return response.data;
        } catch (err) {
            console.error('Lỗi khi xóa sản phẩm:', err);
            setError('Đã xảy ra lỗi khi xóa sản phẩm.');
            return { success: false, message: 'Đã xảy ra lỗi khi xóa sản phẩm.' };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        fetchProduct,
        updateProduct,
        deleteProduct,
    };
};

export default useProductApi;
