// src/hooks/useBillForm.js

import { useState, useMemo } from 'react';

export const useBillForm = (invoices) => {
    const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
    const [filterPeriod, setFilterPeriod] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');
    const [pendingSearchTerm, setPendingSearchTerm] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortCriterion, setSortCriterion] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    const toggleRow = (invoiceId) => {
        setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('vi-VN', options);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Các hàm kiểm tra ngày tháng
    const isToday = (invoiceDate) => {
        const today = new Date();
        const date = new Date(invoiceDate);
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const isThisWeek = (invoiceDate) => {
        const today = new Date();
        const date = new Date(invoiceDate);
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return date >= startOfWeek && date <= endOfWeek;
    };

    const isThisMonth = (invoiceDate) => {
        const today = new Date();
        const date = new Date(invoiceDate);
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const isSpecificDate = (invoiceDate, targetDate) => {
        const date = new Date(invoiceDate);
        const selected = new Date(targetDate);
        return (
            date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear()
        );
    };

    // Hàm xử lý sự kiện
    const handleInputChange = (event) => {
        setPendingSearchTerm(event.target.value);
    };

    const handleSearchClick = () => {
        setSearchTerm(pendingSearchTerm);
    };

    const handleSort = (criterion) => {
        if (sortCriterion === criterion) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCriterion(criterion);
            setSortOrder('desc');
        }
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
        setFilterPeriod('specificDate');
    };

    // Sử dụng useMemo để tối ưu hiệu suất, chỉ tính toán lại khi `invoices`, `filterPeriod`, `selectedDate`, hoặc `searchTerm` thay đổi.
    const filteredByPeriod = useMemo(() => {
        if (!invoices) return [];
        return invoices.filter((invoice) => {
            const invoiceDate = invoice.invoiceDate.$date;
            switch (filterPeriod) {
                case 'today':
                    return isToday(invoiceDate);
                case 'thisWeek':
                    return isThisWeek(invoiceDate);
                case 'thisMonth':
                    return isThisMonth(invoiceDate);
                case 'specificDate':
                    return selectedDate ? isSpecificDate(invoiceDate, selectedDate) : true;
                case 'all':
                default:
                    return true;
            }
        });
    }, [invoices, filterPeriod, selectedDate]);

    const filteredAndSortedInvoices = useMemo(() => {
        const filteredBySearch = filteredByPeriod.filter((invoice) => {
            const searchLower = searchTerm.toLowerCase();
            return (
                invoice.invoiceCode.toLowerCase().includes(searchLower) ||
                invoice.cashier.name.toLowerCase().includes(searchLower)
            );
        });

        return filteredBySearch.sort((a, b) => {
            let comparison = 0;
            if (sortCriterion === 'invoiceCode') {
                comparison = a.invoiceCode.localeCompare(b.invoiceCode);
            } else if (sortCriterion === 'date') {
                comparison = new Date(a.invoiceDate.$date) - new Date(b.invoiceDate.$date);
            } else if (sortCriterion === 'totalAmount') {
                comparison = a.totalAmount - b.totalAmount;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [filteredByPeriod, searchTerm, sortCriterion, sortOrder]);

    const stats = useMemo(() => {
        const invoicesToAnalyze = filteredAndSortedInvoices;
        const totalInvoices = invoicesToAnalyze.length;
        const totalProductsSold = invoicesToAnalyze.reduce((sum, invoice) => {
            return sum + invoice.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
        }, 0);
        const totalRevenue = invoicesToAnalyze.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        const completedOrders = invoicesToAnalyze.filter((inv) => inv.status === 'completed').length;
        const pendingOrders = invoicesToAnalyze.filter((inv) => inv.status === 'pending').length;
        const datesWithInvoices = new Set(
            invoicesToAnalyze.map((invoice) => {
                const date = new Date(invoice.invoiceDate.$date);
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            }),
        );
        const numberOfDays = datesWithInvoices.size;
        const averageDailyRevenue = numberOfDays > 0 ? totalRevenue / numberOfDays : 0;
        const transferPayments = invoicesToAnalyze.filter((inv) => inv.paymentDetails.method === 'Chuyển khoản').length;
        const cashPayments = invoicesToAnalyze.filter((inv) => inv.paymentDetails.method === 'Tiền mặt').length;
        const highestInvoice = invoicesToAnalyze.reduce(
            (maxInvoice, currentInvoice) => {
                return maxInvoice.totalAmount > currentInvoice.totalAmount ? maxInvoice : currentInvoice;
            },
            { totalAmount: -1 },
        );
        return {
            totalInvoices,
            totalProductsSold,
            totalRevenue,
            averageDailyRevenue,
            completedOrders,
            pendingOrders,
            transferPayments,
            cashPayments,
            highestInvoice,
        };
    }, [filteredAndSortedInvoices]);

    const todayCount = useMemo(() => invoices.filter((inv) => isToday(inv.invoiceDate.$date)).length, [invoices]);
    const thisWeekCount = useMemo(() => invoices.filter((inv) => isThisWeek(inv.invoiceDate.$date)).length, [invoices]);
    const thisMonthCount = useMemo(
        () => invoices.filter((inv) => isThisMonth(inv.invoiceDate.$date)).length,
        [invoices],
    );

    return {
        expandedInvoiceId,
        toggleRow,
        filterPeriod,
        setFilterPeriod,
        selectedDate,
        setSelectedDate,
        handleDateChange,
        pendingSearchTerm,
        handleInputChange,
        handleSearchClick,
        sortCriterion,
        sortOrder,
        handleSort,
        formatDate,
        formatCurrency,
        filteredAndSortedInvoices,
        stats,
        todayCount,
        thisWeekCount,
        thisMonthCount,
    };
};
