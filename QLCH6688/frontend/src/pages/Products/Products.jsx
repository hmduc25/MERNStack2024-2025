import { useState, useEffect, useMemo, useContext, memo, useCallback } from 'react';
import './Products.css';
import { StoreContext } from '../../context/StoreContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';
import defaultImage from '../../assets/images/Mystery-products.png';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';

// Tách riêng component cho một hàng sản phẩm để tối ưu hiệu suất.
// Sử dụng memo để ngăn việc render lại hàng khi các props không đổi.
const ProductRow = memo(({ product, urlImage, utilityFunctions }) => {
    const { formatCurrency, convertCategory } = utilityFunctions;

    // Sử dụng useCallback để tạo ra một hàm ổn định.
    const handleDetail = useCallback(() => {
        const url = `/sanpham/chitietsanpham/${product._id}`;
        window.open(url, '_blank');
    }, [product._id]);

    return (
        <tr>
            <td style={{ maxWidth: '118px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div>
                        <img
                            draggable={false}
                            src={`${urlImage}/${product.image}`}
                            alt={product.name || 'Sản phẩm'}
                            className="product-image"
                            onError={(e) => {
                                e.target.src = defaultImage;
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, marginLeft: '10px' }}>{product.productCode}</div>
                </div>
            </td>
            <td>{product.barcode}</td>
            <td style={{ textAlign: 'start', paddingLeft: 20, maxWidth: 400 }}>{product.name}</td>
            <td>{convertCategory(product.category)}</td>
            <td className="price-cell">{formatCurrency(product.sellingPrice)}</td>
            <td>{product.totalQuantity}</td>
            <td style={{ maxWidth: '100px' }}>
                <button className="detail-btn" onClick={handleDetail}>
                    Chi tiết
                </button>
            </td>
        </tr>
    );
});

const Products = () => {
    const { product_list, utilityFunctions, urlImage } = useContext(StoreContext);
    const { formatCurrency, convertCategory } = utilityFunctions;

    const [isLoading, setIsLoading] = useState(true);

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(10);
    const [sortOrder, setSortOrder] = useState('desc'); //asc hoặc desc

    // Sử dụng useEffect để kiểm tra khi dữ liệu đã tải xong
    useEffect(() => {
        if (product_list && product_list.length > 0) {
            setIsLoading(false);
        }
    }, [product_list]);

    // Memoize việc sắp xếp sản phẩm để tránh tính toán lại không cần thiết
    const sortedProducts = useMemo(() => {
        if (!product_list) return [];
        return [...product_list].sort((a, b) => {
            return sortOrder === 'asc'
                ? a.productCode.localeCompare(b.productCode)
                : b.productCode.localeCompare(a.productCode);
        });
    }, [product_list, sortOrder]);

    const productsToDisplay = useMemo(() => {
        const indexOfLastProduct = productsPerPage === 'all' ? sortedProducts.length : currentPage * productsPerPage;
        const indexOfFirstProduct = productsPerPage === 'all' ? 0 : indexOfLastProduct - productsPerPage;
        return sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }, [sortedProducts, currentPage, productsPerPage]);

    const totalPages = useMemo(() => {
        if (!sortedProducts) return 1;
        return productsPerPage === 'all' ? 1 : Math.ceil(sortedProducts.length / productsPerPage);
    }, [sortedProducts, productsPerPage]);

    // Sử dụng useCallback để các hàm không bị tạo lại trên mỗi lần render
    const paginate = useCallback((pageNumber) => setCurrentPage(pageNumber), []);

    const handleProductsPerPageChange = useCallback((e) => {
        const value = e.target.value;
        setProductsPerPage(value);
        setCurrentPage(1); // Reset về trang đầu tiên khi thay đổi số sản phẩm trên mỗi trang
    }, []);

    const handleSortToggle = useCallback(() => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    }, []);

    const exportToExcel = useCallback(() => {
        if (!product_list?.length) {
            alert('Không có sản phẩm để xuất!');
            return;
        }

        const confirmExport = window.confirm(
            'Bạn có chắc chắn muốn tải xuống danh sách sản phẩm dưới dạng file Excel?',
        );
        if (!confirmExport) return;

        const excelData = product_list.map((product) => ({
            'Mã sản phẩm': product.productCode,
            'Mã vạch': product.barcode,
            'Tên sản phẩm': product.name,
            'Nhóm hàng': convertCategory(product.category),
            'Giá nhập': product.purchasePrice,
            'Giá bán': product.sellingPrice,
            'Tồn kho': product.totalQuantity,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sản phẩm');

        const now = new Date();
        const dateString = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
            2,
            '0',
        )}_${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
        const fileName = `Danh_sach_san_pham_${dateString}.xlsx`;

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, fileName);
    }, [product_list, convertCategory]);

    const renderPaginationButtons = useCallback(() => {
        const pageNumbers = [];
        const maxPageButtons = 5;
        const totalPagesCount = totalPages;

        let startPage = 1;
        let endPage = totalPagesCount;

        if (totalPagesCount > maxPageButtons) {
            const sideButtons = 1;
            const middleRange = maxPageButtons - 2 - sideButtons * 2;
            const middleStart = Math.max(2, currentPage - Math.floor(middleRange / 2));
            const middleEnd = Math.min(totalPagesCount - 1, middleStart + middleRange - 1);

            if (middleStart > 2) {
                pageNumbers.push(
                    <button key="1" onClick={() => paginate(1)}>
                        1
                    </button>,
                    <span key="ellipsis-start">...</span>,
                );
            }

            for (let i = middleStart; i <= middleEnd; i++) {
                pageNumbers.push(
                    <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
                        {i}
                    </button>,
                );
            }

            if (middleEnd < totalPagesCount - 1) {
                pageNumbers.push(
                    <span key="ellipsis-end">...</span>,
                    <button key={totalPagesCount} onClick={() => paginate(totalPagesCount)}>
                        {totalPagesCount}
                    </button>,
                );
            }
        } else {
            for (let i = 1; i <= totalPagesCount; i++) {
                pageNumbers.push(
                    <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
                        {i}
                    </button>,
                );
            }
        }

        return (
            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                    Trang Trước
                </button>
                {pageNumbers}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPagesCount}>
                    Tiếp Theo
                </button>
            </div>
        );
    }, [currentPage, totalPages, paginate]);

    // 👇 BẮT ĐẦU PHẦN RENDER CÓ ĐIỀU KIỆN 👇
    if (isLoading) {
        return <StatusDisplaySpinner isLoading={true} loadingText="Đang tải danh sách sản phẩm..." />;
    }

    return (
        <div className="products">
            <h1>Danh sách sản phẩm</h1>
            <div className="action-buttons">
                <p>Tổng số sản phẩm: {product_list?.length || 0}</p>
                <Link to="/sanpham/themmoisanpham" className="toggle-btn">
                    Thêm sản phẩm mới
                </Link>
                <Link to="/sanpham/nhapkho" className="toggle-btn">
                    Nhập thêm hàng tồn kho
                </Link>
                <button className="toggle-btn" onClick={exportToExcel}>
                    Xuất file Excel
                </button>
                <div className="pagination-controls">
                    <label htmlFor="productsPerPage">Sản phẩm/trang:</label>
                    <select id="productsPerPage" value={productsPerPage} onChange={handleProductsPerPageChange}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={'all'}>Tất cả</option>
                    </select>
                </div>
            </div>
            <table className="products-table">
                <thead>
                    <tr>
                        <th onClick={handleSortToggle} style={{ cursor: 'pointer' }}>
                            Mã sản phẩm {sortOrder === 'asc' ? '▲' : '▼'}
                        </th>
                        <th>Mã vạch</th>
                        <th>Tên sản phẩm</th>
                        <th>Nhóm hàng</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {productsToDisplay.length > 0 ? (
                        productsToDisplay.map((product) => (
                            <ProductRow
                                key={product._id}
                                product={product}
                                urlImage={urlImage}
                                utilityFunctions={utilityFunctions}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">Không có sản phẩm nào</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && renderPaginationButtons()}
        </div>
    );
};

export default Products;
