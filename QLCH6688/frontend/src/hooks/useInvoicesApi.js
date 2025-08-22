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
            setError('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.');
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
     * Cập nhật trạng thái của một hóa đơn.
     * @param {string} invoiceId - ID của hóa đơn cần cập nhật.
     * @param {string} newStatus - Trạng thái mới (ví dụ: 'completed').
     */
    const updateInvoiceStatus = async (invoiceId, newStatus) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${url}api/hoadon/capnhat/${invoiceId}`, {
                status: newStatus,
            });

            const result = response.data;
            if (result.success) {
                console.log('Cập nhật trạng thái hóa đơn thành công:', result.data);
                await fetchInvoices();
                return { success: true };
            } else {
                throw new Error(result.message || 'Cập nhật trạng thái không thành công.');
            }
        } catch (err) {
            handleError(err, 'Lỗi khi cập nhật trạng thái hóa đơn.');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        invoices,
        fetchInvoices,
        updateInvoiceStatus,
    };
};

export default useInvoicesApi;
