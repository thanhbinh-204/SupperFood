const ModelProduct = require('./ModelProduct');
const ModelCategory = require('../categories/ModelCategory');
const ModelSupply = require('../supply/ModelSupply');
const mongoose = require('mongoose');



// page: trang hiện tại
// limit: số lượng sản phẩm trên 1 trang
// keyword: từ khóa tìm kiếm
const getAll = async (page = 1, limit = 10, keyword = '') => {
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        let query = {};
        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' }; // Tìm theo tên sản phẩm
        }

        const products = await ModelProduct.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ create_at: -1 });

        return products;
    } catch (error) {
        console.error('Lấy tất cả sản phẩm lỗi: ', error);
        throw new Error('Lấy tất cả sản phẩm lỗi');
    }
};

// Thêm sản phẩm
const insertDB = async (name, price, quantity, images, description, category, supplier) => {
    try {
        // Kiểm tra danh mục có tồn tại không
        const categoryDB = await ModelCategory.findById(category);
        if (!categoryDB) {
            throw new Error('Danh mục không tồn tại');
        }

        // Kiểm tra nhà cung cấp có tồn tại không
        const supplierDB = await ModelSupply.findById(supplier);
        if (!supplierDB) {
            throw new Error('Nhà cung cấp không tồn tại');
        }

        const product = new ModelProduct({
            name,
            price,
            quantity,
            images: images,
            description,
            category: {
                category_id: categoryDB._id,
                category_name: categoryDB.name,
            },
            supplier: {
                supplier_id: supplierDB._id,
                supplier_name: supplierDB.name,
            },
        });

        let result = await product.save();
        return result;
    } catch (error) {
        console.error('Thêm sản phẩm lỗi: ', error);
        throw new Error('Thêm sản phẩm lỗi');
    }
};

// Cập nhật sản phẩm theo id
const updateDB = async (id, name, price, quantity, images, description, category, supplier) => {
    try {
        // Kiểm tra sản phẩm có tồn tại không
        const productDB = await ModelProduct.findById(id);
        if (!productDB) {
            throw new Error('Sản phẩm không tồn tại');
        }

        // Kiểm tra danh mục có tồn tại không
        const categoryDB = await ModelCategory.findById(category);
        if (!categoryDB) {
            throw new Error('Danh mục không tồn tại');
        }

        // Kiểm tra nhà cung cấp có tồn tại không
        const supplierDB = await ModelSupply.findById(supplier);
        if (!supplierDB) {
            throw new Error('Nhà cung cấp không tồn tại');
        }

        // Cập nhật sản phẩm
        productDB.name = name || productDB.name;
        productDB.price = price || productDB.price;
        productDB.quantity = quantity || productDB.quantity;
        productDB.images = images || productDB.images;
        productDB.description = description || productDB.description;
        productDB.category = {
            category_id: categoryDB._id,
            category_name: categoryDB.name,
        };
        productDB.supplier = {
            supplier_id: supplierDB._id,
            supplier_name: supplierDB.name,
        };

        let result = await productDB.save();
        return result;
    } catch (error) {
        console.error('Cập nhật sản phẩm lỗi: ', error);
        throw new Error('Cập nhật sản phẩm lỗi');
    }
};

// Tìm sản phẩm theo tên
const findProduct = async (name) => {
    try {
        if (name) {
            const productDB = await ModelProduct.find({ name: { $regex: name, $options: 'i' } });
            return productDB;
        } else {
            throw new Error('Tên sản phẩm không được để trống');
        }
    } catch (error) {
        console.error('Tìm kiếm sản phẩm lỗi: ', error);
        throw new Error('Tìm kiếm sản phẩm lỗi');
    }
};


// Tìm sản phẩm theo id
const findProductID = async (id) => {
    try {
        const productDB = await ModelProduct.findById(id);
        if (!productDB) {
            throw new Error('Sản phẩm không tồn tại');
        }
        return productDB;
    } catch (error) {
        console.error('Tìm sản phẩm theo ID lỗi: ', error);
        throw new Error('Tìm sản phẩm theo ID lỗi');
    }
};

// Xóa sản phẩm
const remove = async (id) => {
    try {
        const productDB = await ModelProduct.findById(id);
        if (!productDB) {
            throw new Error('Sản phẩm không tồn tại');
        }

        let result = await ModelProduct.findByIdAndDelete(id);
        return result;
    } catch (error) {
        console.error('Xóa sản phẩm lỗi: ', error);
        throw new Error('Xóa sản phẩm lỗi');
    }
};

// Lấy sản phẩm tốt nhất (theo quantity)
const getBestProduct = async () => {
    try {
        const products = await ModelProduct.find({}, 'name price quantity')
            .sort({ quantity: -1 }) // Giảm dần
            .limit(10);
        return products;
    } catch (error) {
        console.error('Lấy sản phẩm tốt nhất lỗi', error);
        throw new Error('Lấy sản phẩm tốt nhất lỗi');
    }
};


// const findProductByCategory = async (categoryId) => {
//     try {
//         // Chuyển đổi categoryId thành ObjectId
//         const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

//         // Kiểm tra danh mục tồn tại
//         const cateDB = await ModelCategory.findById(categoryObjectId);
//         if (!cateDB) {
//             throw new Error('ID danh mục không tồn tại');
//         }

//         // Thực hiện tìm kiếm sản phẩm
//         const products = await ModelProduct.find({ 'category.category_id': categoryObjectId });
//         return products;
//     } catch (error) {
//         console.error('Tìm sản phẩm theo danh mục lỗi:', error.message);
//         throw new Error('Tìm sản phẩm theo danh mục lỗi');
//     }
// };

const findProductByCategory = async (categoryId) => {
    try {
        // Kiểm tra nếu categoryId là một ObjectId hợp lệ
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            throw new Error('ID danh mục không hợp lệ');
        }

        // Chuyển đổi categoryId thành ObjectId
        const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
        console.log('Category ObjectId:', categoryObjectId);

        // Kiểm tra danh mục tồn tại
        const cateDB = await ModelCategory.findById(categoryObjectId);
        console.log('Danh mục tìm thấy:', cateDB);
        if (!cateDB) {
            throw new Error('ID danh mục không tồn tại');
        }

        // Thực hiện tìm kiếm sản phẩm
        const products = await ModelProduct.find({ 'category.category_id': categoryObjectId });
        console.log('Sản phẩm tìm thấy:', products);
        return products;
    } catch (error) {
        console.error('Tìm sản phẩm theo danh mục lỗi:', error.message);
        throw new Error('Tìm sản phẩm theo danh mục lỗi');
    }
};



const insertData = async () => {
    try {
        // lấy danh mục
        const categories = await ModelCategory.find();
        const suppliers = await ModelSupply.find();

        // Kiểm tra nếu danh sách `categories` và `suppliers` không có dữ liệu
        if (categories.length === 0) {
            console.log("Không có danh mục nào trong database.");
            return;
        }
        if (suppliers.length === 0) {
            console.log("Không có nhà cung cấp nào trong database.");
            return;
        }

        for (let index = 0; index < 20; index++) {
            // random lay 1 nha cung cap va 1 danh muc ngau nhien
            const category = categories[Math.floor(Math.random() * categories.length)];
            const supply = suppliers[Math.floor(Math.random() * suppliers.length)];

            // kiem tra 
            if (!category._id || !supply._id) {
                console.log("Thiếu _id trong danh mục hoặc nhà cung cấp.");
                continue;
            }

            const product = new ModelProduct({
                name: `Hamberger ${index}`,
                price: 1000 * index,
                quantity: 100 * index,
                images: ['https://i.pinimg.com/736x/af/44/ca/af44cac3f891ce69ff2112264a8fde12.jpg'],
                description: `Description ${index}`,
                category: {
                    category_id: category._id,
                    category_name: category.name
                },
                supplier: {
                    supply_id: supply._id,
                    supply_name: supply.name
                }
            });
            await product.save();
        }
        console.log("Thêm dữ liệu thành công.");
    } catch (error) {
        console.error("Lỗi khi thêm dữ liệu:", error);
    }
}


module.exports = { getAll, insertData, insertDB, updateDB, remove, findProduct, findProductID, getBestProduct,findProductByCategory };