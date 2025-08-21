// components/ProductRow.jsx
import { useState } from 'react';
import classNames from 'classnames';

const getExpiryStatus = (expirationDate) => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffInDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffInDays <= 0) return 'expired';
    if (diffInDays <= 30) return 'near-expired';
    return 'normal';
};

const ProductRow = ({ product }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const mainRowClasses = classNames('inventory__table-row', {
        'inventory__table-row--expanded': isExpanded,
    });

    const expandIconClasses = classNames('inventory__expand-icon', {
        'inventory__expand-icon--expanded': isExpanded,
    });

    return (
        <>
            <tr className={mainRowClasses} onClick={() => setIsExpanded(!isExpanded)}>
                {/* 1. Cột Tên sản phẩm, Mã sản phẩm */}
                <td className="inventory__table-cell inventory__table-cell--expandable">
                    <span className={expandIconClasses}></span>
                    {product.name} ({product.productCode})
                </td>
                {/* 2. Tổng số lô hàng */}
                <td className="inventory__table-cell inventory__text-center">{product.batches?.length || 0}</td>
                {/* 3. Tổng tồn kho từ `totalQuantity` */}
                <td className="inventory__table-cell inventory__text-center inventory__total-quantity">
                    {product.totalRemaining.toLocaleString()}
                </td>
                {/* 4. Tổng giá trị tồn kho */}
                <td className="inventory__table-cell inventory__text-right">
                    {product.totalStockValue.toLocaleString()}₫
                </td>
            </tr>
            {isExpanded &&
                product.batches.map((batch) => {
                    const expiryStatus = getExpiryStatus(batch.expirationDate);
                    const batchRowClasses = classNames('inventory__table-row', {
                        'inventory__table-row--expired': expiryStatus === 'expired',
                        'inventory__table-row--near-expired': expiryStatus === 'near-expired',
                    });
                    const expiryTextClasses = classNames('inventory__table-cell', {
                        'inventory__text--expired': expiryStatus === 'expired',
                        'inventory__text--near-expired': expiryStatus === 'near-expired',
                    });

                    return (
                        <tr key={batch.batchNumber} className={batchRowClasses}>
                            <td className="inventory__table-cell inventory__table-cell--indent"></td>
                            <td className="inventory__table-cell"></td>
                            <td className="inventory__table-cell"></td>
                            <td className="inventory__table-cell">{batch.batchNumber}</td>
                            <td className="inventory__table-cell">{batch.entryDate}</td>
                            <td className={expiryTextClasses}>{batch.expirationDate}</td>
                            <td className="inventory__table-cell">{batch.quantity}</td>
                            <td className="inventory__table-cell">{batch.purchasePrice.toLocaleString()}₫</td>
                            <td className="inventory__table-cell">{batch.remaining}</td>
                            <td className="inventory__table-cell">{batch.remaining * batch.purchasePrice}₫</td>
                        </tr>
                    );
                })}
        </>
    );
};

export default ProductRow;
