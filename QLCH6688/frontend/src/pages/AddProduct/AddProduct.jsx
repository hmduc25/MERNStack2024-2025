import { useContext, useRef, useCallback, useState } from 'react'; // Thêm useState
import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { FaEdit, FaSave, FaTrashAlt, FaPlus, FaTimes, FaUndoAlt } from 'react-icons/fa';

import { StoreContext } from '../../context/StoreContext';
import { categories } from '../../assets/categories';
import { brands, suppliers, units } from '../../assets/brandsAndSuppliers';
import useProductApi from '../../hooks/useProductApi';
import useProductForm from '../../hooks/useProductForm';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';
import { toast } from 'react-toastify';

const AddProduct = () => {
    const { utilityFunctions } = useContext(StoreContext);
    const { removeSpecialChars, formatCurrency, formatDateFromYYYYMMDDToVietNamDate } = utilityFunctions;
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Thêm state mới để quản lý trạng thái của trường mã vạch
    const [isBarcodeDisabled, setIsBarcodeDisabled] = useState(false);

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
        description: '',
        notes: '',
        image: '',
        batches: [],
    };

    // Sử dụng custom hook để quản lý API, chỉ cần addProduct
    // LƯU Ý: Giả định hook useProductApi có hàm fetchLastProductCode
    const { isLoading, error, addProduct, fetchLastProductCode } = useProductApi();

    // Sử dụng useCallback để đảm bảo fetchLastProductCode không thay đổi
    const memoizedFetchLastProductCode = useCallback(fetchLastProductCode, []);

    // Sử dụng custom hook để quản lý form và lấy mã sản phẩm tự động
    const {
        product,
        setProduct,
        file,
        batch,
        handleChange,
        handleBatchChange,
        addBatch,
        resetForm,
        setFile,
        imagePreview,
        deleteBatchMode,
        selectedBatches,
        setDeleteBatchMode,
        setSelectedBatches,
        handleImageChange,
        handleDeleteSelectedBatches,
        handleSelectBatch,
    } = useProductForm(initialProductState, removeSpecialChars, 'add', memoizedFetchLastProductCode);

    const handleNoBarcodeClick = async () => {
        setIsBarcodeDisabled(true);
        try {
            // Gọi API để lấy mã vạch tùy chỉnh
            const result = await memoizedFetchLastProductCode();
            console.log('result_out: ', result);

            if (result && result.customBarcode) {
                console.log('result_in: ', result);
                console.log('result.customBarcode: ', result.customBarcode);
                setProduct({
                    ...product,
                    barcode: result.customBarcode,
                });
                toast.success(`Mã vạch ${result.customBarcode} đã được tạo tự động`);
            } else {
                console.error('Không lấy được mã vạch tùy chỉnh từ API.');
                toast.error('Có lỗi xảy ra khi tạo mã vạch tự động. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi gọi API lấy mã vạch:', error);
            toast.error('Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại!');
        }
    };

    // Xử lý khi gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Cập nhật logic kiểm tra: Bỏ bắt buộc mã vạch và hạn sử dụng
        if (
            !product.name.trim() ||
            !product.category ||
            !product.brand ||
            !product.unit ||
            !product.supplier.name ||
            product.batches.length === 0
        ) {
            toast.warning('Vui lòng điền đầy đủ thông tin sản phẩm và lô hàng!');
            return;
        }

        const finalProduct = {
            ...product,
            barcode: product.barcode || '',
            batches: product.batches.map((b) => ({
                ...b,
                expirationDate: b.expirationDate || '',
            })),
        };

        const confirmSubmit = window.confirm('Sản phẩm mới sẽ được thêm vào hệ thống. Bạn có chắc chắn muốn tiếp tục?');
        if (!confirmSubmit) return;

        const formData = new FormData();
        Object.keys(finalProduct).forEach((key) => {
            if (key === 'supplier') {
                Object.keys(finalProduct.supplier).forEach((subKey) => {
                    formData.append(`supplier.${subKey}`, finalProduct.supplier[subKey]);
                });
            } else if (key === 'batches') {
                formData.append(key, JSON.stringify(finalProduct.batches));
            } else {
                formData.append(key, finalProduct[key]);
            }
        });
        if (file) formData.append('image', file);

        const result = await addProduct(formData);
        if (result.success) {
            toast.info(result.message);
            navigate('/sanpham');
        } else {
            toast.error(result.message);
        }
    };

    if (isLoading || error) {
        return <StatusDisplaySpinner isLoading={isLoading} error={error} loadingText="Đang thêm sản phẩm..." />;
    }

    return (
        <motion.div
            className="detail-product"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="detail-product__heading">Thêm mới sản phẩm</h1>
            <Link to="/sanpham" className="detail-product__back-btn">
                <FaTimes /> Quay lại
            </Link>

            <form className="detail-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="detail-product-form__group-container">
                    <div className="detail-product-form__left">
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Mã sản phẩm (tự động):</label>
                            <input
                                className="detail-product-form__input"
                                type="text"
                                name="productCode"
                                value={product.productCode}
                                disabled
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label">Mã vạch:</label>
                            <input
                                className="detail-product-form__input"
                                type="text"
                                name="barcode"
                                value={product.barcode}
                                onChange={(e) => handleChange(e, 'barcode')}
                                readOnly={isBarcodeDisabled}
                                disabled={isBarcodeDisabled}
                            />
                            {/* Dòng gợi ý mới */}
                            {!isBarcodeDisabled && (
                                <p className="detail-product-form__help-text">
                                    <span onClick={handleNoBarcodeClick}>Sản phẩm không có mã vạch?</span>
                                </p>
                            )}
                            {isBarcodeDisabled && (
                                <p className="detail-product-form__help-text--disabled">Mã vạch đã được tạo tự động</p>
                            )}
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
                            />
                        </div>
                        <div className="detail-product-form__group">
                            <label className="detail-product-form__label--required">Nhóm hàng:</label>
                            <select
                                className="detail-product-form__select"
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
                                required
                                type="text"
                                name="sellingPrice"
                                value={product.sellingPrice}
                                onChange={(e) => handleChange(e, 'sellingPrice')}
                            />
                        </div>

                        <div className="detail-product-form__image-section">
                            <label className="detail-product-form__label--required">Ảnh sản phẩm:</label>
                            <div className="detail-product-form__image-upload-container">
                                <div className="detail-product-form__image-preview">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Ảnh sản phẩm"
                                            className="detail-product-form__image"
                                        />
                                    ) : (
                                        <div className="detail-product-form__image-placeholder">
                                            <label htmlFor="file-upload">Chưa có ảnh</label>
                                        </div>
                                    )}
                                </div>
                                <div className="detail-product-form__file-upload">
                                    <div className="file-input-wrapper">
                                        <label className="detail-product-form__label">Thay ảnh mới</label>
                                        <div className="custom-file-upload">
                                            <label htmlFor="file-upload" className="custom-file-label">
                                                {imagePreview ? 'Chọn ảnh khác' : 'Chọn ảnh mới'}
                                            </label>
                                            <input
                                                id="file-upload"
                                                type="file"
                                                onChange={handleImageChange}
                                                required
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                        {file && (
                                            <div className="detail-product-form__file-name">
                                                <p>
                                                    File đã chọn: <b>{file.name}</b>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="detail-product-form__guidelines">
                                        <a href="#" target="_blank">
                                            Hướng dẫn thêm sản phẩm mới
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
                                    readOnly={product.supplier.name !== 'other'}
                                />
                                <input
                                    className="detail-product-form__input"
                                    type="text"
                                    name="supplier.address"
                                    placeholder="Địa chỉ"
                                    value={product.supplier.address}
                                    onChange={handleChange}
                                    readOnly={product.supplier.name !== 'other'}
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
                                        type="number"
                                        name="quantity"
                                        value={batch.quantity}
                                        onChange={(e) => handleBatchChange(e, 'quantity')}
                                    />
                                </div>
                            </div>
                            <div className="detail-product-form__batch-actions">
                                <button className="detail-product-form__button" type="button" onClick={addBatch}>
                                    <FaPlus /> Thêm lô hàng
                                </button>

                                <button
                                    className={classNames(
                                        'detail-product-form__button',
                                        {
                                            'detail-product-form__button--delete': deleteBatchMode,
                                        },
                                        'detail-product-form__button--edit',
                                    )}
                                    type="button"
                                    disabled={product.batches.length === 0}
                                    onClick={handleDeleteSelectedBatches}
                                >
                                    {deleteBatchMode ? (
                                        selectedBatches.length > 0 ? (
                                            <>
                                                <FaTrashAlt /> Xóa lô đã chọn
                                            </>
                                        ) : (
                                            <>
                                                <FaTimes /> <span>Hủy bỏ</span>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <FaEdit /> Sửa, xóa lô hàng
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <ul className="detail-product-form__batch-list">
                            {product.batches.length > 0 ? (
                                <>
                                    {product.batches.map((batch, index) => (
                                        <motion.li
                                            key={index}
                                            className={classNames('detail-product-form__batch-item', {
                                                'detail-product-form__batch-item--selected':
                                                    selectedBatches.includes(index),
                                            })}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <div className="detail-product-form__batch-info">
                                                <b>Số lô {index + 1}:</b>
                                                <p>
                                                    Ngày nhập:{' '}
                                                    {batch.entryDate
                                                        ? formatDateFromYYYYMMDDToVietNamDate(batch.entryDate)
                                                        : 'Không có'}
                                                </p>
                                                <p>
                                                    Ngày hết hạn:{' '}
                                                    {batch.expirationDate
                                                        ? formatDateFromYYYYMMDDToVietNamDate(batch.expirationDate)
                                                        : 'Không có'}
                                                </p>
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
                                </>
                            ) : (
                                <div>
                                    <p>Chưa có lô hàng nào trong kho!</p>
                                </div>
                            )}
                        </ul>

                        <div className="detail-product-form__actions">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="detail-product-form__button detail-product-form__button--save detail-product-form__button--saveCustom"
                                type="submit"
                            >
                                <FaPlus /> Thêm sản phẩm
                            </motion.button>
                        </div>
                    </div>
                </div>
            </form>
        </motion.div>
    );
};

export default AddProduct;
