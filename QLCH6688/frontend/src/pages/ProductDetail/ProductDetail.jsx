import { useEffect, useContext, useState } from 'react';
import './ProductDetail.css';
import { useParams, useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { FaEdit, FaSave, FaTrashAlt, FaPlus, FaTimes, FaUndoAlt } from 'react-icons/fa';

import { Steps } from 'intro.js-react';
import introJs from 'intro.js';
import 'intro.js/introjs.css';

import { StoreContext } from '../../context/StoreContext';
import { categories } from '../../assets/categories';
import { brands, suppliers, units } from '../../assets/brandsAndSuppliers';
import useProductApi from '../../hooks/useProductApi';
import useProductForm from '../../hooks/useProductForm';
import StatusDisplaySpinner from '../../components/StatusDisplaySpinner/StatusDisplaySpinner';
import { toast } from 'react-toastify';

const ProductDetail = () => {
    const { urlImage, utilityFunctions } = useContext(StoreContext);
    const { formatCurrency, formatDateFromYYYYMMDDToVietNamDate, removeSpecialChars } = utilityFunctions;
    const { id } = useParams();
    const navigate = useNavigate();

    const [stepsEnabled, setStepsEnabled] = useState(false);
    const [initialStep, setInitialStep] = useState(0);
    const [forceRenderKey, setForceRenderKey] = useState(0);

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
        productStatus: 'active',
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
        handleDeleteSelectedBatches,
        handleSelectBatch,
        handleToggleEditMode,
        handleImageChange,
    } = useProductForm(initialProductState, removeSpecialChars);

    // Sử dụng custom hook để quản lý API
    const { isLoading, error, fetchProduct, updateProduct, deleteProduct } = useProductApi();

    const steps = [
        {
            intro: 'Chào mừng bạn đến với trang <b>Chi tiết sản phẩm</b>! Đây là nơi bạn có thể xem, chỉnh sửa thông tin và quản lý tồn kho (lô hàng) của sản phẩm. Ấn <em>Tiếp</em> để bắt đầu.',
        },
        {
            element: 'button.detail-product-form__button.detail-product-form__button--edit:nth-of-type(1)',
            intro: 'Để bắt đầu chỉnh sửa thông tin sản phẩm hoặc thêm lô hàng, bạn cần nhấn nút <b>Chỉnh sửa</b> ở đây.',
            position: 'top',
        },
        {
            element: 'input[name="productCode"]',
            intro: 'Đây là <b>Mã sản phẩm</b> được hệ thống tự động tạo, dùng để định danh sản phẩm. Mã này <em>không thể thay đổi</em>.',
            position: 'right',
        },
        {
            element: 'input[name="barcode"]',
            intro: 'Bạn có thể chỉnh sửa <b>Mã vạch</b> sản phẩm tại đây. Nếu sản phẩm đã được tạo mã tự động (bắt đầu bằng SKU_) thì không thể chỉnh sửa <br> <em>Lưu ý: Mã vạch SKU là mã vạch dành cho những sản phẩm không có mã vạch riêng từ nhà sản xuất.</em>',
            position: 'right',
        },
        {
            element: 'input[name="name"]',
            intro: 'Đây là <b>Tên sản phẩm</b>. Tên phải rõ ràng và là trường bắt buộc.',
            position: 'right',
        },
        {
            element: '.detail-product-form__group-row',
            intro: 'Chọn <b>Nhóm hàng</b>. Bạn cũng có thể chọn <b>Thương hiệu</b> và <b>Đơn vị tính</b> tại các trường bên dưới.',
        },
        {
            element: 'select[name="productStatus"]',
            intro: 'Thiết lập <b>Trạng thái sản phẩm</b> (Đang hoạt động, Ngừng kinh doanh, Ẩn sản phẩm).',
            position: 'right',
        },
        {
            element: 'input[name="purchasePrice"]',
            intro: 'Nhập <b>Giá nhập (Giá vốn)</b>. Giá này sẽ được áp dụng cho các lô hàng mới khi bạn thêm lô hàng mới vào sản phẩm này. <br> <em>Lưu ý: Thay đổi Giá nhập ở đây sẽ ảnh hưởng đến giá vốn của lô hàng mới, không ảnh hưởng đến các lô hàng đã có.</em>',
        },
        {
            element: 'input[name="sellingPrice"]',
            intro: 'Nhập <b>Giá bán</b> áp dụng cho sản phẩm này.',
        },
        {
            element: '.detail-product-form__image-section',
            intro: 'Phần <b>Ảnh sản phẩm</b>. Bạn có thể chọn ảnh mới tại đây để thay thế ảnh hiện tại khi ở chế độ chỉnh sửa.',
            position: 'right',
        },
        {
            element: '.detail-product-form__group-description-notes',
            intro: 'Tại đây bạn có thể cung cấp thêm <b>Thông tin mô tả & ghi chú</b> cho sản phẩm. (có thể để trống)',
            position: 'left',
        },
        {
            element: '.detail-product-form__label-nha-phan-phoi',
            intro: 'Chọn <b>Nhà phân phối</b>. Nếu là nhà phân phối mới, hãy chọn "Khác" để nhập thông tin liên hệ và địa chỉ.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-inputs',
            intro: 'Đây là nơi bạn có thể nhập thông tin cho một <b>Lô hàng mới</b>, bao gồm ngày nhập, ngày hết hạn (nếu có), và <b>Số lượng</b> nhập kho. <b>Giá vốn</b> sẽ được tự động lấy từ giá nhập của sản phẩm. <br>  <em>Lưu ý: <b>Ngày nhập</b> nếu không nhập sẽ tự động lấy ngày hiện tại, <b>Hạn sử dụng</b> nếu không nhập sẽ là sản phẩm không có hạn sử dụng, <b>Số lượng</b> bắt buộc nhập.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-actions > button:first-child',
            intro: 'Nhấn <b>Thêm lô hàng</b> để lưu lô hàng mới vừa nhập vào danh sách tồn kho của sản phẩm.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-actions > button:last-child',
            intro: 'Sử dụng nút này để chuyển sang chế độ <em>Sửa, xóa lô hàng</em>. Khi ở chế độ này, bạn có thể chọn các lô hàng trong danh sách bên dưới để xóa.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-list',
            intro: 'Đây là danh sách các <b>Lô hàng hiện có</b> của sản phẩm. Bạn có thể xem chi tiết từng lô tại đây.',
            position: 'left',
        },
        {
            element: 'button[type="submit"]',
            intro: 'Cuối cùng, khi bạn đã hoàn tất mọi chỉnh sửa, hãy nhấn <b>Lưu sản phẩm</b> để cập nhật thông tin và lô hàng vào hệ thống.',
            position: 'top',
        },
        {
            intro: 'Tuyệt vời! Bạn đã hoàn thành hướng dẫn. Bạn có thể xem các hướng dẫn chi tiết khác trong phần <em>Hướng dẫn chỉnh sửa sản phẩm</em> ở phía bên trái.',
        },
    ];

    const deleteProductSteps = [
        {
            intro: 'Đây là hướng dẫn tập trung vào <b>thao tác Xóa sản phẩm</b> khỏi hệ thống. Thao tác này là vĩnh viễn và cần cân nhắc kỹ. Ấn <em>Tiếp</em> để bắt đầu.',
        },
        {
            element: 'button.detail-product-form__button.detail-product-form__button--edit:nth-of-type(1)',
            intro: 'Để bắt đầu <b>Xóa sản phẩm</b> bạn cần nhấn nút <b>Chỉnh sửa</b> ở đây.',
            position: 'top',
        },
        {
            element: 'button.detail-product-form__button--delete',
            intro: 'Đây là nút <b>Xóa sản phẩm</b>. Bạn chỉ nên nhấn nút này khi đã chắc chắn muốn loại bỏ sản phẩm và tất cả lô hàng liên quan khỏi hệ thống.',
            position: 'top',
        },
        {
            element: 'button.detail-product-form__button--delete',
            intro: 'Sau khi nhấn <b>Xóa sản phẩm</b>, một hộp thoại xác nhận sẽ hiện ra. Bạn cần xác nhận lại một lần nữa để hoàn tất việc xóa. Hãy thận trọng!',
            position: 'top',
        },
        {
            intro: 'Hoàn tất hướng dẫn xóa sản phẩm. Nếu bạn cần xem thêm hướng dẫn chỉnh sửa chi tiết, hãy nhấn vào liên kết tương ứng.',
        },
    ];

    const batchManagementSteps = [
        {
            intro: 'Đây là hướng dẫn tập trung vào việc <b>Quản lý Tồn kho</b> (Thêm, sửa, xóa lô hàng) của sản phẩm này. Ấn <em>Tiếp</em> để bắt đầu.',
        },
        {
            element: 'button.detail-product-form__button.detail-product-form__button--edit:nth-of-type(1)',
            intro: 'Để bắt đầu <b>Quản lý Tồn kho</b> bạn cần nhấn nút <b>Chỉnh sửa</b> ở đây.',
            position: 'top',
        },
        {
            element: 'input[name="purchasePrice"]',
            intro: 'Đầu tiên, hãy đảm bảo <b>Giá nhập (Giá vốn)</b> của sản phẩm đã được thiết lập đúng. Giá này sẽ được áp dụng cho các lô hàng mới.',
        },
        {
            element: '.detail-product-form__batch-inputs',
            intro: 'Đây là khu vực để bạn thêm một <b>Lô hàng mới</b>. Bạn cần nhập Ngày nhập, Hạn sử dụng (nếu có), và <b>Số lượng</b> nhập kho. <br>  <em>Lưu ý: <b>Ngày nhập</b> nếu không nhập sẽ tự động lấy ngày hiện tại, <b>Hạn sử dụng</b> nếu không nhập sẽ là sản phẩm không có hạn sử dụng, <b>Số lượng</b> bắt buộc nhập.</em>',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-actions > button:first-child',
            intro: 'Sau khi nhập đầy đủ thông tin, nhấn <b>Thêm lô hàng</b> để lưu lô hàng mới vào danh sách tồn kho.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-actions > button:last-child',
            intro: 'Sử dụng nút này để chuyển sang <b>Chế độ Sửa, Xóa lô hàng</b>. Ở chế độ này, bạn có thể chọn các lô hàng bên dưới để xóa hoặc chỉnh sửa thông tin tồn kho.',
            position: 'left',
        },
        {
            element: '.detail-product-form__batch-list',
            intro: 'Danh sách này hiển thị <b>tất cả các Lô hàng hiện có</b> của sản phẩm. Khi ở chế độ Sửa/Xóa, bạn có thể tương tác với các mục ở đây.',
            position: 'left',
        },
        {
            element: 'button[type="submit"]',
            intro: 'Cuối cùng, khi bạn đã hoàn tất mọi chỉnh sửa, hãy nhấn <b>Lưu sản phẩm</b> để cập nhật thông tin và lô hàng vào hệ thống.',
            position: 'top',
        },
        {
            intro: 'Hoàn tất hướng dẫn quản lý tồn kho. Bạn có thể quay lại bất kỳ hướng dẫn nào khác khi cần.',
        },
    ];

    const onExit = () => {
        setStepsEnabled(false);
        localStorage.setItem('editProductTourSeen', 'true');
    };

    const startTour = () => {
        localStorage.removeItem('editProductTourSeen');
        setInitialStep(0);

        setStepsEnabled(false);
        setForceRenderKey((prevKey) => prevKey + 1);

        setTimeout(() => {
            setStepsEnabled(true);
        }, 150);
    };

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('editProductTourSeen');
        let timer;

        if (!hasSeenTour) {
            const timer = setTimeout(() => {
                setStepsEnabled(true);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, []);

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
            toast.warning('Vui lòng điền đầy đủ thông tin sản phẩm và lô hàng!');
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
            toast.success(result.message);
            navigate('/sanpham');
        } else {
            toast.error(result.message);
        }
    };

    const handleDeleteProduct = async () => {
        const confirmDelete = window.confirm(
            'Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác!',
        );
        if (!confirmDelete) return;

        const result = await deleteProduct(id);
        if (result.success) {
            toast.success(result.message);
            navigate('/sanpham');
        } else {
            toast.error(result.message);
        }
    };

    if (isLoading || error) {
        return (
            <StatusDisplaySpinner
                isLoading={isLoading}
                error={error}
                loadingText="Đang cập nhật thông tin sản phẩm..."
            />
        );
    }

    return (
        <>
            <Steps
                key={forceRenderKey}
                enabled={stepsEnabled}
                steps={steps}
                initialStep={initialStep}
                onExit={onExit}
                options={{
                    nextLabel: 'Tiếp >',
                    prevLabel: '< Quay lại',
                    skipLabel: 'Bỏ qua',
                    doneLabel: 'Hoàn thành',
                    hidePrev: true,
                    exitOnOverlayClick: false,
                    showProgress: true,
                    showBullets: true,
                }}
            />
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
                                    disabled={!isEditMode || product.barcode.startsWith('SKU_')}
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
                            <div className="detail-product-form__group-row">
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
                            </div>
                            <div className="detail-product-form__group">
                                <label className="detail-product-form__label--required">Trạng thái sản phẩm:</label>
                                <select
                                    className="detail-product-form__select"
                                    disabled={!isEditMode}
                                    required
                                    name="productStatus"
                                    value={product.productStatus}
                                    onChange={handleChange}
                                >
                                    <option value="">-- Chọn trạng thái --</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Ngừng kinh doanh</option>
                                    <option value="hidden">Ẩn sản phẩm</option>
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
                                                    accept=".png, .jpg, .jpeg"
                                                    onChange={handleImageChange}
                                                    style={{ cursor: isEditMode ? 'pointer' : 'not-allowed' }}
                                                />
                                                <div className="detail-product-form__file-name">
                                                    {product.image && (
                                                        <p>
                                                            File ảnh hiện tại: <b>{product.image}</b>
                                                        </p>
                                                    )}
                                                    {file && (
                                                        <p>
                                                            File ảnh mới đã chọn: <b>{file.name}</b>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="detail-product-form__guidelines">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    startTour();
                                                }}
                                            >
                                                Hướng dẫn chỉnh sửa sản phẩm
                                            </a>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    introJs()
                                                        .setOptions({
                                                            steps: deleteProductSteps,
                                                            nextLabel: 'Tiếp >',
                                                            prevLabel: '< Quay lại',
                                                            skipLabel: 'Bỏ qua',
                                                            doneLabel: 'Hoàn thành',
                                                            hidePrev: true,
                                                            exitOnOverlayClick: false,
                                                            showProgress: true,
                                                            showBullets: true,
                                                        })
                                                        .start();
                                                }}
                                            >
                                                Hướng dẫn xóa sản phẩm
                                            </a>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    introJs()
                                                        .setOptions({
                                                            steps: batchManagementSteps,
                                                            nextLabel: 'Tiếp >',
                                                            prevLabel: '< Quay lại',
                                                            skipLabel: 'Bỏ qua',
                                                            doneLabel: 'Hoàn thành',
                                                            hidePrev: true,
                                                            exitOnOverlayClick: false,
                                                            showProgress: true,
                                                            showBullets: true,
                                                        })
                                                        .start();
                                                }}
                                            >
                                                Hướng dẫn thêm hàng tồn kho (thêm, sửa, xóa lô hàng)
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-product-form__right">
                            <div className="detail-product-form__group-description-notes">
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
                            </div>

                            <div className="detail-product-form__group detail-product-form__label-nha-phan-phoi">
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
                                        className={classNames(
                                            'detail-product-form__button',
                                            {
                                                'detail-product-form__button--delete': deleteBatchMode,
                                            },
                                            'detail-product-form__button--edit',
                                        )}
                                        type="button"
                                        onClick={handleDeleteSelectedBatches}
                                    >
                                        {deleteBatchMode ? (
                                            selectedBatches.length > 0 ? (
                                                <>
                                                    <FaTrashAlt /> Xóa lô hàng đã chọn
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
                                                        disabled={!isEditMode}
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
                                    disabled={!isEditMode || deleteBatchMode}
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
        </>
    );
};
export default ProductDetail;
