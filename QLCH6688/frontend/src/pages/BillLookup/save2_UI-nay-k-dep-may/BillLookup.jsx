import React, { useState } from 'react';
import './BillLookup.css';
import { invoicesData } from '../../data/invoicesData'; // Import dữ liệu giả định

const BillLookup = () => {
    const [filterPeriod, setFilterPeriod] = useState('all');

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

    const filteredInvoices = invoicesData.filter((invoice) => {
        const invoiceDate = invoice.invoiceDate.$date;
        switch (filterPeriod) {
            case 'today':
                return isToday(invoiceDate);
            case 'thisWeek':
                return isThisWeek(invoiceDate);
            case 'thisMonth':
                return isThisMonth(invoiceDate);
            case 'all':
            default:
                return true;
        }
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'N/A';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="bill-lookup-container">
            <h2 className="bill-lookup-container__title">Chi Tiết Hóa Đơn</h2>
            <div className="filter-buttons">
                <button
                    onClick={() => setFilterPeriod('all')}
                    className={`filter-buttons__item ${filterPeriod === 'all' ? 'filter-buttons__item--active' : ''}`}
                >
                    Tất cả ({invoicesData.length})
                </button>
                <button
                    onClick={() => setFilterPeriod('today')}
                    className={`filter-buttons__item ${filterPeriod === 'today' ? 'filter-buttons__item--active' : ''}`}
                >
                    Hôm nay ({invoicesData.filter((inv) => isToday(inv.invoiceDate.$date)).length})
                </button>
                <button
                    onClick={() => setFilterPeriod('thisWeek')}
                    className={`filter-buttons__item ${
                        filterPeriod === 'thisWeek' ? 'filter-buttons__item--active' : ''
                    }`}
                >
                    Tuần này ({invoicesData.filter((inv) => isThisWeek(inv.invoiceDate.$date)).length})
                </button>
                <button
                    onClick={() => setFilterPeriod('thisMonth')}
                    className={`filter-buttons__item ${
                        filterPeriod === 'thisMonth' ? 'filter-buttons__item--active' : ''
                    }`}
                >
                    Tháng này ({invoicesData.filter((inv) => isThisMonth(inv.invoiceDate.$date)).length})
                </button>
            </div>

            <div className="invoice-list-container">
                {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                        <div key={invoice.invoiceCode} className="invoice-card">
                            <div className="invoice-card__top">
                                <h1 className="invoice-card__top-title">Mã hóa đơn: {invoice.invoiceCode}</h1>
                                <div className="invoice-card__info">
                                    <div className="invoice-card__info-left">
                                        <p className="invoice-card__total-label">Tổng tiền</p>
                                        <p className="invoice-card__total-amount">
                                            {formatCurrency(invoice.totalAmount)}
                                        </p>
                                    </div>
                                    <div className="invoice-card__info-right">
                                        <i className="fas fa-user-circle"></i>
                                        <p>Thu ngân</p>
                                        <p>{invoice.cashier.name}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="invoice-card__bottom">
                                <div className="invoice-card__row">
                                    <div className="invoice-card__item">
                                        <span className="invoice-card__label">Khách hàng</span>
                                        <span className="invoice-card__value">{invoice.customerName}</span>
                                    </div>
                                    <div className="invoice-card__item">
                                        <span className="invoice-card__label">Ngày & Giờ</span>
                                        <span className="invoice-card__value">
                                            {formatDate(invoice.invoiceDate.$date)} -{' '}
                                            {formatTime(invoice.invoiceDate.$date)}
                                        </span>
                                    </div>
                                </div>
                                <div className="invoice-card__row">
                                    <div className="invoice-card__item">
                                        <span className="invoice-card__label">Trạng thái</span>
                                        <span className="invoice-card__value">
                                            {invoice.status === 'completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                                        </span>
                                    </div>
                                    <div className="invoice-card__item">
                                        <span className="invoice-card__label">Thanh toán</span>
                                        <span className="invoice-card__value">{invoice.paymentDetails.method}</span>
                                    </div>
                                </div>

                                <div className="invoice-card__divider"></div>

                                <div className="invoice-card__row">
                                    <div className="invoice-card__item">
                                        <span className="invoice-card__label">Tiền nhận</span>
                                        <span className="invoice-card__value">
                                            {formatCurrency(invoice.paymentDetails.soTienDaNhan)}
                                        </span>
                                    </div>
                                </div>

                                <h4 className="invoice-card__bottom-title">Chi tiết sản phẩm</h4>
                                <ul className="invoice-card__product-list">
                                    {invoice.items.map((item) => (
                                        <li key={item.productId.$oid}>
                                            {item.productName} ({item.quantity}x)
                                        </li>
                                    ))}
                                </ul>
                                <div className="invoice-card__barcode"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-invoices-message">
                        <p>Không có hóa đơn nào trong khoảng thời gian này.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BillLookup;
