import { useState, useContext, useMemo, useEffect } from 'react';
import classNames from 'classnames';
import { StoreContext } from '../../context/StoreContext';
import './Inventory.css';
import helpers from '../../utils/helpers';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';
import {
    MdSearch,
    MdFilterList,
    MdAssignment,
    MdKeyboardDoubleArrowRight,
    MdKeyboardDoubleArrowUp,
} from 'react-icons/md';

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
    const { product_list, utilityFunctions } = useContext(StoreContext);
    const { convertCategory } = utilityFunctions;
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Tất cả');
    const [expiryFilter, setExpiryFilter] = useState('Tất cả');
    const [productStatusFilter, setProductStatusFilter] = useState('Tất cả');
    const [isLoading, setIsLoading] = useState(true);

    const { formatDate } = helpers;

    useEffect(() => {
        if (product_list.length > 0) {
            setIsLoading(false);
        }
    }, [product_list]);

    // Các biến và giá trị tính toán phụ thuộc vào dữ liệu, được bọc trong useMemo
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

    const productBatchCounts = useMemo(() => {
        const counts = new Map();
        productsWithRemaining.forEach((product) => {
            counts.set(product.productCode, product.batches?.length || 0);
        });
        return counts;
    }, [productsWithRemaining]);

    const filteredBatches = useMemo(() => {
        return productsWithRemaining
            .flatMap((product) => {
                const totalBatches = productBatchCounts.get(product.productCode);
                return product.batches.map((batch, index) => ({
                    ...batch,
                    productName: product.name,
                    productCategory: product.category,
                    productCode: product.productCode,
                    productStatus: product.productStatus,
                    batchIndex: index + 1,
                    totalBatches: totalBatches,
                }));
            })
            .filter((batch) => {
                const categoryFilterValue = filter === 'Tất cả' ? 'Tất cả' : convertCategory(filter);
                const batchCategoryValue = convertCategory(batch.productCategory);

                const matchesSearchAndCategory =
                    (filter === 'Tất cả' || batch.productCategory === filter) &&
                    (batch.productName.toLowerCase().includes(search.toLowerCase()) ||
                        batch.productCode.toLowerCase().includes(search.toLowerCase()));

                if (!matchesSearchAndCategory) {
                    return false;
                }

                if (productStatusFilter !== 'Tất cả' && batch.productStatus !== productStatusFilter) {
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
    }, [productsWithRemaining, search, filter, expiryFilter, productBatchCounts, productStatusFilter]);

    const tableSummary = useMemo(() => {
        const totalRemainingInTable = filteredBatches.reduce((sum, batch) => sum + batch.remaining, 0);
        const totalValueInTable = filteredBatches.reduce(
            (sum, batch) => sum + batch.remaining * batch.purchasePrice,
            0,
        );

        const uniqueProductCodes = new Set(filteredBatches.map((batch) => batch.productCode));
        const uniqueCategories = new Set(filteredBatches.map((batch) => batch.productCategory));

        return {
            totalProducts: uniqueProductCodes.size,
            totalCategories: uniqueCategories.size,
            totalRemaining: totalRemainingInTable,
            totalValue: totalValueInTable,
        };
    }, [filteredBatches]);
    // 👆 Kết thúc phần khai báo Hooks và logic tính toán 👆

    // 👇 Bắt đầu phần render có điều kiện 👇
    if (isLoading) {
        return <StatusDisplaySpinner isLoading={isLoading} loadingText="Đang tải dữ liệu tồn kho..." />;
    }

    return (
        <div className="inventory">
            <div className="inventory__header-container">
                <div className="inventory__header">QUẢN LÝ TỒN KHO</div>
            </div>

            <div className="inventory__dashboard">
                <div className="inventory__stat-card">
                    <div className="inventory__stat-title">Tổng số lượng tồn kho</div>
                    <div className="inventory__stat-value">{totalStockQuantity.toLocaleString()}</div>
                </div>
                <div className="inventory__stat-card">
                    <div className="inventory__stat-title">Tổng giá trị tồn kho</div>
                    <div className="inventory__stat-value">{totalStockValue.toLocaleString()} ₫</div>
                </div>
            </div>

            <div className="inventory__top-products-container">
                <div className="inventory__top-products-card">
                    <div className="inventory__card-header">
                        <MdKeyboardDoubleArrowRight className="inventory__card-icon" />
                        Top 10 sản phẩm tồn kho nhiều nhất
                    </div>
                    <ul className="inventory__top-products-list">
                        {top10ByQuantity.map((p, index) => (
                            <li
                                key={p.productCode}
                                className={classNames('inventory__top-product-item', {
                                    'inventory__top-product-item--last': index === top10ByQuantity.length - 1,
                                })}
                            >
                                <span className="inventory__top-product-name">{p.name}</span>
                                <span className="inventory__top-product-value">
                                    {p.totalRemaining.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="inventory__top-products-card">
                    <div className="inventory__card-header">
                        <MdKeyboardDoubleArrowUp className="inventory__card-icon" />
                        Top 10 sản phẩm giá trị tồn kho cao nhất
                    </div>
                    <ul className="inventory__top-products-list">
                        {top10ByValue.map((p, index) => (
                            <li
                                key={p.productCode}
                                className={classNames('inventory__top-product-item', {
                                    'inventory__top-product-item--last': index === top10ByValue.length - 1,
                                })}
                            >
                                <span className="inventory__top-product-name">{p.name}</span>
                                <span className="inventory__top-product-value">
                                    {p.totalStockValue.toLocaleString()} ₫
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="inventory__controls">
                <div className="inventory__input-wrapper mw-300">
                    <MdSearch className="inventory__icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm hoặc mã..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="inventory__input"
                    />
                </div>

                <div className="inventory__select-wrapper">
                    <MdFilterList className="inventory__icon" />
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="inventory__select">
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {convertCategory(c.charAt(0).toUpperCase() + c.slice(1))}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="inventory__select-wrapper mw-230">
                    <MdFilterList className="inventory__icon" />
                    <select
                        value={productStatusFilter}
                        onChange={(e) => setProductStatusFilter(e.target.value)}
                        className="inventory__select"
                    >
                        <option value="Tất cả">Trạng thái sản phẩm</option>
                        <option value="active">🟢 Đang hoạt động</option>
                        <option value="inactive">⚫ Ngừng hoạt động</option>
                        <option value="hidden">⚪ Bị ẩn</option>
                    </select>
                </div>

                <div className="inventory__select-wrapper">
                    <MdAssignment className="inventory__icon" />
                    <select
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                        className="inventory__select"
                    >
                        <option value="Tất cả">Trạng thái HSD</option>
                        <option value="Hết hạn">🔴 Hết hạn</option>
                        <option value="Sắp hết hạn">🟠 Sắp hết hạn ({`<= 30 ngày`})</option>
                        <option value="Bình thường">🟢 Bình thường</option>
                    </select>
                </div>
            </div>

            <div className="inventory__table-wrap">
                <table className="inventory__table">
                    <thead>
                        <tr>
                            <th className="inventory__table-header-cell">Mã sản phẩm</th>
                            <th className="inventory__table-header-cell">Tên sản phẩm</th>
                            <th className="inventory__table-header-cell">Loại</th>
                            <th className="inventory__table-header-cell">Ngày nhập</th>
                            <th className="inventory__table-header-cell">Hạn sử dụng</th>
                            <th className="inventory__table-header-cell">Nhập kho</th>
                            <th className="inventory__table-header-cell">Đơn giá nhập</th>
                            <th className="inventory__table-header-cell">Tồn kho</th>
                            <th className="inventory__table-header-cell">Giá trị tồn kho</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBatches.length === 0 && (
                            <tr>
                                <td colSpan={10} className="inventory__no-data">
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        )}
                        {filteredBatches.map((batch) => {
                            const stockValue = batch.purchasePrice * batch.remaining;
                            const rowKey = `${batch.productCode}-${batch.batchNumber}`;
                            const expiryStatus = getExpiryStatus(batch.expirationDate);

                            const rowClasses = classNames('inventory__table-row', {
                                'inventory__table-row--expired': expiryStatus === 'expired',
                                'inventory__table-row--near-expired': expiryStatus === 'near-expired',
                            });

                            const expiryTextClasses = classNames(
                                'inventory__table-cell',
                                'inventory__table-cell--expiry',
                                {
                                    'inventory__text--expired': expiryStatus === 'expired',
                                    'inventory__text--near-expired': expiryStatus === 'near-expired',
                                },
                            );

                            return (
                                <tr key={rowKey} className={rowClasses}>
                                    <td className="inventory__table-cell">{batch.productCode}</td>
                                    <td className="inventory__table-cell">
                                        {batch.productName}
                                        {batch.totalBatches > 1 && ` (${batch.batchIndex}/${batch.totalBatches})`}
                                    </td>
                                    <td className="inventory__table-cell">{convertCategory(batch.productCategory)}</td>
                                    <td className="inventory__table-cell">{formatDate(batch.entryDate)}</td>
                                    <td className={expiryTextClasses}>{formatDate(batch.expirationDate)}</td>
                                    <td className="inventory__table-cell">{batch.quantity}</td>
                                    <td className="inventory__table-cell">{batch.purchasePrice.toLocaleString()} ₫</td>
                                    <td className="inventory__table-cell">{batch.remaining}</td>
                                    <td className="inventory__table-cell">{stockValue.toLocaleString()} ₫</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    {filteredBatches.length > 0 && (
                        <tfoot className="inventory__table-footer">
                            <tr>
                                <td colSpan="10">
                                    <div className="inventory__summary">
                                        <div className="inventory__summary-item">
                                            <span>Tổng số sản phẩm</span>
                                            <strong>{tableSummary.totalProducts}</strong>
                                        </div>
                                        <div className="inventory__summary-item">
                                            <span>Tổng số loại</span>
                                            <strong>{tableSummary.totalCategories}</strong>
                                        </div>
                                        <div className="inventory__summary-item">
                                            <span>Tổng số lượng tồn kho</span>
                                            <strong>{tableSummary.totalRemaining.toLocaleString()}</strong>
                                        </div>
                                        <div className="inventory__summary-item">
                                            <span>Tổng giá trị tồn kho</span>
                                            <strong>{tableSummary.totalValue.toLocaleString()} ₫</strong>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};

export default Inventory;
