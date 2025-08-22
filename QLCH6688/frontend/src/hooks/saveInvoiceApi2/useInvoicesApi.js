// hooks/useInvoicesApi.js
import { useState } from 'react';
import axios from 'axios';

/**
 * Custom hook để gọi các API liên quan đến hóa đơn.
 * @param {string} url - URL cơ sở của API.
 * @returns {object} Các hàm và trạng thái liên quan đến API.
 */
const useInvoicesApi = (url) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [invoices, setInvoices] = useState([]);

    /**
     * Hàm xử lý lỗi chung.
     * @param {object} err - Đối tượng lỗi từ axios.
     * @param {string} defaultMessage - Thông báo lỗi mặc định.
     */
    const handleError = (err, defaultMessage) => {
        if (err.response) {
            setError(err.response.data.message || defaultMessage);
        } else if (err.request) {
            setError('Không thể kết nối đến server.');
        } else {
            setError('Có lỗi xảy ra trong quá trình yêu cầu.');
        }
        console.error('Lỗi API:', err);
    };

    /**
     * Lấy danh sách hóa đơn từ API.
     */
    const fetchInvoices = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${url}api/hoadon/danhsachhoadon`);
            const result = response.data;
            if (result.success && Array.isArray(result.data)) {
                // Ánh xạ dữ liệu để định dạng lại
                const formattedData = result.data.map((invoice) => ({
                    ...invoice,
                    _id: { $oid: invoice._id },
                    invoiceDate: { $date: invoice.invoiceDate },
                }));
                setInvoices(formattedData);
                return { success: true, data: formattedData };
            } else {
                throw new Error(result.message || 'Dữ liệu trả về không hợp lệ');
            }
        } catch (err) {
            handleError(err, 'Lỗi khi tải dữ liệu hóa đơn.');
            setInvoices([]); // Xóa dữ liệu cũ khi có lỗi
            return { success: false, data: [] };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Thêm một hóa đơn mới.
     * @param {object} invoiceData - Dữ liệu hóa đơn cần thêm.
     */
    const addInvoice = async (invoiceData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${url}api/hoadon/themhoadon`, invoiceData);
            // Sau khi thêm thành công, bạn có thể gọi lại fetchInvoices để cập nhật danh sách
            // await fetchInvoices();
            return { success: true, message: response.data.message };
        } catch (err) {
            handleError(err, 'Thêm hóa đơn thất bại.');
            return { success: false, message: err.response?.data?.message || 'Thêm hóa đơn thất bại.' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Cập nhật một hóa đơn đã tồn tại.
     * @param {string} invoiceId - ID của hóa đơn cần cập nhật.
     * @param {object} updatedData - Dữ liệu cập nhật.
     */
    const updateInvoice = async (invoiceId, updatedData) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${url}api/hoadon/capnhathoadon/${invoiceId}`, updatedData);
            // Sau khi cập nhật thành công, bạn có thể gọi lại fetchInvoices để cập nhật danh sách
            // await fetchInvoices();
            return { success: true, message: response.data.message };
        } catch (err) {
            handleError(err, 'Cập nhật hóa đơn thất bại.');
            return { success: false, message: err.response?.data?.message || 'Cập nhật hóa đơn thất bại.' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Xóa một hóa đơn.
     * @param {string} invoiceId - ID của hóa đơn cần xóa.
     */
    const deleteInvoice = async (invoiceId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.delete(`${url}api/hoadon/xoahoadon/${invoiceId}`);
            // Sau khi xóa thành công, bạn có thể gọi lại fetchInvoices để cập nhật danh sách
            // await fetchInvoices();
            return { success: true, message: response.data.message };
        } catch (err) {
            handleError(err, 'Xóa hóa đơn thất bại.');
            return { success: false, message: err.response?.data?.message || 'Xóa hóa đơn thất bại.' };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Lấy chi tiết một hóa đơn cụ thể.
     * @param {string} invoiceId - ID của hóa đơn.
     */
    const fetchInvoiceById = async (invoiceId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${url}api/hoadon/chitiethoadon/${invoiceId}`);
            return { success: true, data: response.data.data };
        } catch (err) {
            handleError(err, 'Không thể tải chi tiết hóa đơn.');
            return { success: false, data: null };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        invoices,
        fetchInvoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        fetchInvoiceById,
    };
};

export default useInvoicesApi;
