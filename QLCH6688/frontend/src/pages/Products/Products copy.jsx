import { useState, useEffect, useContext, useMemo } from 'react';
import './Products.css';
import { StoreContext } from '../../context/StoreContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';
import defaultImage from '../../assets/images/Mystery-products.png';

const Products = () => {
    const { product_list, utilityFunctions, urlImage } = useContext(StoreContext);
    const { formatCurrency, convertCategory } = utilityFunctions;

    // State cho phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(10);

    // State cho các chức năng khác
    const [sortOrder, setSortOrder] = useState('desc');
    const [showAllPrices, setShowAllPrices] = useState(false);
    const [priceVisibility, setPriceVisibility] = useState({});

    useEffect(() => {
        const initialVisibility = {};
        product_list.forEach((product) => {
            initialVisibility[product._id] = false;
        });
        setPriceVisibility(initialVisibility);
    }, [product_list]);

    const toggleAllPrices = () => {
        setShowAllPrices((prev) => !prev);
        setPriceVisibility(Object.fromEntries(Object.keys(priceVisibility).map((key) => [key, !showAllPrices])));
    };

    const togglePriceVisibility = (id) => {
        setPriceVisibility((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const sortedProducts = useMemo(() => {
        if (!product_list) return [];
        return [...product_list].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.productCode.localeCompare(b.productCode);
            } else {
                return b.productCode.localeCompare(a.productCode);
            }
        });
    }, [product_list, sortOrder]);

    const indexOfLastProduct = productsPerPage === 'all' ? sortedProducts.length : currentPage * productsPerPage;
    const indexOfFirstProduct = productsPerPage === 'all' ? 0 : indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = productsPerPage === 'all' ? 1 : Math.ceil(sortedProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleProductsPerPageChange = (e) => {
        const value = e.target.value;
        setProductsPerPage(value);
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        if (!product_list.length) {
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
            'Tồn kho': product.stock,
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách sản phẩm');

        const now = new Date();
        const dateString = `${now.getHours().toString().padStart(2, '0')}${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}_${now.getDate().toString().padStart(2, '0')}${
            now.getMonth() + (1).toString().padStart(2, '0')
        }${now.getFullYear()}`;
        const fileName = `Danh_sach_san_pham_${dateString}.xlsx`;

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, fileName);
    };

    const handleDetail = (id) => {
        const url = `/sanpham/chitietsanpham/${id}`;
        window.open(url, '_blank');
    };

    const renderPaginationButtons = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Số nút trang tối đa hiển thị
        let startPage, endPage;

        if (totalPages <= maxPageButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 3) {
                startPage = 1;
                endPage = maxPageButtons - 2;
            } else if (currentPage + 2 >= totalPages) {
                startPage = totalPages - 2;
                endPage = totalPages;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button key={i} onClick={() => paginate(i)} className={currentPage === i ? 'active' : ''}>
                    {i}
                </button>,
            );
        }

        return (
            <div className="pagination">
                {totalPages > 3 && (
                    <button onClick={() => paginate(1)} disabled={currentPage === 1}>
                        Trang Đầu
                    </button>
                )}
                {currentPage > 1 && <button onClick={() => paginate(currentPage - 1)}>Trang Trước</button>}
                {startPage > 1 && <span>...</span>}
                {pageNumbers}
                {endPage < totalPages && <span>...</span>}
                {currentPage < totalPages && <button onClick={() => paginate(currentPage + 1)}>Tiếp Theo</button>}
                {totalPages > 3 && (
                    <button onClick={() => paginate(totalPages)} disabled={currentPage === totalPages}>
                        Trang Cuối
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="products">
            <h1>Danh sách sản phẩm</h1>
            <div className="action-buttons">
                <p>Tổng số sản phẩm: {product_list.length}</p>
                <Link to="/sanpham/themmoisanpham" className="toggle-btn">
                    Thêm sản phẩm mới
                </Link>
                <button className="toggle-btn" onClick={exportToExcel}>
                    Xuất file Excel
                </button>
                <button className="toggle-btn" onClick={toggleAllPrices} style={{ minWidth: '200px' }}>
                    {showAllPrices ? 'Ẩn toàn bộ giá nhập' : 'Hiển thị toàn bộ giá nhập'}
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
                        <th
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            style={{ cursor: 'pointer' }}
                        >
                            Mã sản phẩm {sortOrder === 'asc' ? '▲' : '▼'}
                        </th>
                        <th>Mã vạch</th>
                        <th>Tên sản phẩm</th>
                        <th>Nhóm hàng</th>
                        <th>Giá nhập</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.length > 0 ? (
                        currentProducts.map((product) => (
                            <tr key={product._id}>
                                <td style={{ maxWidth: '118px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <div>
                                            <img
                                                draggable={false}
                                                src={`${urlImage}/${product.image}`}
                                                // alt={product.name}
                                                alt={''}
                                                className="product-image"
                                                onError={(e) => {
                                                    e.target.src = defaultImage;
                                                }}
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>{product.productCode}</div>
                                    </div>
                                </td>
                                <td>{product.barcode}</td>
                                <td style={{ textAlign: 'start', paddingLeft: 20, maxWidth: 400 }}>{product.name}</td>
                                <td>{convertCategory(product.category)}</td>
                                <td
                                    className="price-cell"
                                    title="Click để xem giá"
                                    onClick={() => togglePriceVisibility(product._id)}
                                >
                                    {priceVisibility[product._id] ? formatCurrency(product.purchasePrice) : '*******'}
                                </td>
                                <td className="price-cell">{formatCurrency(product.sellingPrice)}</td>
                                <td>{product.stock}</td>
                                <td style={{ maxWidth: '100px' }}>
                                    <button className="detail-btn" onClick={() => handleDetail(product._id)}>
                                        Chi tiết
                                    </button>
                                </td>
                            </tr>
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
