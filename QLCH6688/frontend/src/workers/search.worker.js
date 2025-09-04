// // CỐ THỂ CẢI TIẾN KHÁC NHƯNG KHÔNG NÊN THAY includes VÌ LÀM MẤT TÍNH CHÍNH XÁC
// onmessage = function (event) {
//     const { searchTerm, productList } = event.data;

//     if (!searchTerm) {
//         postMessage([]);
//         return;
//     }

//     const lowerCaseSearchTerm = searchTerm.toLowerCase();
//     const isPriceSearch = !isNaN(Number(lowerCaseSearchTerm));
//     const numericSearchTerm = isPriceSearch ? Number(lowerCaseSearchTerm) : null;

//     const filteredSuggestions = productList.filter((item) => {
//         const nameMatch = item.name.toLowerCase().includes(lowerCaseSearchTerm);
//         const barcodeMatch = item.barcode && item.barcode.includes(lowerCaseSearchTerm);
//         const productCodeMatch = item.productCode && item.productCode.toLowerCase().includes(lowerCaseSearchTerm);
//         const priceMatch = isPriceSearch && item.sellingPrice === numericSearchTerm;

//         return nameMatch || barcodeMatch || productCodeMatch || priceMatch;
//     });

//     postMessage(filteredSuggestions);
// };

// src/workers/search.worker.js

onmessage = function (event) {
    const { searchTerm, productList } = event.data;

    if (!searchTerm) {
        postMessage([]);
        return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    // Kiểm tra nếu từ khóa bắt đầu bằng "SKU_"
    const isCustomBarcodeSearch = lowerCaseSearchTerm.startsWith('sku_');
    const customBarcode = isCustomBarcodeSearch ? lowerCaseSearchTerm.substring(4) : '';

    const isPriceSearch = !isNaN(Number(lowerCaseSearchTerm));
    const numericSearchTerm = isPriceSearch ? Number(lowerCaseSearchTerm) : null;

    const filteredSuggestions = productList.filter((item) => {
        // 1. Ưu tiên tìm kiếm theo barcode tùy chỉnh "SKU_..."
        if (isCustomBarcodeSearch) {
            return item.barcode && item.barcode.toLowerCase() === customBarcode;
        }

        // 2. Các logic tìm kiếm cũ vẫn hoạt động bình thường
        const nameMatch = item.name.toLowerCase().includes(lowerCaseSearchTerm);
        const barcodeMatch = item.barcode && item.barcode.toLowerCase().includes(lowerCaseSearchTerm);
        const productCodeMatch = item.productCode && item.productCode.toLowerCase().includes(lowerCaseSearchTerm);
        const priceMatch = isPriceSearch && item.sellingPrice === numericSearchTerm;

        return nameMatch || barcodeMatch || productCodeMatch || priceMatch;
    });

    postMessage(filteredSuggestions);
};
