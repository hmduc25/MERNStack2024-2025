import { useState, useContext, useEffect } from 'react';
import './BillLookup.css';

import useInvoicesApi from '../../hooks/useInvoicesApi';
import { StoreContext } from '../../context/StoreContext';
import { useBillForm } from '../../hooks/useBillForm';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';

const BillLookup = () => {
    const { url } = useContext(StoreContext);
    const { invoices, isLoading, error, fetchInvoices, updateInvoiceStatus } = useInvoicesApi(url);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const {
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
    } = useBillForm(invoices);

    const handleConfirmPayment = async (invoiceId, event) => {
        // Ngăn chặn sự kiện nổi bọt để không làm đóng/mở chi tiết hóa đơn
        event.stopPropagation();

        // Tùy chọn: Thêm một cửa sổ xác nhận để tránh người dùng nhấp nhầm
        const isConfirmed = window.confirm('Bạn có chắc chắn muốn xác nhận hóa đơn này đã thanh toán?');
        if (!isConfirmed) {
            return;
        }

        // Gọi hàm cập nhật từ hook
        const result = await updateInvoiceStatus(invoiceId, 'completed');
        if (result.success) {
            alert('Cập nhật trạng thái thành công!');
        } else {
            alert('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
        }
    };

    if (isLoading || error) {
        return (
            <div className="bill-lookup">
                <StatusDisplaySpinner isLoading={isLoading} error={error} />
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
            <h2 className="bill-lookup__title">LỊCH SỬ HÓA ĐƠN</h2>

            <div className="bill-lookup__controls">
                <div className="bill-lookup__search-sort">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Mã hóa đơn hoặc tên thu ngân..."
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
                        Hôm nay ({todayCount})
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
                        Tuần này ({thisWeekCount})
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
                        Tháng này ({thisMonthCount})
                    </button>
                    <div className="date-picker-container">
                        <span className="sort-buttons__label">Tìm kiếm theo ngày:</span>

                        <input type="date" value={selectedDate} onChange={handleDateChange} className="date-picker" />
                    </div>
                </div>
            </div>

            <div className="bill-list">
                {filteredAndSortedInvoices.length > 0 ? (
                    filteredAndSortedInvoices.map((invoice) => (
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
                                        {invoice.status !== 'completed' && <span> (Chưa thanh toán)</span>}
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
                                    <div className="details-item__button-container">
                                        {invoice.status !== 'completed' && (
                                            <button
                                                className="confirm-payment-button"
                                                onClick={(event) => handleConfirmPayment(invoice._id.$oid, event)}
                                            >
                                                Xác nhận đã thanh toán
                                            </button>
                                        )}
                                        <span
                                            className={`details-item__value ${
                                                invoice.status === 'completed' ? 'status-completed' : 'status-pending'
                                            }`}
                                        >
                                            {invoice.status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                        </span>
                                    </div>
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
            {filteredAndSortedInvoices.length > 0 && (
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
                                <span className="footer__label">Tổng tiền của tất cả các hóa đơn</span>
                                <span className="footer__value footer__value--revenue">
                                    {formatCurrency(stats.totalRevenue)}
                                </span>
                            </div>

                            <div className="footer__item">
                                <span className="footer__label">hóa đơn đã thanh toán</span>
                                <span className="footer__value footer__value--completed">{stats.completedOrders}</span>
                            </div>
                            <div className="footer__item">
                                <span className="footer__label">hóa đơn chưa thanh toán</span>
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
