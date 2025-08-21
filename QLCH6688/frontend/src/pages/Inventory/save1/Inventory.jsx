// // Inventory.jsx

// import { useState, useContext, useMemo } from 'react';
// import classNames from 'classnames';
// import { StoreContext } from '../../context/StoreContext';
// import './Inventory.css';

// // Hàm helper: Dùng để kiểm tra trạng thái hạn sử dụng
// const getExpiryStatus = (expirationDate) => {
//     const today = new Date();
//     const expiry = new Date(expirationDate);
//     const diffInDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

//     if (diffInDays <= 0) {
//         return 'expired';
//     } else if (diffInDays <= 30) {
//         return 'near-expired';
//     }
//     return 'normal';
// };

// const Inventory = () => {
//     const { product_list } = useContext(StoreContext);
//     const [search, setSearch] = useState('');
//     const [filter, setFilter] = useState('Tất cả');
//     const [expiryFilter, setExpiryFilter] = useState('Tất cả');
//     const [expandedRows, setExpandedRows] = useState([]); // State để quản lý các hàng mở rộng

//     const { productsWithRemaining, totalStockQuantity, totalStockValue, top10ByQuantity, top10ByValue } =
//         useMemo(() => {
//             const productsWithRemaining = product_list.map((product) => {
//                 const batches =
//                     product.batches?.map((batch) => ({
//                         ...batch,
//                         remaining: batch.remaining,
//                     })) || [];
//                 const productTotalQuantity = batches.reduce((sum, batch) => sum + batch.remaining, 0);
//                 const productTotalValue = batches.reduce(
//                     (sum, batch) => sum + batch.remaining * batch.purchasePrice,
//                     0,
//                 );
//                 return {
//                     ...product,
//                     batches,
//                     totalRemaining: productTotalQuantity,
//                     totalStockValue: productTotalValue,
//                 };
//             });

//             const totalStockQuantity = productsWithRemaining.reduce((sum, p) => sum + p.totalRemaining, 0);
//             const totalStockValue = productsWithRemaining.reduce((sum, p) => sum + p.totalStockValue, 0);

//             const top10ByQuantity = [...productsWithRemaining]
//                 .sort((a, b) => b.totalRemaining - a.totalRemaining)
//                 .slice(0, 10);

//             const top10ByValue = [...productsWithRemaining]
//                 .sort((a, b) => b.totalStockValue - a.totalStockValue)
//                 .slice(0, 10);

//             return {
//                 productsWithRemaining,
//                 totalStockQuantity,
//                 totalStockValue,
//                 top10ByQuantity,
//                 top10ByValue,
//             };
//         }, [product_list]);

//     const categories = ['Tất cả', ...Array.from(new Set(productsWithRemaining.map((p) => p.category)))];

//     const filteredProducts = useMemo(() => {
//         return productsWithRemaining.filter((product) => {
//             const matchesSearchAndCategory =
//                 (filter === 'Tất cả' || product.category === filter) &&
//                 (product.name.toLowerCase().includes(search.toLowerCase()) ||
//                     product.productCode.toLowerCase().includes(search.toLowerCase()));

//             if (!matchesSearchAndCategory) {
//                 return false;
//             }

//             if (expiryFilter === 'Tất cả') {
//                 return true;
//             }

//             const hasMatchingExpiryBatch = product.batches.some((batch) => {
//                 const expiryStatus = getExpiryStatus(batch.expirationDate);
//                 return (
//                     (expiryFilter === 'Hết hạn' && expiryStatus === 'expired') ||
//                     (expiryFilter === 'Sắp hết hạn' && expiryStatus === 'near-expired') ||
//                     (expiryFilter === 'Bình thường' && expiryStatus === 'normal')
//                 );
//             });

//             return hasMatchingExpiryBatch;
//         });
//     }, [productsWithRemaining, search, filter, expiryFilter]);

//     // Hàm để xử lý việc mở/đóng hàng
//     const toggleRow = (productCode) => {
//         setExpandedRows((prevRows) =>
//             prevRows.includes(productCode) ? prevRows.filter((id) => id !== productCode) : [...prevRows, productCode],
//         );
//     };

//     return (
//         <div className="inventory">
//             <div className="inventory__header">Quản lý Tồn kho theo Lô hàng</div>

//             <div className="inventory__dashboard">
//                 <div className="inventory__stat-card">
//                     <div className="inventory__stat-title">Tổng số lượng tồn kho</div>
//                     <div className="inventory__stat-value">{totalStockQuantity.toLocaleString()}</div>
//                 </div>
//                 <div className="inventory__stat-card">
//                     <div className="inventory__stat-title">Tổng giá trị tồn kho</div>
//                     <div className="inventory__stat-value">{totalStockValue.toLocaleString()}₫</div>
//                 </div>
//             </div>

//             <div className="inventory__top-products-container">
//                 <div className="inventory__top-products-card">
//                     <div className="inventory__header">Top 10 sản phẩm tồn kho nhiều nhất</div>
//                     <ul className="inventory__top-products-list">
//                         {top10ByQuantity.map((p, index) => (
//                             <li
//                                 key={p.productCode}
//                                 className={classNames('inventory__top-product-item', {
//                                     'inventory__top-product-item--last': index === top10ByQuantity.length - 1,
//                                 })}
//                             >
//                                 <span className="inventory__top-product-name">{p.name}</span>
//                                 <span className="inventory__top-product-value">
//                                     {p.totalRemaining.toLocaleString()}
//                                 </span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//                 <div className="inventory__top-products-card">
//                     <div className="inventory__header">Top 10 sản phẩm giá trị tồn kho cao nhất</div>
//                     <ul className="inventory__top-products-list">
//                         {top10ByValue.map((p, index) => (
//                             <li
//                                 key={p.productCode}
//                                 className={classNames('inventory__top-product-item', {
//                                     'inventory__top-product-item--last': index === top10ByValue.length - 1,
//                                 })}
//                             >
//                                 <span className="inventory__top-product-name">{p.name}</span>
//                                 <span className="inventory__top-product-value">
//                                     {p.totalStockValue.toLocaleString()}₫
//                                 </span>
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             </div>

//             <div className="inventory__controls">
//                 <input
//                     type="text"
//                     placeholder="🔍 Tìm kiếm sản phẩm hoặc mã..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="inventory__input"
//                 />
//                 <select value={filter} onChange={(e) => setFilter(e.target.value)} className="inventory__select">
//                     {categories.map((c) => (
//                         <option key={c} value={c}>
//                             {c.charAt(0).toUpperCase() + c.slice(1)}
//                         </option>
//                     ))}
//                 </select>
//                 <select
//                     value={expiryFilter}
//                     onChange={(e) => setExpiryFilter(e.target.value)}
//                     className="inventory__select"
//                 >
//                     <option value="Tất cả">Trạng thái HSD</option>
//                     <option value="Hết hạn">🔴 Hết hạn</option>
//                     <option value="Sắp hết hạn">🟠 Sắp hết hạn ({`<= 30 ngày`})</option>
//                     <option value="Bình thường">🟢 Bình thường</option>
//                 </select>
//             </div>

//             <div className="inventory__table-wrap">
//                 <table className="inventory__table">
//                     <thead>
//                         <tr>
//                             <th className="inventory__table-header-cell" style={{ width: '20%' }}>
//                                 Sản phẩm
//                             </th>
//                             <th className="inventory__table-header-cell">Loại</th>
//                             <th className="inventory__table-header-cell">Tổng tồn kho</th>
//                             <th className="inventory__table-header-cell">Tổng giá trị tồn kho</th>
//                             <th className="inventory__table-header-cell">Mã lô hàng</th>
//                             <th className="inventory__table-header-cell">Ngày nhập</th>
//                             <th className="inventory__table-header-cell">Hạn sử dụng</th>
//                             <th className="inventory__table-header-cell">Nhập kho</th>
//                             <th className="inventory__table-header-cell">Đơn giá nhập</th>
//                             <th className="inventory__table-header-cell">Tồn kho lô</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredProducts.length === 0 && (
//                             <tr>
//                                 <td colSpan={10} className="inventory__no-data">
//                                     Không có dữ liệu phù hợp.
//                                 </td>
//                             </tr>
//                         )}
//                         {filteredProducts.map((product) => (
//                             <>
//                                 {/* Dòng sản phẩm chính */}
//                                 <tr
//                                     key={product.productCode}
//                                     className={classNames('inventory__table-row', {
//                                         'inventory__table-row--parent': true,
//                                     })}
//                                     onClick={() => toggleRow(product.productCode)}
//                                 >
//                                     <td className="inventory__table-cell inventory__table-cell--expandable" colSpan={4}>
//                                         <span
//                                             className={classNames('inventory__expand-icon', {
//                                                 'inventory__expand-icon--expanded': expandedRows.includes(
//                                                     product.productCode,
//                                                 ),
//                                             })}
//                                         ></span>
//                                         <strong>
//                                             {product.name} ({product.productCode})
//                                         </strong>
//                                     </td>
//                                     {/* Các cột khác của sản phẩm chính */}
//                                     <td className="inventory__table-cell inventory__text-center">{product.category}</td>
//                                     <td className="inventory__table-cell inventory__text-center">
//                                         {product.totalRemaining}
//                                     </td>
//                                     <td className="inventory__table-cell inventory__text-right">
//                                         {product.totalStockValue.toLocaleString()}₫
//                                     </td>
//                                     <td className="inventory__table-cell" colSpan={4}></td>
//                                 </tr>
//                                 {/* Dòng con hiển thị các lô hàng */}
//                                 {expandedRows.includes(product.productCode) &&
//                                     product.batches.map((batch) => {
//                                         const expiryStatus = getExpiryStatus(batch.expirationDate);
//                                         const batchRowClasses = classNames('inventory__table-row', {
//                                             'inventory__table-row--expired': expiryStatus === 'expired',
//                                             'inventory__table-row--near-expired': expiryStatus === 'near-expired',
//                                         });
//                                         const expiryTextClasses = classNames('inventory__table-cell', {
//                                             'inventory__text--expired': expiryStatus === 'expired',
//                                             'inventory__text--near-expired': expiryStatus === 'near-expired',
//                                         });

//                                         return (
//                                             <tr
//                                                 key={`${product.productCode}-${batch.batchNumber}`}
//                                                 className={batchRowClasses}
//                                             >
//                                                 <td
//                                                     className="inventory__table-cell inventory__table-cell--indent"
//                                                     colSpan={4}
//                                                 ></td>
//                                                 <td className="inventory__table-cell">{batch.batchNumber}</td>
//                                                 <td className="inventory__table-cell">{batch.entryDate}</td>
//                                                 <td className={expiryTextClasses}>{batch.expirationDate}</td>
//                                                 <td className="inventory__table-cell">{batch.quantity}</td>
//                                                 <td className="inventory__table-cell">
//                                                     {batch.purchasePrice.toLocaleString()}₫
//                                                 </td>
//                                                 <td className="inventory__table-cell">{batch.remaining}</td>
//                                             </tr>
//                                         );
//                                     })}
//                             </>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default Inventory;

// Inventory.jsx

import { useState, useContext, useMemo } from 'react';
import classNames from 'classnames'; // Import classnames
import { StoreContext } from '../../context/StoreContext';
import './Inventory.css';

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
        <div className="inventory">
            <div className="inventory__header">Quản lý Tồn kho theo Lô hàng</div>

            <div className="inventory__dashboard">
                <div className="inventory__stat-card">
                    <div className="inventory__stat-title">Tổng số lượng tồn kho</div>
                    <div className="inventory__stat-value">{totalStockQuantity.toLocaleString()}</div>
                </div>
                <div className="inventory__stat-card">
                    <div className="inventory__stat-title">Tổng giá trị tồn kho</div>
                    <div className="inventory__stat-value">{totalStockValue.toLocaleString()}₫</div>
                </div>
            </div>

            <div className="inventory__top-products-container">
                <div className="inventory__top-products-card">
                    <div className="inventory__header">Top 10 sản phẩm tồn kho nhiều nhất</div>
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
                    <div className="inventory__header">Top 10 sản phẩm giá trị tồn kho cao nhất</div>
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
                                    {p.totalStockValue.toLocaleString()}₫
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="inventory__controls">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm sản phẩm hoặc mã..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="inventory__input"
                />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="inventory__select">
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                        </option>
                    ))}
                </select>
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

            <div className="inventory__table-wrap">
                <table className="inventory__table">
                    <thead>
                        <tr>
                            <th className="inventory__table-header-cell">Mã lô hàng</th>
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

                            const expiryTextClasses = classNames('inventory__table-cell', {
                                'inventory__text--expired': expiryStatus === 'expired',
                                'inventory__text--near-expired': expiryStatus === 'near-expired',
                            });

                            return (
                                <tr key={rowKey} className={rowClasses}>
                                    <td className="inventory__table-cell">{batch.batchNumber}</td>
                                    <td className="inventory__table-cell">{batch.productCode}</td>
                                    <td className="inventory__table-cell">{batch.productName}</td>
                                    <td className="inventory__table-cell">{batch.productCategory}</td>
                                    <td className="inventory__table-cell">{batch.entryDate}</td>
                                    <td className={expiryTextClasses}>{batch.expirationDate}</td>
                                    <td className="inventory__table-cell">{batch.quantity}</td>
                                    <td className="inventory__table-cell">{batch.purchasePrice.toLocaleString()}₫</td>
                                    <td className="inventory__table-cell">{batch.remaining}</td>
                                    <td className="inventory__table-cell">{stockValue.toLocaleString()}₫</td>
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
