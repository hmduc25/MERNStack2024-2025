// src/hooks/useProductForm.js
import { useState, useEffect } from 'react';
import { suppliers } from '../assets/brandsAndSuppliers';

/**
 * Custom hook để quản lý state và logic của form sản phẩm (thêm/chỉnh sửa).
 * @param {object} initialState - Trạng thái khởi tạo của form.
 * @param {function} removeSpecialChars - Hàm để lọc ký tự đặc biệt.
 * @param {string} mode - Chế độ hoạt động ('add' hoặc 'edit').
 * @param {function} fetchLastProductCode - Hàm để lấy mã sản phẩm cuối cùng từ API.
 * @param {function} fetchProduct - Hàm để lấy dữ liệu sản phẩm khi cần thoát chế độ chỉnh sửa.
 */
const useProductForm = (initialState, removeSpecialChars, mode = 'edit', fetchLastProductCode, fetchProduct) => {
    const [product, setProduct] = useState(initialState);
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [batch, setBatch] = useState({
        entryDate: '',
        expirationDate: '',
        purchasePrice: '',
        quantity: '',
    });

    // State đặc thù cho ProductDetail
    const [isEditMode, setIsEditMode] = useState(mode === 'edit' ? false : true);
    const [deleteBatchMode, setDeleteBatchMode] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);

    // Lấy mã sản phẩm tự động khi ở chế độ 'add'
    useEffect(() => {
        if (mode === 'add' && fetchLastProductCode) {
            const getNewCode = async () => {
                const lastCode = await fetchLastProductCode();
                if (lastCode) {
                    const newCode = `SP${(parseInt(lastCode.slice(2)) + 1).toString().padStart(6, '0')}`;
                    setProduct((prev) => ({ ...prev, productCode: newCode }));
                }
            };
            getNewCode();
        }
    }, [mode, fetchLastProductCode]);

    // Logic validation cho các trường input
    const validateField = (key, value) => {
        switch (key) {
            case 'barcode': {
                if (!/^\d*$/.test(value)) {
                    alert('Mã vạch chỉ được chứa số.');
                    return null;
                }
                if (value.length > 13) {
                    alert('Mã vạch không được vượt quá 13 ký tự.');
                    return null;
                }
                break;
            }
            case 'name':
                if (value.length > 100) {
                    alert('Tên sản phẩm không được dài hơn 100 ký tự.');
                    return null;
                }
                break;
            case 'description':
                if (value.length > 200) {
                    alert('Mô tả không được dài hơn 200 ký tự.');
                    return null;
                }
                break;
            case 'notes':
                if (value.length > 100) {
                    alert('Ghi chú không được dài hơn 100 ký tự.');
                    return null;
                }
                break;
            case 'sellingPrice':
            case 'purchasePrice':
                if (value.length > 10) {
                    alert('Giá không được dài hơn 10 ký tự.');
                    return null;
                }
                if (!/^\d*$/.test(value)) {
                    alert('Giá chỉ được chứa số.');
                    return null;
                }
                break;
            case 'stock':
                if (value.length > 5) {
                    alert('Số lượng tồn không được dài hơn 5 ký tự.');
                    return null;
                }
                break;
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

    // Hàm xử lý chung cho các trường của product và supplier
    const handleChange = (e, field) => {
        const { name, value } = e.target;
        const key = field || name;

        const sanitizedValue = removeSpecialChars(value, key);
        const validValue = validateField(key, sanitizedValue);
        if (validValue === null) return;

        setProduct((prev) => {
            if (name === 'supplier.name') {
                const selectedSupplier = suppliers.find((supp) => supp.value === value);
                return {
                    ...prev,
                    supplier: {
                        name: value,
                        contact: selectedSupplier?.phone || '',
                        address: selectedSupplier?.address || '',
                    },
                };
            }
            if (key.startsWith('supplier.')) {
                const supplierKey = key.split('.')[1];
                return {
                    ...prev,
                    supplier: { ...prev.supplier, [supplierKey]: validValue },
                };
            }
            if (key === 'purchasePrice') {
                setBatch((prevBatch) => ({
                    ...prevBatch,
                    purchasePrice: validValue,
                }));
            }
            return {
                ...prev,
                [key]: validValue,
            };
        });
    };

    // Hàm xử lý riêng cho lô hàng
    const handleBatchChange = (e, field) => {
        const { name, value } = e.target;
        const key = field || name;

        const validValue = validateField(key, value);
        if (validValue === null) return;

        setBatch((prev) => ({
            ...prev,
            [key]: validValue,
        }));

        if (key === 'purchasePrice') {
            setProduct((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
        }
    };

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Tạo URL tạm thời để hiển thị ảnh
            const url = URL.createObjectURL(selectedFile);
            setImagePreview(url);
        } else {
            setFile(null);
            setImagePreview('');
        }
    };

    const addBatch = () => {
        let batchToAdd = { ...batch };

        if (!batchToAdd.purchasePrice || batchToAdd.purchasePrice === '') {
            if (!product.purchasePrice || product.purchasePrice === '') {
                alert('Vui lòng nhập giá nhập sản phẩm trước khi thêm lô hàng.');
                return;
            }
            batchToAdd.purchasePrice = product.purchasePrice;
        }

        if (!batchToAdd.entryDate || !batchToAdd.expirationDate || !batchToAdd.purchasePrice || !batchToAdd.quantity) {
            alert('Vui lòng điền đầy đủ thông tin lô hàng!');
            return;
        }

        setProduct((prev) => ({
            ...prev,
            batches: [...prev.batches, batchToAdd],
        }));
        setBatch({ entryDate: '', expirationDate: '', purchasePrice: '', quantity: '' });
    };

    // Hàm để reset toàn bộ form về trạng thái ban đầu
    const resetForm = () => {
        setProduct(initialState);
        setFile(null);
        setBatch({ entryDate: '', expirationDate: '', purchasePrice: '', quantity: '' });
        // Gọi lại hàm fetch mã sản phẩm mới sau khi reset nếu ở chế độ 'add'
        if (mode === 'add' && fetchLastProductCode) {
            const getNewCode = async () => {
                const lastCode = await fetchLastProductCode();
                if (lastCode) {
                    const newCode = `SP${(parseInt(lastCode.slice(2)) + 1).toString().padStart(6, '0')}`;
                    setProduct((prev) => ({ ...prev, productCode: newCode }));
                }
            };
            getNewCode();
        }
    };

    // ######## XỬ LÝ UI VỚI CÁC LÔ HÀNG ######## //
    const handleDeleteSelectedBatches = () => {
        // if (deleteBatchMode) {
        //     const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa các lô hàng đã chọn?');
        //     if (confirmDelete) {
        //         setProduct((prev) => ({
        //             ...prev,
        //             batches: prev.batches.filter((_, index) => !selectedBatches.includes(index)),
        //         }));
        //         setSelectedBatches([]);
        //     }
        // }
        // setDeleteBatchMode(!deleteBatchMode);

        // Nếu đang ở chế độ xóa
        if (deleteBatchMode) {
            if (selectedBatches.length === 0) {
                setDeleteBatchMode(false);
                return;
            }

            // Nếu có lô hàng được chọn, xác nhận và thực hiện xóa
            const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa các lô hàng đã chọn?');
            if (confirmDelete) {
                setProduct((prev) => ({
                    ...prev,
                    batches: prev.batches.filter((_, index) => !selectedBatches.includes(index)),
                }));
                setSelectedBatches([]);
            }
        }
        // Chuyển đổi chế độ
        setDeleteBatchMode(!deleteBatchMode);
    };

    const handleSelectBatch = (e, index) => {
        if (e.target.checked) {
            setSelectedBatches((prev) => [...prev, index]);
        } else {
            setSelectedBatches((prev) => prev.filter((i) => i !== index));
        }
    };

    const handleToggleEditMode = () => {
        if (isEditMode) {
            const confirmExit = window.confirm(
                'Bạn có chắc chắn muốn thoát chế độ chỉnh sửa? Mọi thay đổi sẽ không được lưu.',
            );
            if (confirmExit) {
                if (fetchProduct) {
                    fetchProduct();
                }
                setIsEditMode(false);
            }
        } else {
            setIsEditMode(true);
        }
    };

    return {
        product,
        setProduct,
        file,
        setFile,
        imagePreview,
        batch,
        setBatch,
        isEditMode,
        setIsEditMode,
        deleteBatchMode,
        setDeleteBatchMode,
        selectedBatches,
        setSelectedBatches,
        handleChange,
        handleBatchChange,
        handleImageChange,
        addBatch,
        resetForm,
        handleDeleteSelectedBatches,
        handleSelectBatch,
        handleToggleEditMode,
    };
};

export default useProductForm;
