import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { StoreContext } from '../context/StoreContext';

// Hàm tiện ích để lấy số tuần trong năm (giữ nguyên)
const getWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

export const useRevenueData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { url } = useContext(StoreContext);

    const fetchProductList = () => {
        return axios.get(`${url}api/sanpham/danhsachsanpham`);
    };

    const fetchInvoices = () => {
        return axios.get(`${url}api/hoadon/danhsachhoadon`);
    };

    useEffect(() => {
        const fetchAndCalculateData = async () => {
            try {
                const [productsResponse, invoicesResponse] = await Promise.all([fetchProductList(), fetchInvoices()]);

                const products = productsResponse.data.data;
                const invoices = invoicesResponse.data.data;

                const completedInvoices = invoices.filter((inv) => inv.status === 'completed');
                const totalCompletedInvoices = completedInvoices.length;

                // Khởi tạo các biến tổng
                let totalRevenue = 0;
                let totalProfit = 0;
                let totalSoldProducts = 0;

                const productInfoMap = new Map(
                    products.map((p) => [
                        p._id,
                        {
                            name: p.name,
                            purchasePrice: p.purchasePrice,
                            sellingPrice: p.sellingPrice,
                            brand: p.brand,
                            category: p.category,
                        },
                    ]),
                );

                const paymentMethodStats = {};
                const dailyStats = {};
                const weeklyStats = {};
                const monthlyStats = {};
                const yearlyStats = {};
                const productSalesCount = {};
                const brandRevenueStats = {};
                const brandProfitStats = {};
                const categoryRevenueStats = {};
                const categoryProfitStats = {};

                // Lấy ngày, tháng, năm hiện tại (ở Việt Nam)
                const now = new Date();
                const todayKey = now.toLocaleDateString('vi-VN');
                const thisWeekKey = `Tuần ${getWeek(now)}/${now.getFullYear()}`;
                const thisMonthKey = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
                const thisYearKey = `Năm ${now.getFullYear()}`;

                // Khởi tạo tổng cho ngày, tuần, tháng, năm hiện tại
                const todayStats = { revenue: 0, profit: 0, count: 0 };
                const thisWeekStats = { revenue: 0, profit: 0, count: 0 };
                const thisMonthStats = { revenue: 0, profit: 0, count: 0 };
                const thisYearStats = { revenue: 0, profit: 0, count: 0 };

                completedInvoices.forEach((inv) => {
                    let invoiceProfit = 0;
                    const invDate = new Date(inv.invoiceDate);
                    const dailyKey = invDate.toLocaleDateString('vi-VN');
                    const weeklyKey = `Tuần ${getWeek(invDate)}/${invDate.getFullYear()}`;
                    const monthlyKey = `Tháng ${invDate.getMonth() + 1}/${invDate.getFullYear()}`;
                    const yearlyKey = `Năm ${invDate.getFullYear()}`;

                    // Lặp qua từng sản phẩm trong hóa đơn để tính lợi nhuận
                    inv.items.forEach((item) => {
                        const productInfo = productInfoMap.get(item.productId);
                        if (productInfo) {
                            const itemProfit = (item.unitPrice - productInfo.purchasePrice) * item.quantity;
                            invoiceProfit += itemProfit;
                            totalSoldProducts += item.quantity;

                            // Cập nhật số lượng sản phẩm đã bán
                            productSalesCount[item.productId] =
                                (productSalesCount[item.productId] || 0) + item.quantity;

                            // Cập nhật doanh thu và lợi nhuận theo thương hiệu
                            if (!brandRevenueStats[productInfo.brand]) {
                                brandRevenueStats[productInfo.brand] = 0;
                                brandProfitStats[productInfo.brand] = 0;
                            }
                            brandRevenueStats[productInfo.brand] += item.totalPrice;
                            brandProfitStats[productInfo.brand] += itemProfit;

                            // Cập nhật doanh thu và lợi nhuận theo danh mục
                            if (!categoryRevenueStats[productInfo.category]) {
                                categoryRevenueStats[productInfo.category] = 0;
                                categoryProfitStats[productInfo.category] = 0;
                            }
                            categoryRevenueStats[productInfo.category] += item.totalPrice;
                            categoryProfitStats[productInfo.category] += itemProfit;
                        }
                    });

                    // Cập nhật tổng lợi nhuận toàn bộ
                    totalProfit += invoiceProfit;
                    totalRevenue += inv.totalAmount;

                    // Cập nhật thống kê theo phương thức thanh toán
                    const method = inv.paymentDetails.method;
                    if (!paymentMethodStats[method]) {
                        paymentMethodStats[method] = { revenue: 0, profit: 0, count: 0 };
                    }
                    paymentMethodStats[method].revenue += inv.totalAmount;
                    paymentMethodStats[method].profit += invoiceProfit;
                    paymentMethodStats[method].count += 1;

                    // Cập nhật thống kê theo ngày
                    if (!dailyStats[dailyKey]) {
                        dailyStats[dailyKey] = { revenue: 0, profit: 0, count: 0, date: dailyKey };
                    }
                    dailyStats[dailyKey].revenue += inv.totalAmount;
                    dailyStats[dailyKey].profit += invoiceProfit;
                    dailyStats[dailyKey].count += 1;

                    // Cập nhật thống kê theo tuần
                    if (!weeklyStats[weeklyKey]) {
                        weeklyStats[weeklyKey] = { revenue: 0, profit: 0, count: 0, time: weeklyKey };
                    }
                    weeklyStats[weeklyKey].revenue += inv.totalAmount;
                    weeklyStats[weeklyKey].profit += invoiceProfit;
                    weeklyStats[weeklyKey].count += 1;

                    // Cập nhật thống kê theo tháng
                    if (!monthlyStats[monthlyKey]) {
                        monthlyStats[monthlyKey] = { revenue: 0, profit: 0, count: 0, time: monthlyKey };
                    }
                    monthlyStats[monthlyKey].revenue += inv.totalAmount;
                    monthlyStats[monthlyKey].profit += invoiceProfit;
                    monthlyStats[monthlyKey].count += 1;

                    // Cập nhật thống kê theo năm
                    if (!yearlyStats[yearlyKey]) {
                        yearlyStats[yearlyKey] = { revenue: 0, profit: 0, count: 0, time: yearlyKey };
                    }
                    yearlyStats[yearlyKey].revenue += inv.totalAmount;
                    yearlyStats[yearlyKey].profit += invoiceProfit;
                    yearlyStats[yearlyKey].count += 1;
                });

                const uniqueDates = Object.keys(dailyStats).length;
                const averageDailyProfit = uniqueDates > 0 ? totalProfit / uniqueDates : 0;
                const averageDailyInvoices = uniqueDates > 0 ? totalCompletedInvoices / uniqueDates : 0;

                const totalInventory = products.reduce((sum, product) => sum + product.totalQuantity, 0);

                const potentialProfit = products.reduce((sum, product) => {
                    return sum + (product.sellingPrice - product.purchasePrice) * product.totalQuantity;
                }, 0);

                const bestSellingProducts = Object.entries(productSalesCount)
                    .map(([productId, quantity]) => ({
                        productName: productInfoMap.get(productId)?.name || 'Sản phẩm không xác định',
                        quantity,
                    }))
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 10);

                const totalTopSellingQuantity = bestSellingProducts.reduce((sum, product) => sum + product.quantity, 0);

                const brandRevenueData = Object.entries(brandRevenueStats).map(([brand, revenue]) => ({
                    name: brand,
                    Doanh_thu: revenue,
                    Loi_nhuan: brandProfitStats[brand] || 0,
                }));
                const categoryRevenueData = Object.entries(categoryRevenueStats).map(([category, revenue]) => ({
                    name: category,
                    Doanh_thu: revenue,
                    Loi_nhuan: categoryProfitStats[category] || 0,
                }));
                const dailyRevenueData = Object.values(dailyStats).sort(
                    (a, b) =>
                        new Date(a.date.split('/').reverse().join('-')) -
                        new Date(b.date.split('/').reverse().join('-')),
                );

                const calculatedData = {
                    totalRevenue,
                    totalProfit,
                    totalCompletedInvoices,
                    totalSoldProducts,
                    totalInventory,
                    potentialProfit,
                    averageDailyProfit,
                    averageDailyInvoices,
                    paymentMethodStats,
                    bestSellingProducts,
                    totalTopSellingQuantity,
                    dailyStats,
                    weeklyStats,
                    monthlyStats,
                    yearlyStats,
                    brandRevenueData,
                    categoryRevenueData,
                    dailyRevenueData,
                    todayKey,
                    thisWeekKey,
                    thisMonthKey,
                    thisYearKey,
                };

                setData(calculatedData);
            } catch (err) {
                console.error('Lỗi khi lấy hoặc tính toán dữ liệu:', err);
                setError('Đã xảy ra lỗi khi tải dữ liệu.');
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculateData();
    }, [url]);

    return { data, loading, error };
};
