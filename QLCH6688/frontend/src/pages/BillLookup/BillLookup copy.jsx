import { useState, useContext } from 'react';
import './BillLookup.css';

import useInvoicesApi from '../../hooks/useInvoicesApi';
import { StoreContext } from '../../context/StoreContext';

const BillLookup = () => {
    const { url } = useContext(StoreContext);
    const apiUrl = `${url}api/hoadon/danhsachhoadon`;

    const { invoices, isLoading, error } = useInvoicesApi(url);

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

    const filteredByPeriod = invoices.filter((invoice) => {
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

    const filteredBySearch = filteredByPeriod.filter((invoice) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice.invoiceCode.toLowerCase().includes(searchLower) ||
            invoice.cashier.name.toLowerCase().includes(searchLower)
        );
    });

    const sortedInvoices = filteredBySearch.sort((a, b) => {
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

    const calculateStatistics = () => {
        const invoicesToAnalyze = sortedInvoices;
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
    };

    const stats = calculateStatistics();

    // 🌟 Hiển thị giao diện dựa trên trạng thái isLoading và error
    if (isLoading) {
        return (
            <div className="bill-lookup">
                <p className="loading-message">Đang tải dữ liệu hóa đơn... ⏳</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bill-lookup">
                <p className="error-message">❌ Lỗi: {error}. Vui lòng thử lại sau.</p>
            </div>
        );
    }

    return (
        <div className="bill-lookup">
            <h2 className="bill-lookup__title">Lịch Sử Hóa Đơn</h2>

            <div className="bill-lookup__controls">
                <div className="bill-lookup__search-sort">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Mã HĐ hoặc tên thu ngân..."
                            value={pendingSearchTerm}
                            onChange={handleInputChange}
                            className="search-bar__input"
                        />
                        <button onClick={handleSearchClick} className="search-bar__button">
                            Tìm kiếm
                        </button>
                    </div>

                    <div className="sort-buttons">
                        <span className="sort-buttons__label">Sắp xếp theo:</span>
                        <button
                            onClick={() => handleSort('date')}
                            className={`sort-buttons__item ${
                                sortCriterion === 'date' ? 'sort-buttons__item--active' : ''
                            }`}
                        >
                            Ngày 🗓️ {sortCriterion === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSort('invoiceCode')}
                            className={`sort-buttons__item ${
                                sortCriterion === 'invoiceCode' ? 'sort-buttons__item--active' : ''
                            }`}
                        >
                            Mã HĐ #️⃣ {sortCriterion === 'invoiceCode' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSort('totalAmount')}
                            className={`sort-buttons__item ${
                                sortCriterion === 'totalAmount' ? 'sort-buttons__item--active' : ''
                            }`}
                        >
                            Tổng tiền 💰 {sortCriterion === 'totalAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                </div>

                <div className="filter-buttons">
                    <button
                        onClick={() => {
                            setFilterPeriod('all');
                            setSelectedDate('');
                        }}
                        className={`filter-buttons__item ${
                            filterPeriod === 'all' ? 'filter-buttons__item--active' : ''
                        }`}
                    >
                        Tất cả
                    </button>
                    <button
                        onClick={() => {
                            setFilterPeriod('today');
                            setSelectedDate('');
                        }}
                        className={`filter-buttons__item ${
                            filterPeriod === 'today' ? 'filter-buttons__item--active' : ''
                        }`}
                    >
                        Hôm nay ({invoices.filter((inv) => isToday(inv.invoiceDate.$date)).length})
                    </button>
                    <button
                        onClick={() => {
                            setFilterPeriod('thisWeek');
                            setSelectedDate('');
                        }}
                        className={`filter-buttons__item ${
                            filterPeriod === 'thisWeek' ? 'filter-buttons__item--active' : ''
                        }`}
                    >
                        Tuần này ({invoices.filter((inv) => isThisWeek(inv.invoiceDate.$date)).length})
                    </button>
                    <button
                        onClick={() => {
                            setFilterPeriod('thisMonth');
                            setSelectedDate('');
                        }}
                        className={`filter-buttons__item ${
                            filterPeriod === 'thisMonth' ? 'filter-buttons__item--active' : ''
                        }`}
                    >
                        Tháng này ({invoices.filter((inv) => isThisMonth(inv.invoiceDate.$date)).length})
                    </button>
                    <div className="date-picker-container">
                        <span className="sort-buttons__label">Tìm kiếm theo ngày:</span>

                        <input type="date" value={selectedDate} onChange={handleDateChange} className="date-picker" />
                    </div>
                </div>
            </div>

            <div className="bill-list">
                {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                        <div
                            key={invoice._id.$oid}
                            className={`invoice-card ${
                                expandedInvoiceId === invoice._id.$oid ? 'invoice-card--expanded' : ''
                            }`}
                            onClick={() => toggleRow(invoice._id.$oid)}
                        >
                            <div className="invoice-card__summary">
                                <div className="invoice-card__left">
                                    <p className="invoice-card__code">
                                        <span>Mã hóa đơn:</span> {invoice.invoiceCode}
                                    </p>
                                    <p className="invoice-card__cashier">
                                        <span>Thu ngân:</span> {invoice.cashier.name}
                                    </p>
                                </div>
                                <div className="invoice-card__right">
                                    <p className="invoice-card__total-amount">{formatCurrency(invoice.totalAmount)}</p>
                                    <p className="invoice-card__date">{formatDate(invoice.invoiceDate.$date)}</p>
                                </div>
                            </div>
                            <div className="invoice-card__details">
                                <div className="details-item">
                                    <span className="details-item__label">Trạng thái:</span>
                                    <span className="details-item__value">
                                        {invoice.status === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                                    </span>
                                </div>
                                <div className="details-item">
                                    <span className="details-item__label">Thanh toán:</span>
                                    <span className="details-item__value">{invoice.paymentDetails.method}</span>
                                </div>
                                <div className="details-item">
                                    <span className="details-item__label">Tiền nhận:</span>
                                    <span className="details-item__value">
                                        {formatCurrency(invoice.paymentDetails.soTienDaNhan)}
                                    </span>
                                </div>

                                <h4 className="details-title">Chi tiết sản phẩm</h4>
                                <ul className="details-product-list">
                                    {invoice.items.map((item) => (
                                        <li key={item.productId} className="details-product-item">
                                            <span className="product-name">{item.productName}</span>
                                            <span className="product-info">
                                                {item.quantity} x {formatCurrency(item.unitPrice)}
                                            </span>
                                            <span className="product-total">{formatCurrency(item.totalPrice)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-invoices-message">
                        Không có hóa đơn nào trong khoảng thời gian hoặc tìm kiếm này.
                    </p>
                )}
            </div>

            {/* Thêm footer thống kê */}
            {sortedInvoices.length > 0 && (
                <div className="bill-lookup__footer">
                    <h3 className="footer__title">Thống Kê Tổng Hợp</h3>
                    <div className="footer__grid">
                        {/* Phần tử mới, dùng để nhóm 3 ô đầu tiên */}
                        <div className="footer__stats-row">
                            <div className="footer__item">
                                <span className="footer__label">Tổng số hóa đơn</span>
                                <span className="footer__value footer__value--large">{stats.totalInvoices}</span>
                            </div>
                            <div className="footer__item">
                                <span className="footer__label">Tổng SP đã bán</span>
                                <span className="footer__value footer__value--large">{stats.totalProductsSold}</span>
                            </div>
                            {/* stats.highestInvoice.invoiceCode */}
                            <div className="footer__item">
                                <span className="footer__label">Hóa đơn cao nhất</span>
                                <span className="footer__value footer__value--large">
                                    {formatCurrency(stats.highestInvoice.totalAmount)}
                                </span>
                            </div>
                        </div>

                        <div className="footer__grid-semi">
                            <div className="footer__item footer__item--full-width">
                                <span className="footer__label">Tổng tiền</span>
                                <span className="footer__value footer__value--revenue">
                                    {formatCurrency(stats.totalRevenue)}
                                </span>
                            </div>

                            <div className="footer__item">
                                <span className="footer__label">Hoàn thành</span>
                                <span className="footer__value footer__value--completed">{stats.completedOrders}</span>
                            </div>
                            <div className="footer__item">
                                <span className="footer__label">Chưa hoàn thành</span>
                                <span className="footer__value footer__value--pending">{stats.pendingOrders}</span>
                            </div>
                            <div className="footer__item">
                                <span className="footer__label">Chuyển khoản</span>
                                <span className="footer__value">{stats.transferPayments}</span>
                            </div>
                            <div className="footer__item">
                                <span className="footer__label">Tiền mặt</span>
                                <span className="footer__value">{stats.cashPayments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillLookup;
