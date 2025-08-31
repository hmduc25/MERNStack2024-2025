// CỐ THỂ CẢI TIẾN KHÁC NHƯNG KHÔNG NÊN THAY includes VÌ LÀM MẤT TÍNH CHÍNH XÁC
onmessage = function (event) {
    const { searchTerm, productList } = event.data;

    if (!searchTerm) {
        postMessage([]);
        return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const isPriceSearch = !isNaN(Number(lowerCaseSearchTerm));
    const numericSearchTerm = isPriceSearch ? Number(lowerCaseSearchTerm) : null;

    const filteredSuggestions = productList.filter((item) => {
        const nameMatch = item.name.toLowerCase().includes(lowerCaseSearchTerm);
        const barcodeMatch = item.barcode && item.barcode.includes(lowerCaseSearchTerm);
        const productCodeMatch = item.productCode && item.productCode.toLowerCase().includes(lowerCaseSearchTerm);
        const priceMatch = isPriceSearch && item.sellingPrice === numericSearchTerm;

        return nameMatch || barcodeMatch || productCodeMatch || priceMatch;
    });

    postMessage(filteredSuggestions);
};
