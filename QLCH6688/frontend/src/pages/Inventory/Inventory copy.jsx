import { useState, useContext, useMemo } from 'react';
import { StoreContext } from '../../context/StoreContext';

const styles = {
    container: {
        maxWidth: 1500,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
        padding: 32,
        fontFamily: 'Segoe UI, Arial, sans-serif',
    },
    header: {
        marginBottom: 24,
        fontWeight: 700,
        fontSize: 28,
        color: '#2d3748',
        letterSpacing: 1,
    },
    controls: {
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    input: {
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #cbd5e1',
        fontSize: 16,
        outline: 'none',
        minWidth: 300,
        transition: 'border 0.2s',
    },
    select: {
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #cbd5e1',
        fontSize: 16,
        outline: 'none',
        background: '#f8fafc',
        transition: 'border 0.2s',
    },
    tableWrap: {
        overflowX: 'auto',
        borderRadius: 10,
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        background: '#f9fafb',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 15,
        background: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
    },
    th: {
        background: '#f1f5f9',
        color: '#374151',
        fontWeight: 600,
        padding: '12px 8px',
        borderBottom: '1px solid #e5e7eb',
        textAlign: 'center',
        whiteSpace: 'nowrap',
    },
    td: {
        padding: '10px 8px',
        borderBottom: '1px solid #f3f4f6',
        textAlign: 'center',
        background: '#fff',
        transition: 'background 0.2s',
        maxWidth: 500,
    },
    trHover: {
        background: '#f3f4f6',
    },
    noData: {
        textAlign: 'center',
        color: '#64748b',
        padding: 24,
        fontSize: 16,
    },
    dashboard: {
        display: 'flex',
        gap: 24,
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    statCard: {
        flex: 1,
        minWidth: 200,
        padding: 20,
        background: '#f1f5f9',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    statTitle: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 700,
        color: '#2d3748',
    },
    topProductsContainer: {
        display: 'flex',
        gap: 24,
        marginBottom: 32,
        flexWrap: 'wrap',
    },
    topProductsCard: {
        flex: 1,
        minWidth: 400,
        padding: 20,
        background: '#f1f5f9',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    topProductsList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
    },
    topProductItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #e2e8f0',
        alignItems: 'center',
    },
    topProductItemLast: {
        borderBottom: 'none',
    },
    productName: {
        fontWeight: 600,
    },
    productValue: {
        color: '#2d3748',
        fontWeight: 500,
    },
    expiredRow: {
        background: '#fef2f2',
    },
    nearExpiredRow: {
        background: '#fffbeb',
    },
    expiredText: {
        color: '#ef4444',
        fontWeight: 600,
    },
    nearExpiredText: {
        color: '#f59e0b',
        fontWeight: 600,
    },
};

// Hàm helper: Dùng để kiểm tra trạng thái hạn sử dụng
const getExpiryStatus = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffInDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) {
        return 'expired';
    } else if (diffInDays <= 30) {
        return 'near-expired';
    }
    return 'normal';
};

const Inventory = () => {
    const { product_list } = useContext(StoreContext);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Tất cả');
    const [expiryFilter, setExpiryFilter] = useState('Tất cả');
    const [hoverRow, setHoverRow] = useState(null);

    const { productsWithRemaining, totalStockQuantity, totalStockValue, top10ByQuantity, top10ByValue } =
        useMemo(() => {
            const productsWithRemaining = product_list.map((product) => {
                const batches =
                    product.batches?.map((batch) => ({
                        ...batch,
                        remaining: batch.remaining,
                    })) || [];
                const productTotalQuantity = batches.reduce((sum, batch) => sum + batch.remaining, 0);
                const productTotalValue = batches.reduce(
                    (sum, batch) => sum + batch.remaining * batch.purchasePrice,
                    0,
                );
                return {
                    ...product,
                    batches,
                    totalRemaining: productTotalQuantity,
                    totalStockValue: productTotalValue,
                };
            });

            const totalStockQuantity = productsWithRemaining.reduce((sum, p) => sum + p.totalRemaining, 0);
            const totalStockValue = productsWithRemaining.reduce((sum, p) => sum + p.totalStockValue, 0);

            const top10ByQuantity = [...productsWithRemaining]
                .sort((a, b) => b.totalRemaining - a.totalRemaining)
                .slice(0, 10);

            const top10ByValue = [...productsWithRemaining]
                .sort((a, b) => b.totalStockValue - a.totalStockValue)
                .slice(0, 10);

            return {
                productsWithRemaining,
                totalStockQuantity,
                totalStockValue,
                top10ByQuantity,
                top10ByValue,
            };
        }, [product_list]);

    const categories = ['Tất cả', ...Array.from(new Set(productsWithRemaining.map((p) => p.category)))];

    const filteredBatches = useMemo(() => {
        return productsWithRemaining
            .flatMap((product) => {
                return product.batches.map((batch) => ({
                    ...batch,
                    productName: product.name,
                    productCategory: product.category,
                    productCode: product.productCode,
                }));
            })
            .filter((batch) => {
                const matchesSearchAndCategory =
                    (filter === 'Tất cả' || batch.productCategory === filter) &&
                    (batch.productName.toLowerCase().includes(search.toLowerCase()) ||
                        batch.productCode.toLowerCase().includes(search.toLowerCase()));

                if (!matchesSearchAndCategory) {
                    return false;
                }

                if (expiryFilter === 'Tất cả') {
                    return true;
                }

                const expiryStatus = getExpiryStatus(batch.expirationDate);
                if (expiryFilter === 'Hết hạn') {
                    return expiryStatus === 'expired';
                }
                if (expiryFilter === 'Sắp hết hạn') {
                    return expiryStatus === 'near-expired';
                }
                if (expiryFilter === 'Bình thường') {
                    return expiryStatus === 'normal';
                }

                return true;
            });
    }, [productsWithRemaining, search, filter, expiryFilter]);

    return (
        <div style={styles.container}>
            <div style={styles.header}>Quản lý Tồn kho theo Lô hàng</div>

            <div style={styles.dashboard}>
                <div style={styles.statCard}>
                    <div style={styles.statTitle}>Tổng số lượng tồn kho</div>
                    <div style={styles.statValue}>{totalStockQuantity.toLocaleString()}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statTitle}>Tổng giá trị tồn kho</div>
                    <div style={styles.statValue}>{totalStockValue.toLocaleString()}₫</div>
                </div>
            </div>

            <div style={styles.topProductsContainer}>
                <div style={styles.topProductsCard}>
                    <div style={styles.header}>Top 10 sản phẩm tồn kho nhiều nhất</div>
                    <ul style={styles.topProductsList}>
                        {top10ByQuantity.map((p, index) => (
                            <li
                                key={p.productCode}
                                style={{
                                    ...styles.topProductItem,
                                    ...(index === top10ByQuantity.length - 1 && styles.topProductItemLast),
                                }}
                            >
                                <span style={styles.productName}>{p.name}</span>
                                <span style={styles.productValue}>{p.totalRemaining.toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={styles.topProductsCard}>
                    <div style={styles.header}>Top 10 sản phẩm giá trị tồn kho cao nhất</div>
                    <ul style={styles.topProductsList}>
                        {top10ByValue.map((p, index) => (
                            <li
                                key={p.productCode}
                                style={{
                                    ...styles.topProductItem,
                                    ...(index === top10ByValue.length - 1 && styles.topProductItemLast),
                                }}
                            >
                                <span style={styles.productName}>{p.name}</span>
                                <span style={styles.productValue}>{p.totalStockValue.toLocaleString()}₫</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div style={styles.controls}>
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm sản phẩm hoặc mã..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.input}
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                    ))}
                </select>
                <select value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)} style={styles.select}>
                    <option value="Tất cả">Trạng thái HSD</option>
                    <option value="Hết hạn">🔴 Hết hạn</option>
                    <option value="Sắp hết hạn">🟠 Sắp hết hạn ({`<= 30 ngày`})</option>
                    <option value="Bình thường">🟢 Bình thường</option>
                </select>
            </div>
            <div style={styles.tableWrap}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Mã lô hàng</th>
                            <th style={styles.th}>Mã sản phẩm</th>
                            <th style={styles.th}>Tên sản phẩm</th>
                            <th style={styles.th}>Loại</th>
                            <th style={styles.th}>Ngày nhập</th>
                            <th style={styles.th}>Hạn sử dụng</th>
                            <th style={styles.th}>Nhập kho</th>
                            <th style={styles.th}>Đơn giá nhập</th>
                            <th style={styles.th}>Tồn kho</th>
                            <th style={styles.th}>Giá trị tồn kho</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBatches.length === 0 && (
                            <tr>
                                <td colSpan={10} style={styles.noData}>
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        )}
                        {filteredBatches.map((batch) => {
                            const stockValue = batch.purchasePrice * batch.remaining;
                            const rowKey = `${batch.productCode}-${batch.batchNumber}`;
                            const expiryStatus = getExpiryStatus(batch.expirationDate);
                            const rowStyle = {
                                ...(expiryStatus === 'expired' && styles.expiredRow),
                                ...(expiryStatus === 'near-expired' && styles.nearExpiredRow),
                            };
                            const expiryTextStyle = {
                                ...styles.td,
                                ...(expiryStatus === 'expired' && styles.expiredText),
                                ...(expiryStatus === 'near-expired' && styles.nearExpiredText),
                            };

                            return (
                                <tr
                                    key={rowKey}
                                    style={hoverRow === rowKey ? { ...rowStyle, ...styles.trHover } : rowStyle}
                                    onMouseEnter={() => setHoverRow(rowKey)}
                                    onMouseLeave={() => setHoverRow(null)}
                                >
                                    <td style={styles.td}>{batch.batchNumber}</td>
                                    <td style={styles.td}>{batch.productCode}</td>
                                    <td style={styles.td}>{batch.productName}</td>
                                    <td style={styles.td}>{batch.productCategory}</td>
                                    <td style={styles.td}>{batch.entryDate}</td>
                                    <td style={expiryTextStyle}>{batch.expirationDate}</td>
                                    <td style={styles.td}>{batch.quantity}</td>
                                    <td style={styles.td}>{batch.purchasePrice.toLocaleString()}₫</td>
                                    <td style={styles.td}>{batch.remaining}</td>
                                    <td style={styles.td}>{stockValue.toLocaleString()}₫</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
