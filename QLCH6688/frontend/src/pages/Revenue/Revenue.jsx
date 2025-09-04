import {
    FaDollarSign,
    FaChartLine,
    FaCalendarAlt,
    FaCreditCard,
    FaTags,
    FaClipboardList,
    FaCalculator,
    FaBoxes,
} from 'react-icons/fa';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';

import './Revenue.css';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';
import { useRevenueData } from '../../hooks/useRevenueData';

const Revenue = () => {
    const { data, loading, error } = useRevenueData();

    if (loading || error) {
        return (
            <StatusDisplaySpinner
                isLoading={loading}
                error={error}
                loadingText="Đang tải dữ liệu thống kê doanh thu..."
            />
        );
    }

    if (!data) return null;
    const { dailyStats, weeklyStats, monthlyStats, yearlyStats, todayKey, thisWeekKey, thisMonthKey, thisYearKey } =
        data;

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' ₫';
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <div className="revenue">
            <h1 className="revenue__title">DOANH THU & LỢI NHUẬN</h1>

            <div className="revenue__summary">
                <div className="revenue__card revenue__card--revenue">
                    <div className="revenue__card-icon-wrapper">
                        <FaDollarSign className="revenue__card-icon" />
                    </div>
                    <div className="revenue__card-content">
                        <h2 className="revenue__card-title">Tổng Doanh thu</h2>
                        <p className="revenue__card-value">{formatCurrency(data.totalRevenue)}</p>
                        <p className="revenue__card-info">(từ {data.totalCompletedInvoices} hóa đơn)</p>
                    </div>
                </div>
                <div className="revenue__card revenue__card--profit">
                    <div className="revenue__card-icon-wrapper">
                        <FaChartLine className="revenue__card-icon" />
                    </div>
                    <div className="revenue__card-content">
                        <h2 className="revenue__card-title">Tổng Lợi nhuận</h2>
                        <p className="revenue__card-value">{formatCurrency(data.totalProfit)}</p>
                        <p className="revenue__card-info">(từ {data.totalCompletedInvoices} hóa đơn)</p>
                    </div>
                </div>
            </div>

            <hr className="revenue__divider" />

            <div className="revenue__stats">
                <div className="revenue__section">
                    <h2 className="revenue__section-title">
                        <FaBoxes className="revenue__section-icon" /> Thống kê Sản phẩm
                    </h2>
                    <ul className="revenue__list">
                        <li className="revenue__list-item">
                            <div className="revenue__list-content">
                                <span className="revenue__list-label">Tổng sản phẩm đã bán:</span>
                                <span className="revenue__list-value highlight-quantity">
                                    {data.totalSoldProducts} sản phẩm
                                </span>
                            </div>
                        </li>
                        <li className="revenue__list-item">
                            <div className="revenue__list-content">
                                <span className="revenue__list-label">Lợi nhuận tiềm năng từ tồn kho:</span>
                                <span className="revenue__list-value highlight-potential">
                                    {formatCurrency(data.potentialProfit)}
                                </span>
                            </div>
                            <div className="revenue__list-meta">(từ {data.totalInventory} sản phẩm)</div>
                        </li>
                    </ul>
                </div>
                <div className="revenue__section">
                    <h2 className="revenue__section-title">
                        <FaCalculator className="revenue__section-icon" /> Chỉ số trung bình
                    </h2>
                    <ul className="revenue__list">
                        <li className="revenue__list-item">
                            <div className="revenue__list-content">
                                <span className="revenue__list-label">Lợi nhuận trung bình/ngày:</span>
                                <span className="revenue__list-value highlight-profit">
                                    {formatCurrency(Math.round(data.averageDailyProfit))}
                                </span>
                            </div>
                        </li>
                        <li className="revenue__list-item">
                            <div className="revenue__list-content">
                                <span className="revenue__list-label">Hóa đơn trung bình/ngày:</span>
                                <span className="revenue__list-value highlight-invoice">
                                    <p>{data.averageDailyInvoices.toFixed(2)} hóa đơn</p>
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="time-stats">
                <h2 className="time-stats__title">
                    <FaCalendarAlt className="time-stats__title-icon" /> Thống Kê Theo Thời Gian
                </h2>
                <div className="time-stats__grid">
                    <div className="time-stats__card">
                        <h3 className="time-stats__card-period">Ngày</h3>
                        <p className="time-stats__card-revenue">
                            Doanh thu: {data.dailyStats[todayKey]?.revenue.toLocaleString('vi-VN') || 0} ₫
                        </p>
                        <p className="time-stats__card-profit">
                            Lợi nhuận: {data.dailyStats[todayKey]?.profit.toLocaleString('vi-VN') || 0} ₫
                        </p>
                    </div>
                    <div className="time-stats__card">
                        <h3 className="time-stats__card-period">Tuần</h3>
                        <p className="time-stats__card-revenue">
                            Doanh thu: {data.weeklyStats[thisWeekKey]?.revenue.toLocaleString('vi-VN') || 0} ₫
                        </p>
                        <p className="time-stats__card-profit">
                            Lợi nhuận: {data.weeklyStats[thisWeekKey]?.profit.toLocaleString('vi-VN') || 0} ₫
                        </p>
                    </div>
                    <div className="time-stats__card">
                        <h3 className="time-stats__card-period">Tháng</h3>
                        <p className="time-stats__card-revenue">
                            Doanh thu: {data.monthlyStats[thisMonthKey]?.revenue.toLocaleString('vi-VN') || 0} ₫
                        </p>
                        <p className="time-stats__card-profit">
                            Lợi nhuận: {data.monthlyStats[thisMonthKey]?.profit.toLocaleString('vi-VN') || 0} ₫
                        </p>
                    </div>
                    <div className="time-stats__card">
                        <h3 className="time-stats__card-period">Năm</h3>
                        <p className="time-stats__card-revenue">
                            Doanh thu: {data.yearlyStats[thisYearKey]?.revenue.toLocaleString('vi-VN') || 0} ₫
                        </p>
                        <p className="time-stats__card-profit">
                            Lợi nhuận: {data.yearlyStats[thisYearKey]?.profit.toLocaleString('vi-VN') || 0} ₫
                        </p>
                    </div>
                </div>
            </div>

            <hr className="revenue__divider" />

            <div className="revenue__charts-container">
                <div className="revenue__chart-item revenue__chart-item--full-width">
                    <h2 className="revenue__section-title">
                        <FaChartLine /> Doanh thu theo thời gian
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.dailyRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />

                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                            <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Lợi nhuận" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="revenue__charts-group">
                    <div className="revenue__chart-item">
                        <h2 className="revenue__section-title">
                            <FaTags /> Doanh thu theo thương hiệu
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.brandRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tickFormatter={capitalizeFirstLetter} />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="Doanh_thu" fill="#8884d8" name="Doanh thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="revenue__chart-item">
                        <h2 className="revenue__section-title">
                            <FaClipboardList /> Doanh thu theo danh mục
                        </h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.categoryRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="Doanh_thu" fill="#ffc658" name="Doanh thu" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <hr className="revenue__divider" />

            <div className="revenue__stats">
                <div className="revenue__section">
                    <h2 className="revenue__section-title">
                        <FaCreditCard className="revenue__section-icon" /> Doanh thu theo phương thức
                    </h2>
                    <ul className="revenue__list">
                        {Object.entries(data.paymentMethodStats || {}).map(([method, stats]) => (
                            <li className="revenue__list-item" key={method}>
                                <div className="revenue__list-content">
                                    <span className="revenue__list-label">{method}:</span>
                                    <span className="revenue__list-value">
                                        Doanh thu{' '}
                                        <span className="highlight-revenue">{formatCurrency(stats.revenue)}</span>, Lợi
                                        nhuận <span className="highlight-profit">{formatCurrency(stats.profit)}</span>
                                    </span>
                                    <span className="revenue__list-meta">({stats.count} hóa đơn)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="revenue__section">
                    <h2 className="revenue__section-title">
                        <FaCalendarAlt className="revenue__section-icon" /> Thống kê theo ngày
                    </h2>
                    <ul className="revenue__list">
                        {Object.entries(data.dailyStats || {}).map(([date, stats]) => (
                            <li className="revenue__list-item" key={date}>
                                <div className="revenue__list-content">
                                    <span className="revenue__list-label">{date}:</span>
                                    <span className="revenue__list-value">
                                        Doanh thu{' '}
                                        <span className="highlight-revenue">{formatCurrency(stats.revenue)}</span>, Lợi
                                        nhuận <span className="highlight-profit">{formatCurrency(stats.profit)}</span>
                                    </span>
                                    <span className="revenue__list-meta">({stats.count} hóa đơn)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <hr className="revenue__divider" />

            <div className="revenue__section revenue__section--full">
                <h2 className="revenue__section-title">
                    <FaTags className="revenue__section-icon" /> Sản phẩm bán chạy nhất
                </h2>
                <ul className="revenue__list revenue__list--top-products">
                    {data.bestSellingProducts?.map((product, index) => (
                        <li className="revenue__product-item" key={index}>
                            <span className="revenue__product-rank">{index + 1}</span>
                            <div className="revenue__product-details">
                                <span className="revenue__product-name">{product.productName}</span>
                                <span className="revenue__product-quantity">{product.quantity} sản phẩm</span>
                                <div className="revenue__progress-bar">
                                    <div
                                        className="revenue__progress-fill"
                                        style={{ width: `${(product.quantity / data.totalTopSellingQuantity) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Revenue;
