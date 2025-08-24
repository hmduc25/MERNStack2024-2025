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
import { useRevenueData } from '../../hooks/useRevenueData';

const Revenue = () => {
    // Gọi custom hook để lấy dữ liệu và trạng thái
    const { data, loading, error } = useRevenueData();

    if (loading) {
        return <p>Đang tải dữ liệu...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!data) return null;

    const { dailyStats, weeklyStats, monthlyStats, yearlyStats, todayKey, thisWeekKey, thisMonthKey, thisYearKey } =
        data;

    const formatCurrency = (amount) => {
        return amount.toLocaleString('vi-VN') + ' ₫';
    };

    // Custom Tooltip component (giữ nguyên)
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div
                    className="custom-tooltip"
                    style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}
                >
                    <p className="label">{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={`item-${index}`} style={{ color: entry.color || '#000' }}>
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="revenue-dashboard">
            <h2>Bảng Thống Kê Tổng Hợp</h2>
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tổng Doanh Thu</h3>
                    <p>{formatCurrency(data.totalRevenue)}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng Lợi Nhuận</h3>
                    <p>{formatCurrency(data.totalProfit)}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng Hóa Đơn Đã Hoàn Thành</h3>
                    <p>{data.totalCompletedInvoices} hóa đơn</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng Số Sản Phẩm Đã Bán</h3>
                    <p>{data.totalSoldProducts} sản phẩm</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng Hàng Tồn Kho</h3>
                    <p>{data.totalInventory} sản phẩm</p>
                </div>
                <div className="stat-card">
                    <h3>Lợi Nhuận Tiềm Năng Từ Tồn Kho</h3>
                    <p>{formatCurrency(data.potentialProfit)}</p>
                </div>
                <div className="stat-card">
                    <h3>Lợi nhuận Trung Bình/Ngày</h3>
                    <p>{formatCurrency(data.averageDailyProfit)}</p>
                </div>
                <div className="stat-card">
                    <h3>Hóa đơn Trung Bình/Ngày</h3>
                    <p>{data.averageDailyInvoices.toFixed(2)} hóa đơn</p>
                </div>
            </div>
            ---
            <h2>Thống Kê Theo Thời Gian</h2>
            // Đoạn code đã được sửa trong Revenue.jsx
            <div className="time-stats-grid">
                <div className="stat-card">
                    <h3>Ngày</h3>
                    <p>Doanh thu: {data.dailyStats[todayKey]?.revenue.toLocaleString('vi-VN') || 0} ₫</p>
                    <p>Lợi nhuận: {data.dailyStats[todayKey]?.profit.toLocaleString('vi-VN') || 0} ₫</p>
                </div>
                <div className="stat-card">
                    <h3>Tuần</h3>
                    <p>Doanh thu: {data.weeklyStats[thisWeekKey]?.revenue.toLocaleString('vi-VN') || 0} ₫</p>
                    <p>Lợi nhuận: {data.weeklyStats[thisWeekKey]?.profit.toLocaleString('vi-VN') || 0} ₫</p>
                </div>
                <div className="stat-card">
                    <h3>Tháng</h3>
                    <p>Doanh thu: {data.monthlyStats[thisMonthKey]?.revenue.toLocaleString('vi-VN') || 0} ₫</p>
                    <p>Lợi nhuận: {data.monthlyStats[thisMonthKey]?.profit.toLocaleString('vi-VN') || 0} ₫</p>
                </div>
                <div className="stat-card">
                    <h3>Năm</h3>
                    <p>Doanh thu: {data.yearlyStats[thisYearKey]?.revenue.toLocaleString('vi-VN') || 0} ₫</p>
                    <p>Lợi nhuận: {data.yearlyStats[thisYearKey]?.profit.toLocaleString('vi-VN') || 0} ₫</p>
                </div>
            </div>
            ---
            <h2>Sản phẩm bán chạy nhất</h2>
            <div className="best-sellers-list">
                <ol>
                    {data.bestSellingProducts.map((item, index) => (
                        <li key={index}>
                            {item.productName} - {item.quantity} sản phẩm
                        </li>
                    ))}
                </ol>
            </div>
            ---
            <h2>Biểu Đồ Doanh Thu</h2>
            <div className="charts-container">
                <h3>Doanh thu theo thời gian</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.dailyRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" />
                        <Line type="monotone" dataKey="profit" stroke="#82ca9d" name="Lợi nhuận" />
                    </LineChart>
                </ResponsiveContainer>

                <h3>Doanh thu theo thương hiệu</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.brandRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="Doanh_thu"
                            fill="#82ca9d"
                            name="Doanh thu"
                            label={{ position: 'top', formatter: formatCurrency }}
                        />
                    </BarChart>
                </ResponsiveContainer>

                <h3>Doanh thu theo danh mục</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.categoryRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar
                            dataKey="Doanh_thu"
                            fill="#ffc658"
                            name="Doanh thu"
                            label={{ position: 'top', formatter: formatCurrency }}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            ---
            <h2>Doanh thu & Lợi nhuận theo Phương thức Thanh toán</h2>
            <div className="payment-stats">
                {Object.entries(data.paymentMethodStats).map(([method, stats]) => (
                    <div className="payment-card" key={method}>
                        <h3>{method}</h3>
                        <p>Doanh thu: {formatCurrency(stats.revenue)}</p>
                        <p>Lợi nhuận: {formatCurrency(stats.profit)}</p>
                        <p>Số hóa đơn: {stats.count} hóa đơn</p>
                    </div>
                ))}
            </div>
            ---
            <h2>Thống Kê Theo Ngày</h2>
            <div className="daily-stats">
                {Object.entries(data.dailyStats).map(([date, stats]) => (
                    <div className="daily-card" key={date}>
                        <h3>{date}</h3>
                        <p>Doanh thu: {formatCurrency(stats.revenue)}</p>
                        <p>Lợi nhuận: {formatCurrency(stats.profit)}</p>
                        <p>Số hóa đơn: {stats.count} hóa đơn</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Revenue;
