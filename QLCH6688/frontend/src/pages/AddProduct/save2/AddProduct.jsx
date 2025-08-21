import { useEffect, useContext, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { FaSave, FaPlus, FaUndoAlt } from 'react-icons/fa';

import { StoreContext } from '../../context/StoreContext';
import { categories } from '../../assets/categories';
import { brands, suppliers, units } from '../../assets/brandsAndSuppliers';
import useProductApi from '../../hooks/useProductApi';
import useProductForm from '../../hooks/useProductForm';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';

const AddProduct = () => {
    const { utilityFunctions } = useContext(StoreContext);
    const { removeSpecialChars, formatCurrency, formatDateFromYYYYMMDDToVietNamDate } = utilityFunctions;
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

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
        deleteBatchMode,
        selectedBatches,
        setDeleteBatchMode,
        setSelectedBatches,
        handleImageChange,
        handleDeleteSelectedBatches,
        handleSelectBatch,
    } = useProductForm(initialProductState, removeSpecialChars, 'add', useProductApi().fetchLastProductCode);

    // Sử dụng custom hook để quản lý API, chỉ cần addProduct
    const { isLoading, error, addProduct } = useProductApi();

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

        const confirmSubmit = window.confirm('Sản phẩm mới sẽ được thêm vào hệ thống. Bạn có chắc chắn muốn tiếp tục?');
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

        const result = await addProduct(formData);
        if (result.success) {
            alert(result.message);
            navigate('/sanpham');
        } else {
            alert(result.message);
        }
    };

    if (isLoading || error) {
        return <StatusDisplaySpinner isLoading={isLoading} error={error} loadingText="Đang thêm sản phẩm..." />;
    }

    return (
        <div className="detail-product">
            {/* <h1>Chỉnh sửa sản phẩm</h1> */}
            <h1>Thêm mới sản phẩm</h1>
            <Link to="/sanpham" className="back-to-product-form-btn">
                Quay lại
            </Link>
            <form className="detail-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ maxWidth: '600px', paddingLeft: '24px' }}>
                    <div className="form-group">
                        <label>Mã sản phẩm (tự động):</label>
                        <input type="text" name="productCode" value={product.productCode} disabled />
                    </div>
                    <div className="form-group">
                        <label>*Mã vạch:</label>
                        <input
                            required
                            type="text"
                            name="barcode"
                            value={product.barcode}
                            onChange={(e) => handleChange(e, 'barcode')}
                        />
                    </div>
                    <div className="form-group">
                        <label>*Tên sản phẩm:</label>
                        <input
                            type="text"
                            name="name"
                            value={product.name}
                            onChange={(e) => handleChange(e, 'name')}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>*Nhóm hàng:</label>
                        <select
                            required
                            name="category"
                            value={product.category}
                            onChange={(e) => handleChange(e)}
                            style={{
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                width: '100%',
                            }}
                        >
                            <option value="">-- Chọn nhóm hàng cho sản phẩm --</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Thương hiệu:</label>

                        <select
                            required
                            name="brand"
                            value={product.brand}
                            onChange={(e) => handleChange(e)}
                            style={{
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                width: '100%',
                            }}
                        >
                            <option value="">-- Chọn thương hiệu của sản phẩm --</option>
                            {brands.map((brand) => (
                                <option key={brand.value} value={brand.value}>
                                    {brand.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>*Đơn vị tính:</label>
                        {/* <input
                            type="text"
                            name="unit"
                            value={product.unit}
                            onChange={(e) => handleChange(e, 'unit')}
                            required
                        /> */}
                        <select
                            required
                            name="unit"
                            value={product.unit}
                            onChange={handleChange}
                            style={{
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                width: '100%',
                                marginBottom: '15px',
                            }}
                        >
                            <option value="">-- Chọn đơn vị tính cho sản phẩm --</option>
                            {units.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                    {unit.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>*Giá nhập: ({formatCurrency(product.purchasePrice)})</label>
                        <input
                            required
                            type="text"
                            name="purchasePrice"
                            value={product.purchasePrice}
                            onChange={(e) => handleChange(e, 'purchasePrice')}
                        />
                    </div>
                    <div className="form-group">
                        <label>*Giá bán: ({formatCurrency(product.sellingPrice)})</label>
                        <input
                            required
                            type="text"
                            name="sellingPrice"
                            value={product.sellingPrice}
                            onChange={(e) => handleChange(e, 'sellingPrice')}
                        />
                    </div>
                    <div className="form-group">
                        <label>*Số lượng tồn kho:</label>
                        <input
                            required
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={(e) => handleChange(e, 'stock')}
                        />
                    </div>
                    <div className="form-group">
                        <label>*Ảnh sản phẩm:</label>
                        <br />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <input required type="file" ref={fileInputRef} onChange={handleImageChange} />
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '600px', paddingLeft: '24px' }}>
                    <div className="form-group">
                        <label>Mô tả sản phẩm:</label>
                        <textarea
                            placeholder="Nhập mô tả cho sản phẩm"
                            name="description"
                            value={product.description}
                            onChange={(e) => handleChange(e, 'description')}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ghi chú:</label>
                        <textarea
                            placeholder="Nhập ghi chú cho sản phẩm"
                            name="notes"
                            value={product.notes}
                            onChange={(e) => handleChange(e, 'notes')}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                            Nhà phân phối:
                        </label>
                        <select
                            required
                            name="supplier.name"
                            value={product.supplier.name}
                            onChange={handleChange}
                            style={{
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                                width: '100%',
                                marginBottom: '15px',
                            }}
                        >
                            <option value="">-- Chọn nhà phân phối --</option>
                            {suppliers.map((supp) => (
                                <option key={supp.value} value={supp.value}>
                                    {supp.label}
                                </option>
                            ))}
                        </select>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '15px',
                            }}
                        >
                            <input
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    minWidth: '270px',
                                }}
                                type="text"
                                name="supplier.contact"
                                placeholder="Số điện thoại liên hệ"
                                value={product.supplier.contact}
                                onChange={handleChange}
                                readOnly={product.supplier.name !== 'other'} // Chỉ cho chỉnh sửa nếu chọn "KHÁC"
                            />
                            <input
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    minWidth: '270px',
                                }}
                                type="text"
                                name="supplier.address"
                                placeholder="Địa chỉ"
                                value={product.supplier.address}
                                onChange={handleChange}
                                readOnly={product.supplier.name !== 'other'} // Chỉ cho chỉnh sửa nếu chọn "KHÁC"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Thông tin lô hàng</label>
                            <i>Tổng số lô hàng đã nhập: {product.batches.length}</i>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <label>*Ngày nhập hàng:</label>
                                <input
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        minWidth: '270px',
                                    }}
                                    type="date"
                                    name="entryDate"
                                    value={batch.entryDate}
                                    onChange={handleBatchChange}
                                    placeholder="Ngày nhập"
                                />
                            </div>
                            <div>
                                <label>*Ngày hết hạn:</label>
                                <input
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        minWidth: '270px',
                                    }}
                                    type="date"
                                    name="expirationDate"
                                    value={batch.expirationDate}
                                    onChange={handleBatchChange}
                                    placeholder="Ngày hết hạn"
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <label maxLength={20}>Giá vốn</label>
                                <input
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        minWidth: '270px',
                                    }}
                                    maxLength={11}
                                    type="text"
                                    name="purchasePrice"
                                    readOnly
                                    title="*Thay đổi Giá vốn bằng cách thay đổi Giá nhập sản phẩm"
                                    value={formatCurrency(product.purchasePrice)}
                                    onChange={(e) => handleBatchChange(e, 'purchasePrice')}
                                />
                            </div>
                            <div>
                                <label>Số lượng</label>
                                <input
                                    style={{
                                        padding: '8px',
                                        borderRadius: '4px',
                                        border: '1px solid #ccc',
                                        minWidth: '270px',
                                    }}
                                    type="number"
                                    name="quantity"
                                    value={batch.quantity}
                                    onChange={(e) => handleBatchChange(e, 'quantity')}
                                    placeholder="Số lượng (lô hàng)"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            style={{ padding: '8px 4px', marginRight: '16px', marginTop: '8px' }}
                            onClick={addBatch}
                        >
                            Thêm lô hàng
                        </button>

                        <button
                            disabled={product.batches.length === 0}
                            type="button"
                            style={{ padding: '8px 4px', marginRight: '16px', marginTop: '8px' }}
                            onClick={handleDeleteSelectedBatches}
                        >
                            {/* {deleteBatchMode ? 'Xóa các lô hàng đã chọn' : 'Xóa lô hàng'} */}
                            {deleteBatchMode
                                ? selectedBatches.length > 0
                                    ? 'Xóa các lô hàng đã chọn'
                                    : 'Hủy bỏ'
                                : 'Xóa lô hàng'}
                        </button>
                    </div>
                    <ul>
                        {product.batches.map((batch, index) => (
                            <li key={index} style={{ marginBottom: '8px' }}>
                                <b>Số lô {index + 1}:</b>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p>Ngày nhập: {formatDateFromYYYYMMDDToVietNamDate(batch.entryDate)}</p>
                                        <p>Giá nhập: {formatCurrency(batch.purchasePrice)}</p>
                                    </div>
                                    {deleteBatchMode && (
                                        <input
                                            type="checkbox"
                                            checked={selectedBatches.includes(index)}
                                            onChange={(e) => handleSelectBatch(e, index)}
                                        />
                                    )}
                                    <div>
                                        <p>Ngày hết hạn: {formatDateFromYYYYMMDDToVietNamDate(batch.expirationDate)}</p>
                                        <p>Số lượng: {batch.quantity}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div
                        style={{
                            border: '1px solid #ccc',
                            borderRadius: '8px',
                            minHeight: '200px',
                            marginTop: '14px',
                            padding: '18px',
                        }}
                    >
                        {/*  */}
                        <button type="submit" style={{ padding: '8px 4px', marginRight: '16px' }}>
                            Thêm mới sản phẩm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
