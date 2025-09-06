import { connectDB } from './config/database.js'; // Đường dẫn tới file kết nối DB của bạn
import Product from './models/productModel.js'; // Đường dẫn tới model sản phẩm của bạn
import mongoose from 'mongoose';

// Danh sách các brand cũ và brand mới tương ứng
const BRAND_MAP = {
    chinsu: 'masan',
    trangan168: 'vifon',
    barona: 'masan',
    knorr: 'unilever',
    vissanmaivang: 'masan',
    tuongan: 'masan',
    meizan: 'masan',
    miwon: 'ajinomoto',
    hi5fineday: 'vifon',
    orion: 'ajinomoto',
    omo: 'unilever',
};

const updateBrands = async () => {
    try {
        await connectDB();
        console.log('Bắt đầu cập nhật các brand sản phẩm...');

        // Dữ liệu sản phẩm bạn đã cung cấp
        const productsToUpdate = [
            {
                productId: '6747f914c8891dc803c98a17',
                productCode: 'SP000034',
                barcode: '8936136167923',
                brand: 'chinsu',
            },
            {
                productId: '67486e6ec8891dc803c99d98',
                productCode: 'SP000048',
                barcode: '8936221042272',
                brand: 'chinsu',
            },
            {
                productId: '67556d237d588fa28c0fa59b',
                productCode: 'SP000080',
                barcode: '8936017364113',
                brand: 'chinsu',
            },
            {
                productId: '67556e747d588fa28c0fa7c4',
                productCode: 'SP000081',
                barcode: '8936136161150',
                brand: 'chinsu',
            },
            {
                productId: '675570787d588fa28c0fa997',
                productCode: 'SP000082',
                barcode: '8936136163932',
                brand: 'chinsu',
            },
            {
                productId: '6755884c7d588fa28c0fb8a5',
                productCode: 'SP000088',
                barcode: '8936136168425',
                brand: 'chinsu',
            },
            {
                productId: '675d3c0ffaf88c546252f272',
                productCode: 'SP000096',
                barcode: '8936136163307',
                brand: 'chinsu',
            },
            {
                productId: '675d3d87faf88c546252f5d4',
                productCode: 'SP000097',
                barcode: '8936136163314',
                brand: 'chinsu',
            },
            {
                productId: '675d3fe5faf88c546252f785',
                productCode: 'SP000098',
                barcode: '8936017366605',
                brand: 'chinsu',
            },
            {
                productId: '675d40fafaf88c546252f8cd',
                productCode: 'SP000099',
                barcode: '8936017369231',
                brand: 'chinsu',
            },
            {
                productId: '675d437afaf88c546252faf3',
                productCode: 'SP000100',
                barcode: '8936186710025',
                brand: 'trangan168',
            },
            {
                productId: '675d4634faf88c546252fee7',
                productCode: 'SP000101',
                barcode: '8936136168487',
                brand: 'chinsu',
            },
            {
                productId: '675d4910faf88c5462530187',
                productCode: 'SP000102',
                barcode: '8936028040716',
                brand: 'barona',
            },
            {
                productId: '675d4a41faf88c54625303bd',
                productCode: 'SP000103',
                barcode: '8936028044356',
                brand: 'barona',
            },
            {
                productId: '675d4d3ffaf88c5462530670',
                productCode: 'SP000104',
                barcode: '8936028040426',
                brand: 'barona',
            },
            {
                productId: '675d4e37faf88c54625308b1',
                productCode: 'SP000105',
                barcode: '8936028044738',
                brand: 'barona',
            },
            {
                productId: '675e4d90fd34b6d08c993f36',
                productCode: 'SP000107',
                barcode: '8934707010968',
                brand: 'knorr',
            },
            {
                productId: '675e5165fd34b6d08c994201',
                productCode: 'SP000108',
                barcode: '8934572135001',
                brand: 'vissanmaivang',
            },
            {
                productId: '675e52b9fd34b6d08c9943dd',
                productCode: 'SP000109',
                barcode: '8934572045010',
                brand: 'vissanmaivang',
            },
            {
                productId: '675e60d0fd34b6d08c99490a',
                productCode: 'SP000111',
                barcode: '8934572016010',
                brand: 'vissanmaivang',
            },
            {
                productId: '675e62dcfd34b6d08c994af2',
                productCode: 'SP000112',
                barcode: '8934572046017',
                brand: 'vissanmaivang',
            },
            {
                productId: '675e7a99fd34b6d08c994d5c',
                productCode: 'SP000113',
                barcode: '8936035101097',
                brand: 'tuongan',
            },
            {
                productId: '675e7c2efd34b6d08c995046',
                productCode: 'SP000114',
                barcode: '8936035100571',
                brand: 'tuongan',
            },
            {
                productId: '675e81a3fd34b6d08c995e0f',
                productCode: 'SP000117',
                barcode: '8936035101110',
                brand: 'tuongan',
            },
            {
                productId: '675e83dbfd34b6d08c996115',
                productCode: 'SP000118',
                barcode: '8934988063028',
                brand: 'meizan',
            },
            {
                productId: '675e8481fd34b6d08c99631a',
                productCode: 'SP000119',
                barcode: '8936035100311',
                brand: 'tuongan',
            },
            {
                productId: '675e89c5fd34b6d08c996bd8',
                productCode: 'SP000123',
                barcode: '8936035100328',
                brand: 'tuongan',
            },
            {
                productId: '675ffa326fc60cc30c00fbf2',
                productCode: 'SP000128',
                barcode: '8936136161648',
                brand: 'chinsu',
            },
            {
                productId: '676549ed84a715c428beaa92',
                productCode: 'SP000132',
                barcode: '8935036200235',
                brand: 'miwon',
            },
            {
                productId: '67654b0384a715c428beadee',
                productCode: 'SP000133',
                barcode: '8935036200167',
                brand: 'miwon',
            },
            {
                productId: '676552c184a715c428beb302',
                productCode: 'SP000134',
                barcode: '8935036200099',
                brand: 'miwon',
            },
            {
                productId: '6767d39c42196dd482ebc594',
                productCode: 'SP000148',
                barcode: '8936090580288',
                brand: 'hi5fineday',
            },
            {
                productId: '6767df4142196dd482ebcbd5',
                productCode: 'SP000150',
                barcode: '8936036028621',
                brand: 'orion',
            },
            {
                productId: '6767e26d42196dd482ebd225',
                productCode: 'SP000151',
                barcode: '8936036028461',
                brand: 'orion',
            },
            {
                productId: '6767e3f742196dd482ebd5f1',
                productCode: 'SP000152',
                barcode: '8936036029697',
                brand: 'orion',
            },
            {
                productId: '6767e4ce42196dd482ebd7db',
                productCode: 'SP000153',
                barcode: '8936036020380',
                brand: 'orion',
            },
            {
                productId: '6767e66a42196dd482ebdb14',
                productCode: 'SP000154',
                barcode: '8936036020137',
                brand: 'orion',
            },
            {
                productId: '6768038042196dd482ebf579',
                productCode: 'SP000162',
                barcode: '8936036022872',
                brand: 'orion',
            },
            {
                productId: '677a55b0382e77827ea6cffd',
                productCode: 'SP000213',
                barcode: '8936036026191',
                brand: 'orion',
            },
            {
                productId: '677a5727382e77827ea6d463',
                productCode: 'SP000214',
                barcode: '8936036026177',
                brand: 'orion',
            },
            {
                productId: '677a57f3382e77827ea6d70a',
                productCode: 'SP000215',
                barcode: '8936036028843',
                brand: 'orion',
            },
            {
                productId: '677a71af382e77827ea6f226',
                productCode: 'SP000223',
                barcode: '8936036025170',
                brand: 'orion',
            },
            {
                productId: '6785f591f29167156306d9f4',
                productCode: 'SP000235',
                barcode: '8853002316134',
                brand: 'orion',
            },
            {
                productId: '678dbf07634cf63caaeaa65c',
                productCode: 'SP000245',
                barcode: '8853002316196',
                brand: 'orion',
            },
            {
                productId: '6795c71811581ca2b44e8b96',
                productCode: 'SP000260',
                barcode: '8936090580752',
                brand: 'hi5fineday',
            },
            {
                productId: '6795cc1911581ca2b44e9750',
                productCode: 'SP000262',
                barcode: '8936090581230',
                brand: 'hi5fineday',
            },
            {
                productId: '6795ccf411581ca2b44e9b99',
                productCode: 'SP000263',
                barcode: '8936090580295',
                brand: 'hi5fineday',
            },
            {
                productId: '6795d9bd11581ca2b44eae07',
                productCode: 'SP000268',
                barcode: '8936090580639',
                brand: 'hi5fineday',
            },
            {
                productId: '6795da3f11581ca2b44eb267',
                productCode: 'SP000269',
                barcode: '8936090580622',
                brand: 'hi5fineday',
            },
            {
                productId: '6795dacb11581ca2b44eb5b3',
                productCode: 'SP000270',
                barcode: '8936090589991',
                brand: 'hi5fineday',
            },
            {
                productId: '6795df9f11581ca2b44ebb34',
                productCode: 'SP000271',
                barcode: '8936090580677',
                brand: 'hi5fineday',
            },
            {
                productId: '67960e8d11581ca2b44ed065',
                productCode: 'SP000276',
                barcode: '8936090580165',
                brand: 'hi5fineday',
            },
            {
                productId: '67960f5711581ca2b44eda82',
                productCode: 'SP000277',
                barcode: '8936090580462',
                brand: 'hi5fineday',
            },
            {
                productId: '6797627411581ca2b44f19bb',
                productCode: 'SP000289',
                barcode: '8936090580035',
                brand: 'hi5fineday',
            },
            {
                productId: '679764b011581ca2b44f1d43',
                productCode: 'SP000290',
                barcode: '8936090581322',
                brand: 'hi5fineday',
            },
            {
                productId: '6797657011581ca2b44f20ce',
                productCode: 'SP000291',
                barcode: '8936090581353',
                brand: 'hi5fineday',
            },
            {
                productId: '679765d511581ca2b44f245c',
                productCode: 'SP000292',
                barcode: '8936090581339',
                brand: 'hi5fineday',
            },
            {
                productId: '6797746b11581ca2b44f4988',
                productCode: 'SP000299',
                barcode: '8936090589885',
                brand: 'hi5fineday',
            },
            { productId: '6797752f11581ca2b44f4d2e', productCode: 'SP000300', barcode: '8934868169550', brand: 'omo' },
            { productId: '679775ac11581ca2b44f50d7', productCode: 'SP000301', barcode: '8934868169543', brand: 'omo' },
            {
                productId: '68b5c39e0269cd43d3873a85',
                productCode: 'SP000328',
                barcode: '8938508191397',
                brand: 'orion',
            },
        ];

        // Lặp qua từng sản phẩm trong mảng
        for (const product of productsToUpdate) {
            const { productId, brand } = product;
            const newBrand = BRAND_MAP[brand]; // Lấy brand mới từ mapping

            if (newBrand) {
                // Sử dụng findByIdAndUpdate để tìm và cập nhật
                await Product.findByIdAndUpdate(
                    productId,
                    { $set: { brand: newBrand } },
                    { new: true }, // Trả về tài liệu đã được cập nhật
                );
                console.log(`Đã cập nhật sản phẩm ${productId} từ brand '${brand}' sang '${newBrand}'.`);
            } else {
                console.warn(`Không tìm thấy brand mới cho sản phẩm ${productId} với brand cũ '${brand}'. Bỏ qua.`);
            }
        }
        console.log('Hoàn thành việc cập nhật brand cho các sản phẩm.');
    } catch (error) {
        console.error('Lỗi khi cập nhật dữ liệu:', error);
    } finally {
        // Đóng kết nối DB
        mongoose.connection.close();
        console.log('Đã đóng kết nối cơ sở dữ liệu.');
    }
};

updateBrands();
