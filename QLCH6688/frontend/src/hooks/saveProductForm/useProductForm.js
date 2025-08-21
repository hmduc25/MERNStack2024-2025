import { useState } from 'react';
import { suppliers } from '../assets/brandsAndSuppliers';
import { StoreContext } from '../context/StoreContext';

const useProductForm = (initialState, removeSpecialChars) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [product, setProduct] = useState(initialState);
    const [file, setFile] = useState(null);
    const [batch, setBatch] = useState({
        entryDate: '',
        expirationDate: '',
        purchasePrice: '',
        quantity: '',
    });
    const [deleteBatchMode, setDeleteBatchMode] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);

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

        // Lọc ký tự đặc biệt và validate
        const sanitizedValue = removeSpecialChars(value, key);
        const validValue = validateField(key, sanitizedValue);
        if (validValue === null) return;

        setProduct((prev) => {
            // Xử lý riêng trường hợp nhà phân phối
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
            // Xử lý trường supplier con (ví dụ: contact, address)
            if (key.startsWith('supplier.')) {
                const supplierKey = key.split('.')[1];
                return {
                    ...prev,
                    supplier: { ...prev.supplier, [supplierKey]: validValue },
                };
            }
            // Cập nhật cả product.purchasePrice và batch.purchasePrice nếu thay đổi giá nhập
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

        // Cập nhật giá nhập của sản phẩm nếu thay đổi giá nhập của lô hàng
        if (key === 'purchasePrice') {
            setProduct((prev) => ({
                ...prev,
                purchasePrice: validValue,
            }));
        }
    };

    const addBatch = () => {
        let batchToAdd = { ...batch };

        // Gán giá trị mặc định cho purchasePrice nếu chưa có
        if (!batchToAdd.purchasePrice || batchToAdd.purchasePrice === '') {
            if (!product.purchasePrice || product.purchasePrice === '') {
                alert('Vui lòng nhập giá nhập sản phẩm trước khi thêm lô hàng.');
                return;
            }
            batchToAdd.purchasePrice = product.purchasePrice;
        }

        // Kiểm tra các trường bắt buộc của lô hàng
        if (!batchToAdd.entryDate || !batchToAdd.expirationDate || !batchToAdd.purchasePrice || !batchToAdd.quantity) {
            alert('Vui lòng điền đầy đủ thông tin lô hàng!');
            return;
        }

        console.log('Lô hàng đã thêm: ', batchToAdd);

        setProduct((prev) => ({
            ...prev,
            batches: [...prev.batches, batchToAdd],
        }));
        setBatch({ entryDate: '', expirationDate: '', purchasePrice: '', quantity: '' });
    };

    return {
        product,
        setProduct,
        file,
        setFile,
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
        addBatch,
    };
};

export default useProductForm;
