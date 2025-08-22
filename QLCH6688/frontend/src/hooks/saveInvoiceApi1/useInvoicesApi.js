// hooks/useInvoicesApi.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Custom hook để gọi API lấy danh sách hóa đơn
const useInvoicesApi = (url) => {
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = `${url}api/hoadon/danhsachhoadon`;

    useEffect(() => {
        const fetchInvoices = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(apiUrl);
                const result = response.data;

                if (result.success && Array.isArray(result.data)) {
                    const formattedData = result.data.map((invoice) => ({
                        ...invoice,
                        _id: { $oid: invoice._id },
                        invoiceDate: { $date: invoice.invoiceDate },
                    }));
                    setInvoices(formattedData);
                } else {
                    throw new Error(result.message || 'Dữ liệu trả về không hợp lệ');
                }
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.message || 'Lỗi khi tải dữ liệu hóa đơn.');
                } else if (err.request) {
                    setError('Không thể kết nối đến server.');
                } else {
                    setError('Có lỗi xảy ra trong quá trình yêu cầu.');
                }
                console.error('Lỗi khi tải hóa đơn:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInvoices();
    }, [apiUrl]);

    return { invoices, isLoading, error };
};

export default useInvoicesApi;
