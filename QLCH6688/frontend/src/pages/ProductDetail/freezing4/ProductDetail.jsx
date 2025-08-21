import { useEffect, useContext } from 'react';
import './ProductDetail.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { FaEdit, FaSave, FaTrashAlt, FaPlus, FaTimes, FaUndoAlt } from 'react-icons/fa';

import { StoreContext } from '../../context/StoreContext';
import { categories } from '../../assets/categories';
import { brands, suppliers, units } from '../../assets/brandsAndSuppliers';
import useProductApi from '../../hooks/useProductApi';
import useProductForm from '../../hooks/useProductForm';

const ProductDetail = () => {
    const { urlImage, utilityFunctions } = useContext(StoreContext);
    const { formatCurrency, formatDateFromYYYYMMDDToVietNamDate, removeSpecialChars } = utilityFunctions;
    const { id } = useParams();
    const navigate = useNavigate();

    const initialProductState = {
        supplier: { name: '', contact: '', address: '' },
        productCode: '',
        barcode: '',
        name: '',
        category: '',
        brand: '',
        purchasePrice: '',
        sellingPrice: '',
        unit: '',
        stock: '',
        description: '',
        notes: '',
        image: '',
        batches: [],
    };

    // Sử dụng custom hook để quản lý form
    const {
        product,
        setProduct,
        file,
        setFile,
        batch,
        isEditMode,
        setIsEditMode,
        deleteBatchMode,
        selectedBatches,
        handleChange,
        handleBatchChange,
        addBatch,
        setDeleteBatchMode,
        setSelectedBatches,
    } = useProductForm(initialProductState, removeSpecialChars);

    // Sử dụng custom hook để quản lý API
    const { isLoading, error, fetchProduct, updateProduct, deleteProduct } = useProductApi();

    // Lấy dữ liệu sản phẩm khi component mount
    useEffect(() => {
        const getProductData = async () => {
            const productData = await fetchProduct(id);
            if (productData) {
                setProduct(productData);
            }
        };
        getProductData();
    }, [id]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Xử lý khi gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !product.name.trim() ||
            !product.category ||
            !product.brand ||
            !product.unit ||
            !product.supplier.name ||
            product.batches.length === 0
        ) {
            alert('Vui lòng điền đầy đủ thông tin sản phẩm và lô hàng!');
            return;
        }

        const confirmSubmit = window.confirm(
            'Các thay đổi sẽ được lưu và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
        );
        if (!confirmSubmit) return;

        const formData = new FormData();
        Object.keys(product).forEach((key) => {
            if (key === 'supplier') {
                Object.keys(product.supplier).forEach((subKey) => {
                    formData.append(`supplier.${subKey}`, product.supplier[subKey]);
                });
            } else if (key === 'batches') {
                formData.append(key, JSON.stringify(product.batches));
            } else {
                formData.append(key, product[key]);
            }
        });
        if (file) formData.append('image', file);

        const result = await updateProduct(id, formData);
        if (result.success) {
            alert(result.message);
            navigate('/sanpham');
        } else {
            alert(result.message);
        }
    };

    const handleDeleteProduct = async () => {
        const confirmDelete = window.confirm(
            'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!',
        );
        if (!confirmDelete) return;

        const result = await deleteProduct(id);
        if (result.success) {
            alert(result.message);
            navigate('/sanpham');
        } else {
            alert(result.message);
        }
    };

    if (isLoading) {
        return (
            <motion.div
                className="loading-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="error-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <p>Có lỗi xảy ra: {error}</p>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </motion.div>
        );
    }

    // ######## XỬ LÝ UI VỚI CÁC LÔ HÀNG ######## //
    // Hàm xử lý việc xóa lô hàng
    const handleDeleteSelectedBatches = () => {
        if (deleteBatchMode) {
            const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa các lô hàng đã chọn?');
            if (confirmDelete) {
                setProduct((prev) => ({
                    ...prev,
                    batches: prev.batches.filter((_, index) => !selectedBatches.includes(index)),
                }));
                setSelectedBatches([]);
            }
        }
        setDeleteBatchMode(!deleteBatchMode);
    };

    // Hàm xử lý việc chọn/bỏ chọn lô hàng để xóa
    const handleSelectBatch = (e, index) => {
        if (e.target.checked) {
            setSelectedBatches((prev) => [...prev, index]);
        } else {
            setSelectedBatches((prev) => prev.filter((i) => i !== index));
        }
    };

    // Hàm xử lý việc chuyển đổi chế độ chỉnh sửa
    const handleToggleEditMode = () => {
        if (isEditMode) {
            const confirmExit = window.confirm(
                'Bạn có chắc chắn muốn thoát chế độ chỉnh sửa? Mọi thay đổi sẽ không được lưu.',
            );
            if (confirmExit) {
                fetchProduct();
                setIsEditMode(false);
            }
        } else {
            setIsEditMode(true);
        }
    };
    // ######## KẾT THÚC XỬ LÝ UI VỚI CÁC LÔ HÀNG ######## //

    return (
        <motion.div
            className="detail-product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="detail-product__heading">{isEditMode ? 'Chỉnh sửa' : 'Chi tiết'} sản phẩm</h1>
            <Link to="/sanpham" className="detail-product__back-btn">
                <FaTimes /> Quay lại
            </Link>

            <form className="detail-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="detail-product-form__group-container">
                    <div className="detail-product-form__left">
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Mã sản phẩm:</label>
                            <input
                                className="detail-product-form__input"
                                type="text"
                                name="productCode"
                                value={product.productCode}
                                disabled
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Mã vạch:</label>
                            <input
                                className="detail-product-form__input"
                                type="text"
                                name="barcode"
                                value={product.barcode}
                                onChange={(e) => handleChange(e, 'barcode')}
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Tên sản phẩm:</label>
                            <input
                                className="detail-product-form__input"
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={(e) => handleChange(e, 'name')}
                                required
                                disabled={!isEditMode}
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Nhóm hàng:</label>
                            <select
                                className="detail-product-form__select"
                                disabled={!isEditMode}
                                required
                                name="category"
                                value={product.category}
                                onChange={(e) => handleChange(e)}
                            >
                                <option value="">-- Chọn nhóm hàng --</option>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Thương hiệu:</label>
                            <select
                                className="detail-product-form__select"
                                disabled={!isEditMode}
                                required
                                name="brand"
                                value={product.brand}
                                onChange={(e) => handleChange(e)}
                            >
                                <option value="">-- Chọn thương hiệu --</option>
                                {brands.map((brand) => (
                                    <option key={brand.value} value={brand.value}>
                                        {brand.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Đơn vị tính:</label>
                            <select
                                className="detail-product-form__select"
                                disabled={!isEditMode}
                                required
                                name="unit"
                                value={product.unit}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn đơn vị tính --</option>
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>
                                        {unit.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">
                                Giá nhập: ({formatCurrency(product.purchasePrice)})
                            </label>
                            <input
                                className="detail-product-form__input"
                                disabled={!isEditMode}
                                required
                                type="text"
                                name="purchasePrice"
                                value={product.purchasePrice}
                                onChange={(e) => handleChange(e, 'purchasePrice')}
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">
                                Giá bán: ({formatCurrency(product.sellingPrice)})
                            </label>
                            <input
                                className="detail-product-form__input"
                                disabled={!isEditMode}
                                required
                                type="text"
                                name="sellingPrice"
                                value={product.sellingPrice}
                                onChange={(e) => handleChange(e, 'sellingPrice')}
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Số lượng tồn kho:</label>
                            <input
                                className="detail-product-form__input"
                                disabled={!isEditMode}
                                required
                                type="number"
                                name="stock"
                                value={product.stock}
                                onChange={(e) => handleChange(e, 'stock')}
                            />
                        </div>
                        <div className="detail-product-form__image-section">
                            <label className="detail-product-form__label">Ảnh sản phẩm hiện tại:</label>
                            <div className="detail-product-form__image-upload-container">
                                <img
                                    className="detail-product-form__image"
                                    src={`${urlImage}${product.image}`}
                                    alt={`${product.name}`}
                                />
                                <div className="detail-product-form__file-upload">
                                    <div className="file-input-wrapper">
                                        <label className="detail-product-form__label">Thay ảnh mới</label>
                                        <div className="custom-file-upload">
                                            <label
                                                htmlFor="file-upload"
                                                className={
                                                    isEditMode ? 'custom-file-label' : 'custom-file-label__disabled'
                                                }
                                                disabled={!isEditMode}
                                            >
                                                Chọn ảnh mới
                                            </label>
                                            <input
                                                id="file-upload"
                                                disabled={!isEditMode}
                                                type="file"
                                                onChange={handleFileChange}
                                                style={{ cursor: isEditMode ? 'pointer' : 'not-allowed' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="detail-product-form__guidelines">
                                        <a href="#" target="_blank">
                                            Hướng dẫn thêm sản phẩm mới
                                        </a>
                                        <a href="#" target="_blank">
                                            Hướng dẫn chỉnh sửa sản phẩm
                                        </a>
                                        <a href="#" target="_blank">
                                            Hướng dẫn xóa sản phẩm
                                        </a>
                                        <a href="#" target="_blank">
                                            Hướng dẫn thêm hàng tồn kho (thêm, sửa, xóa lô hàng)
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-product-form__right">
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Mô tả sản phẩm:</label>
                            <textarea
                                className="detail-product-form__textarea"
                                disabled={!isEditMode}
                                placeholder="Nhập mô tả cho sản phẩm"
                                name="description"
                                value={product.description}
                                onChange={(e) => handleChange(e, 'description')}
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Ghi chú:</label>
                            <textarea
                                className="detail-product-form__textarea"
                                disabled={!isEditMode}
                                placeholder="Nhập ghi chú cho sản phẩm"
                                name="notes"
                                value={product.notes}
                                onChange={(e) => handleChange(e, 'notes')}
                            />
                        </div>

                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Nhà phân phối:</label>
                            <select
                                className="detail-product-form__select"
                                disabled={!isEditMode}
                                required
                                name="supplier.name"
                                value={product.supplier.name}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn nhà phân phối --</option>
                                {suppliers.map((supp) => (
                                    <option key={supp.value} value={supp.value}>
                                        {supp.label}
                                    </option>
                                ))}
                            </select>
                            <div className="detail-product-form__supplier-details">
                                <input
                                    className="detail-product-form__input"
                                    type="text"
                                    name="supplier.contact"
                                    placeholder="Số điện thoại liên hệ"
                                    value={product.supplier.contact}
                                    onChange={handleChange}
                                    readOnly={product.supplier.name !== 'other' || !isEditMode}
                                />
                                <input
                                    className="detail-product-form__input"
                                    type="text"
                                    name="supplier.address"
                                    placeholder="Địa chỉ"
                                    value={product.supplier.address}
                                    onChange={handleChange}
                                    readOnly={product.supplier.name !== 'other' || !isEditMode}
                                />
                            </div>
                        </div>

                        <div className="detail-product-form__group">
                            <div className="detail-product-form__batch-header">
                                <label className="detail-product-form__label">Thông tin lô hàng</label>
                                <i className="detail-product-form__batch-count">
                                    Tổng số lô hàng đã nhập: {product.batches.length}
                                </i>
                            </div>

                            <div className="detail-product-form__batch-inputs">
                                <div>
                                    <label className="detail-product-form__label">Ngày nhập hàng:</label>
                                    <input
                                        className="detail-product-form__input"
                                        disabled={!isEditMode}
                                        type="date"
                                        name="entryDate"
                                        value={batch.entryDate}
                                        onChange={handleBatchChange}
                                    />
                                </div>
                                <div>
                                    <label className="detail-product-form__label">Ngày hết hạn:</label>
                                    <input
                                        className="detail-product-form__input"
                                        disabled={!isEditMode}
                                        type="date"
                                        name="expirationDate"
                                        value={batch.expirationDate}
                                        onChange={handleBatchChange}
                                    />
                                </div>
                                <div>
                                    <label className="detail-product-form__label">Giá vốn</label>
                                    <input
                                        className="detail-product-form__input detail-product-form__input--readonly"
                                        type="text"
                                        name="purchasePrice"
                                        readOnly
                                        title="*Thay đổi Giá vốn bằng cách thay đổi Giá nhập sản phẩm"
                                        value={formatCurrency(product.purchasePrice)}
                                        onChange={(e) => handleBatchChange(e, 'purchasePrice')}
                                    />
                                </div>
                                <div>
                                    <label className="detail-product-form__label">Số lượng</label>
                                    <input
                                        className="detail-product-form__input"
                                        disabled={!isEditMode}
                                        type="number"
                                        name="quantity"
                                        value={batch.quantity}
                                        onChange={(e) => handleBatchChange(e, 'quantity')}
                                    />
                                </div>
                            </div>
                            <div className="detail-product-form__batch-actions">
                                <button
                                    className="detail-product-form__button"
                                    type="button"
                                    onClick={addBatch}
                                    disabled={!isEditMode}
                                >
                                    <FaPlus /> Thêm lô hàng
                                </button>

                                <button
                                    disabled={!isEditMode || product.batches.length === 0}
                                    className={classNames('detail-product-form__button', {
                                        'detail-product-form__button--delete': deleteBatchMode,
                                    })}
                                    type="button"
                                    onClick={handleDeleteSelectedBatches}
                                >
                                    {deleteBatchMode ? (
                                        <>
                                            <FaTrashAlt /> Xóa lô đã chọn
                                        </>
                                    ) : (
                                        'Xóa lô hàng'
                                    )}
                                </button>
                            </div>
                        </div>

                        <ul className="detail-product-form__batch-list">
                            {product.batches.map((batch, index) => (
                                <motion.li
                                    key={index}
                                    className={classNames('detail-product-form__batch-item', {
                                        'detail-product-form__batch-item--selected': selectedBatches.includes(index),
                                    })}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <div className="detail-product-form__batch-info">
                                        <b>Số lô {index + 1}:</b>
                                        <p>Ngày nhập: {formatDateFromYYYYMMDDToVietNamDate(batch.entryDate)}</p>
                                        <p>Ngày hết hạn: {formatDateFromYYYYMMDDToVietNamDate(batch.expirationDate)}</p>
                                        <p>Giá nhập: {formatCurrency(batch.purchasePrice)}</p>
                                        <p>Số lượng: {batch.quantity}</p>
                                    </div>
                                    {deleteBatchMode && (
                                        <input
                                            className="detail-product-form__batch-checkbox"
                                            type="checkbox"
                                            checked={selectedBatches.includes(index)}
                                            onChange={(e) => handleSelectBatch(e, index)}
                                        />
                                    )}
                                </motion.li>
                            ))}
                        </ul>

                        <div className="detail-product-form__actions">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={classNames('detail-product-form__button', {
                                    'detail-product-form__button--cancel': isEditMode,
                                    'detail-product-form__button--edit': !isEditMode,
                                })}
                                type="button"
                                onClick={handleToggleEditMode}
                            >
                                {isEditMode ? (
                                    <>
                                        <FaUndoAlt /> Hủy chỉnh sửa
                                    </>
                                ) : (
                                    <>
                                        <FaEdit /> Chỉnh sửa
                                    </>
                                )}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!isEditMode}
                                className="detail-product-form__button detail-product-form__button--save"
                                type="submit"
                            >
                                <FaSave /> Lưu & Cập nhật
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={!isEditMode}
                                className="detail-product-form__button detail-product-form__button--delete"
                                type="button"
                                onClick={() => handleDeleteProduct(product._id)}
                            >
                                <FaTrashAlt /> Xóa sản phẩm
                            </motion.button>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};
export default ProductDetail;
