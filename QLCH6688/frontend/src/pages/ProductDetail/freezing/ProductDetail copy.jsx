import { useState, useEffect, useContext } from 'react';
import './ProductDetail.css';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { categories } from '../../assets/categories';
import { brands, suppliers, units } from '../../assets/brandsAndSuppliers';

const ProductDetail = () => {
    const { urlImage, url, utilityFunctions, fetchProductList } = useContext(StoreContext);
    const { formatCurrency, formatDateFromYYYYMMDDToVietNamDate, removeSpecialChars } = utilityFunctions;
    const { id } = useParams(); // Lấy id từ URL
    const [isEditMode, setIsEditMode] = useState(false);

    const navigate = useNavigate();

    const [product, setProduct] = useState({
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
    });

    const [file, setFile] = useState(null); // Để upload hình ảnh
    const [batch, setBatch] = useState({
        entryDate: '',
        expirationDate: '',
        purchasePrice: '',
        quantity: '',
    });

    const [deleteBatchMode, setDeleteBatchMode] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);

    // Lấy thông tin sản phẩm từ server
    const fetchProduct = async () => {
        try {
            const response = await axios.get(`${url}api/sanpham/chitietsanpham/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy sản phẩm:', error);
        }
    };
    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Xử lý khi gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra dữ liệu trước khi gửi
        if (!product.name.trim()) {
            alert('Vui lòng nhập tên sản phẩm!');
            return;
        }
        if (!product.category) {
            alert('Vui lòng chọn nhóm hàng!');
            return;
        }
        if (!product.brand) {
            alert('Vui lòng chọn thương hiệu!');
            return;
        }
        if (!product.unit) {
            alert('Vui lòng chọn đơn vị tính!');
            return;
        }
        if (!product.supplier.name) {
            alert('Vui lòng nhập tên nhà cung cấp!');
            return;
        }
        if (product.batches.length === 0) {
            alert('Vui lòng thêm ít nhất một lô hàng!');
            return;
        }

        // Hiển thị cảnh báo xác nhận
        const confirmSubmit = window.confirm(
            'Các thay đổi sẽ được lưu và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?',
        );
        if (!confirmSubmit) {
            return; // Dừng nếu người dùng không xác nhận
        }

        const formData = new FormData();
        Object.keys(product).forEach((key) => {
            if (key === 'supplier') {
                // Xử lý supplier
                Object.keys(product.supplier).forEach((subKey) => {
                    formData.append(`supplier.${subKey}`, product.supplier[subKey]);
                });
            } else if (key === 'batches') {
                formData.append(key, JSON.stringify(product.batches));
            } else {
                formData.append(key, product[key]);
            }
        });
        if (file) formData.append('image', file); // Nếu có hình ảnh, thêm vào formData

        try {
            const response = await axios.put(`${url}api/sanpham/capnhatsanpham/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchProductList();
            alert(response.data.message);
            navigate('/sanpham'); // Quay lại trang danh sách sản phẩm
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
            alert('Cập nhật sản phẩm thất bại.');
        }
    };

    const handleChange2 = (e, field) => {
        const { name, value } = e.target;
        const key = field || name; // Sử dụng `field` nếu được cung cấp, nếu không thì sử dụng `name`

        // Xử lý riêng trường hợp nhà phân phối
        if (name === 'supplier.name') {
            const selectedSupplier = suppliers.find((supp) => supp.value === value);

            setProduct((prev) => ({
                ...prev,
                supplier: {
                    name: value,
                    contact: selectedSupplier?.phone || '',
                    address: selectedSupplier?.address || '',
                },
            }));
            return; // Không cần tiếp tục xử lý
        }

        // Validate cho từng trường
        const validateField = (key, sanitizedValue) => {
            switch (key) {
                case 'barcode': {
                    // Kiểm tra mã vạch chỉ bao gồm số
                    if (!/^\d*$/.test(sanitizedValue)) {
                        alert('Mã vạch chỉ được chứa số.');
                        return null;
                    }
                    // Kiểm tra độ dài tối đa của mã vạch
                    if (sanitizedValue.length > 13) {
                        alert('Mã vạch không được vượt quá 13 ký tự.');
                        return null;
                    }
                    break;
                }
                case 'name':
                    if (sanitizedValue.length > 100) {
                        alert('Tên sản phẩm không được dài hơn 100 ký tự.');
                        return null;
                    }
                    break;

                case 'description':
                    if (sanitizedValue.length > 200) {
                        alert('Mô tả không được dài hơn 200 ký tự.');
                        return null;
                    }
                    break;

                case 'notes':
                    if (sanitizedValue.length > 100) {
                        alert('Ghi chú không được dài hơn 100 ký tự.');
                        return null;
                    }
                    break;

                case 'sellingPrice':
                case 'purchasePrice':
                    if (sanitizedValue.length > 10) {
                        alert('Giá không được dài hơn 10 ký tự.');
                        return null;
                    }
                    if (!/^\d*$/.test(sanitizedValue)) {
                        alert('Giá chỉ được chứa số.');
                        return null;
                    }
                    break;

                case 'stock':
                    if (sanitizedValue.length > 5) {
                        alert('Số lượng tồn không được dài hơn 5 ký tự.');
                        return null;
                    }
                    break;
                default:
                    break;
            }
            return sanitizedValue; // Trả về giá trị đã lọc
        };

        // Lọc ký tự đặc biệt
        const sanitizedValue = removeSpecialChars(value, key);

        // Validate giá trị
        const validValue = validateField(key, sanitizedValue);
        if (validValue === null) return; // Dừng nếu không hợp lệ

        // Cập nhật state với giá trị đã được làm sạch và hợp lệ
        if (key.startsWith('supplier.')) {
            const supplierKey = key.split('.')[1];
            setProduct((prev) => ({
                ...prev,
                supplier: { ...prev.supplier, [supplierKey]: validValue },
            }));
        } else if (key === 'purchasePrice') {
            // Nếu là purchasePrice thì cập nhật cả product và batch
            setProduct((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
            setBatch((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
        } else {
            setProduct((prev) => ({
                ...prev,
                [key]: validValue,
            }));
        }
    };

    const handleChange = (e, field) => {
        const { name, value } = e.target;
        const key = field || name;

        // Lọc ký tự đặc biệt
        const sanitizedValue = removeSpecialChars(value, key);

        // Xử lý riêng trường hợp nhà phân phối
        if (name === 'supplier.name') {
            const selectedSupplier = suppliers.find((supp) => supp.value === value);
            setProduct((prev) => ({
                ...prev,
                supplier: {
                    name: value,
                    contact: selectedSupplier?.phone || '',
                    address: selectedSupplier?.address || '',
                },
            }));
            return;
        }

        // Validate cho từng trường
        const validateField = (key, sanitizedValue) => {
            switch (key) {
                case 'barcode': {
                    if (!/^\d*$/.test(sanitizedValue)) {
                        alert('Mã vạch chỉ được chứa số.');
                        return null;
                    }
                    if (sanitizedValue.length > 13) {
                        alert('Mã vạch không được vượt quá 13 ký tự.');
                        return null;
                    }
                    break;
                }
                case 'name':
                    if (sanitizedValue.length > 100) {
                        alert('Tên sản phẩm không được dài hơn 100 ký tự.');
                        return null;
                    }
                    break;
                case 'description':
                    if (sanitizedValue.length > 200) {
                        alert('Mô tả không được dài hơn 200 ký tự.');
                        return null;
                    }
                    break;
                case 'notes':
                    if (sanitizedValue.length > 100) {
                        alert('Ghi chú không được dài hơn 100 ký tự.');
                        return null;
                    }
                    break;
                case 'sellingPrice':
                case 'purchasePrice':
                    if (sanitizedValue.length > 10) {
                        alert('Giá không được dài hơn 10 ký tự.');
                        return null;
                    }
                    if (!/^\d*$/.test(sanitizedValue)) {
                        alert('Giá chỉ được chứa số.');
                        return null;
                    }
                    break;
                case 'stock':
                    if (sanitizedValue.length > 5) {
                        alert('Số lượng tồn không được dài hơn 5 ký tự.');
                        return null;
                    }
                    break;
                default:
                    break;
            }
            return sanitizedValue;
        };

        const validValue = validateField(key, sanitizedValue);
        if (validValue === null) return;

        if (key.startsWith('supplier.')) {
            const supplierKey = key.split('.')[1];
            setProduct((prev) => ({
                ...prev,
                supplier: { ...prev.supplier, [supplierKey]: validValue },
            }));
        } else if (key === 'purchasePrice') {
            // Cập nhật cả product.purchasePrice và batch.purchasePrice
            setProduct((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
            setBatch((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
        } else {
            setProduct((prev) => ({
                ...prev,
                [key]: validValue,
            }));
        }
    };

    const handleBatchChange2 = (e, field) => {
        const { name, value } = e.target;
        const key = field || name;

        // Validate cho từng trường
        const validateField = (key, value) => {
            switch (key) {
                case 'purchasePrice': {
                    if (value.length > 10) {
                        alert('Giá nhập không được dài hơn 10 ký tự.');
                        return null;
                    }
                    if (!/^\d*$/.test(value)) {
                        alert('Giá mua chỉ được chứa số.');
                        return null;
                    }
                    break;
                }
                case 'quantity': {
                    if (value.length > 5) {
                        alert('Số lượng không được dài hơn 5 ký tự.');
                        return null;
                    }
                    break;
                }
                default:
                    break;
            }
            return value;
        };

        // Validate giá trị
        const validValue = validateField(key, value);
        if (validValue === null) return; // Dừng nếu không hợp lệ

        // Cập nhật state với giá trị đã được làm sạch và hợp lệ
        setBatch((prev) => ({
            ...prev,
            [key]: validValue,
        }));
    };

    const handleBatchChange = (e, field) => {
        const { name, value } = e.target;
        const key = field || name;

        // Validate cho từng trường
        const validateField = (key, value) => {
            switch (key) {
                case 'purchasePrice': {
                    if (value.length > 10) {
                        alert('Giá nhập không được dài hơn 10 ký tự.');
                        return null;
                    }
                    if (!/^\d*$/.test(value)) {
                        alert('Giá mua chỉ được chứa số.');
                        return null;
                    }
                    break;
                }
                case 'quantity': {
                    if (value.length > 5) {
                        alert('Số lượng không được dài hơn 5 ký tự.');
                        return null;
                    }
                    break;
                }
                default:
                    break;
            }
            return value;
        };

        const validValue = validateField(key, value);
        if (validValue === null) return;

        // Cập nhật state với giá trị đã được làm sạch và hợp lệ
        setBatch((prev) => ({
            ...prev,
            [key]: validValue,
        }));

        // Bổ sung: Nếu thay đổi giá nhập của lô hàng, cập nhật luôn giá nhập của sản phẩm
        if (key === 'purchasePrice') {
            setProduct((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
        }
    };

    // const addBatch = () => {
    //     let batchToAdd = { ...batch };
    //     if (!batchToAdd.purchasePrice || batchToAdd.purchasePrice === '') {
    //         batchToAdd.purchasePrice = product.purchasePrice;
    //         console.log('đã gán giá trị: ', batchToAdd.purchasePrice);
    //         if (!batchToAdd.purchasePrice) {
    //             console.log('first');
    //         }
    //         if (batchToAdd.purchasePrice === '') {
    //             console.log('2');
    //         }
    //     }
    //     if (!batchToAdd.entryDate || !batchToAdd.expirationDate || !batchToAdd.purchasePrice || !batchToAdd.quantity) {
    //         alert('Vui lòng điền đầy đủ thông tin lô hàng!');
    //         console.log(batchToAdd);
    //         return;
    //     }
    //     console.log('true: ', batchToAdd);
    //     // setProduct((prev) => ({
    //     //     ...prev,
    //     //     batches: [...prev.batches, batchToAdd],
    //     // }));
    //     // setBatch({ entryDate: '', expirationDate: '', purchasePrice: '', quantity: '' });
    // };

    const addBatch = () => {
        let batchToAdd = { ...batch };

        // Gán giá trị mặc định cho purchasePrice của lô hàng nếu chưa có
        if (!batchToAdd.purchasePrice || batchToAdd.purchasePrice === '') {
            if (!product.purchasePrice || product.purchasePrice === '') {
                alert('Vui lòng nhập giá nhập sản phẩm trước khi thêm lô hàng.');
                return;
            }
            batchToAdd.purchasePrice = product.purchasePrice;
            console.log('batchToAdd.purchasePrice: ', batchToAdd.purchasePrice);
        }

        // Kiểm tra các trường bắt buộc của lô hàng
        if (!batchToAdd.entryDate || !batchToAdd.expirationDate || !batchToAdd.purchasePrice || !batchToAdd.quantity) {
            alert('Vui lòng điền đầy đủ thông tin lô hàng!');
            console.log(batchToAdd);
            return;
        }

        console.log('Lô hàng đã thêm: ', batchToAdd);

        setProduct((prev) => ({
            ...prev,
            batches: [...prev.batches, batchToAdd],
        }));
        setBatch({ entryDate: '', expirationDate: '', purchasePrice: '', quantity: '' });
    };

    const handleDeleteProduct = async (productId) => {
        // Hiển thị cảnh báo xác nhận
        const confirmDelete = window.confirm(
            'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!',
        );
        if (!confirmDelete) {
            return; // Dừng nếu người dùng không xác nhận
        }

        try {
            // Gửi yêu cầu xoá sản phẩm đến server
            const response = await axios.post(`${url}api/sanpham/xoasanpham`, { id: productId });

            if (response.data.success) {
                alert(response.data.message); // Hiển thị thông báo thành công
                navigate('/sanpham'); // Điều hướng về danh sách sản phẩm
            } else {
                alert(`Xóa sản phẩm thất bại: ${response.data.message}`); // Hiển thị lỗi
            }
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            alert('Đã xảy ra lỗi khi xóa sản phẩm.');
        }
    };

    return (
        <div className="detail-product">
            {/* <h1>Chỉnh sửa sản phẩm</h1> */}
            <h1>{isEditMode ? 'Chỉnh sửa' : 'Chi tiết'} sản phẩm</h1>
            <Link to="/sanpham" className="back-to-product-form-btn">
                Quay lại
            </Link>
            <form className="detail-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
                <div style={{ maxWidth: '600px', paddingLeft: '24px' }}>
                    <div className="form-group">
                        <label>Mã sản phẩm:</label>
                        <input type="text" name="productCode" value={product.productCode} disabled />
                    </div>
                    <div className="form-group">
                        <label>*Mã vạch:</label>
                        <input
                            type="text"
                            name="barcode"
                            value={product.barcode}
                            onChange={(e) => handleChange(e, 'barcode')}
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
                        />
                    </div>
                    <div className="form-group">
                        <label>*Nhóm hàng:</label>
                        <select
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
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
                        <select
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
                            required
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={(e) => handleChange(e, 'stock')}
                        />
                    </div>
                    <div>
                        <label>Ảnh sản phẩm hiện tại:</label>
                        <br />
                        <img
                            draggable={false}
                            src={`${urlImage}${product.image}`}
                            alt={`${product.name}`}
                            style={{
                                height: '250px',
                                width: '250px',
                                objectFit: 'cover',
                                borderRadius: '5px',
                                userSelect: 'none',
                            }}
                        />
                        <br />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <label htmlFor="">Thay ảnh mới</label>
                            <input disabled={!isEditMode} type="file" onChange={(e) => setFile(e.target.files[0])} />
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '600px', paddingLeft: '24px' }}>
                    <div className="form-group">
                        <label>Mô tả sản phẩm:</label>
                        <textarea
                            disabled={!isEditMode}
                            placeholder="Nhập mô tả cho sản phẩm"
                            name="description"
                            value={product.description}
                            onChange={(e) => handleChange(e, 'description')}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ghi chú:</label>
                        <textarea
                            disabled={!isEditMode}
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
                            disabled={!isEditMode}
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
                                <label>Ngày nhập hàng:</label>
                                <input
                                    disabled={!isEditMode}
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
                                <label>Ngày hết hạn:</label>
                                <input
                                    disabled={!isEditMode}
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
                                    disabled={!isEditMode}
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
                            disabled={!isEditMode}
                        >
                            Thêm lô hàng
                        </button>

                        <button
                            disabled={!isEditMode || product.batches.length === 0}
                            type="button"
                            style={{ padding: '8px 4px', marginRight: '16px', marginTop: '8px' }}
                            onClick={() => {
                                if (deleteBatchMode) {
                                    // Khi đang ở chế độ chọn, thực hiện xóa các lô hàng đã chọn
                                    const confirmDelete = window.confirm(
                                        'Bạn có chắc chắn muốn xóa các lô hàng đã chọn?',
                                    );
                                    if (confirmDelete) {
                                        setProduct((prev) => ({
                                            ...prev,
                                            batches: prev.batches.filter(
                                                (_, index) => !selectedBatches.includes(index),
                                            ),
                                        }));
                                        setSelectedBatches([]); // Xóa danh sách đã chọn
                                    }
                                }
                                setDeleteBatchMode(!deleteBatchMode); // Chuyển đổi chế độ
                            }}
                        >
                            {deleteBatchMode ? 'Xóa các lô hàng đã chọn' : 'Xóa lô hàng'}
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
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    // Thêm vào danh sách đã chọn
                                                    setSelectedBatches((prev) => [...prev, index]);
                                                } else {
                                                    // Loại bỏ khỏi danh sách đã chọn
                                                    setSelectedBatches((prev) => prev.filter((i) => i !== index));
                                                }
                                            }}
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
                        {/* <button type="button">Chỉnh sửa</button> */}
                        {/*  */}
                        <button
                            type="button"
                            style={{ padding: '8px 4px', marginRight: '16px' }}
                            // onClick={() => setIsEditMode(!isEditMode)}
                            onClick={() => {
                                if (isEditMode) {
                                    // case 1: Đang trong chế độ chỉnh sửa
                                    const confirmExit = window.confirm(
                                        'Bạn có chắc chắn muốn thoát chế độ chỉnh sửa? Mọi thay đổi sẽ không được lưu.',
                                    );
                                    if (confirmExit) {
                                        fetchProduct();
                                        setIsEditMode(false); // Thoát chế độ chỉnh sửa
                                    }
                                } else {
                                    // case 2: Chuyển sang chế độ chỉnh sửa
                                    setIsEditMode(true);
                                }
                            }}
                        >
                            {isEditMode ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
                        </button>
                        <button
                            disabled={!isEditMode}
                            type="submit"
                            // className="submit-btn"
                            style={{ padding: '8px 4px', marginRight: '16px' }}
                        >
                            Lưu & Cập nhật
                        </button>
                        <button
                            disabled={!isEditMode}
                            type="button"
                            onClick={() => handleDeleteProduct(product._id)}
                            style={{ padding: '8px 4px', marginRight: '16px' }}
                        >
                            Xóa sản phẩm
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductDetail;
