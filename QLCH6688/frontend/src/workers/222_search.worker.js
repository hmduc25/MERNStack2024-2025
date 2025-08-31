// src/workers/search.worker.js
// PHÙ HỢP HƠN CHO VIỆC HIỂN THỊ SẢN PHẨM RA TRANG WEB

let productList = [];
let productIndex = {};

/**
 * Xây dựng chỉ mục (index) cho việc tìm kiếm nhanh.
 * Dữ liệu được ánh xạ từ từ khóa tìm kiếm đến sản phẩm tương ứng.
 */
function buildIndex(products) {
    const index = {
        name: {},
        productCode: {},
        barcode: {},
    };

    products.forEach((product) => {
        // Index theo tên sản phẩm
        const nameKeywords = product.name.toLowerCase().split(/\s+/).filter(Boolean);
        nameKeywords.forEach((keyword) => {
            if (!index.name[keyword]) index.name[keyword] = new Set();
            index.name[keyword].add(product);
        });

        // Index theo Mã hàng
        if (product.productCode) {
            const code = product.productCode.toLowerCase();
            if (!index.productCode[code]) index.productCode[code] = new Set();
            index.productCode[code].add(product);
        }

        // Index theo Mã vạch
        if (product.barcode) {
            const barcode = product.barcode.toLowerCase();
            if (!index.barcode[barcode]) index.barcode[barcode] = new Set();
            index.barcode[barcode].add(product);
        }
    });

    return index;
}

/**
 * Xử lý các thông điệp gửi đến từ luồng chính.
 * 'init': Khởi tạo dữ liệu và xây dựng chỉ mục.
 * 'search': Thực hiện tìm kiếm dựa trên chỉ mục đã có.
 */
onmessage = function (event) {
    const { type, searchTerm, productList: initialList } = event.data;

    if (type === 'init') {
        productList = initialList;
        productIndex = buildIndex(productList);
        return;
    }

    if (type === 'search') {
        if (!searchTerm) {
            postMessage([]);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const results = new Set();

        // Tìm kiếm theo tên (dựa trên các từ khóa trong index)
        const nameKeywords = lowerCaseSearchTerm.split(/\s+/).filter(Boolean);
        nameKeywords.forEach((keyword) => {
            for (const key in productIndex.name) {
                if (key.includes(keyword)) {
                    productIndex.name[key].forEach((product) => results.add(product));
                }
            }
        });

        // Tìm kiếm theo Mã hàng
        if (productIndex.productCode[lowerCaseSearchTerm]) {
            productIndex.productCode[lowerCaseSearchTerm].forEach((product) => results.add(product));
        }

        // Tìm kiếm theo Mã vạch
        if (productIndex.barcode[lowerCaseSearchTerm]) {
            productIndex.barcode[lowerCaseSearchTerm].forEach((product) => results.add(product));
        }

        // Tìm kiếm theo Giá
        if (!isNaN(Number(lowerCaseSearchTerm))) {
            const numericSearchTerm = Number(lowerCaseSearchTerm);
            productList.forEach((item) => {
                if (item.sellingPrice === numericSearchTerm) {
                    results.add(item);
                }
            });
        }

        const finalResults = Array.from(results);
        // Giới hạn số lượng kết quả trả về để tối ưu hiệu suất render
        const limitedSuggestions = finalResults.slice(0, 20);
        postMessage(limitedSuggestions);
    }
};
