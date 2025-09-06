import { connectDB } from './config/database.js';
import Product from './models/productModel.js';

// Ánh xạ từ giá trị value cũ sang giá trị value mới
const unitMapping = {
    baogoi: 'bao_tui_goi',
    tuigoi: 'bao_tui_goi',
    chailo: 'chai_lo',
    chai: 'chai_lo',
    lo: 'chai_lo',
    hopbat: 'hop_ly_bat',
    hoply: 'hop_ly_bat',
    hop: 'hop_ly_bat',
    vicoc: 'vi_coc',
    other: 'khac',
};

const updateUnits = async () => {
    try {
        await connectDB();
        console.log('Bắt đầu cập nhật các giá trị "unit"...');

        // Lấy tất cả các giá trị cũ cần thay đổi
        const oldUnits = Object.keys(unitMapping);

        // Tạo một mảng các trường hợp cho $switch
        const branches = Object.entries(unitMapping).map(([oldValue, newValue]) => ({
            case: { $eq: ['$unit', oldValue] },
            then: newValue,
        }));

        // Thêm trường hợp mặc định là 'khac' cho các giá trị không khớp
        branches.push({ case: { $not: { $in: ['$unit', Object.values(unitMapping)] } }, then: 'khac' });

        const result = await Product.updateMany(
            {}, // Cập nhật tất cả các documents
            [
                {
                    $set: {
                        unit: {
                            $switch: {
                                branches: branches,
                                default: 'khac', // Dùng 'khac' làm giá trị mặc định cho những trường hợp không khớp với unit cũ
                            },
                        },
                    },
                },
            ],
        );

        console.log(`Đã cập nhật ${result.modifiedCount} sản phẩm.`);
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
    } finally {
        process.exit();
    }
};

updateUnits();
