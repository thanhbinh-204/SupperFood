const ModelCart = require('./ModelCart');
const UserModal = require('../user/userModel');
const ModelProduct = require('../product/ModelProduct');


const addCart = async (user, products) => {
    try {
        const userInDB = await UserModal.findById(user);
        if (!userInDB) {
            throw new Error('Người dùng không tồn tại');
        }

        // kiểm tra products có phải là mảng hay không
        if (!Array.isArray(products)) {
            throw new Error('Sản phẩm phải là mảng');
        }

        let productsInCart = [];
        let total = 0;

        for (let index = 0; index < products.length; index++) {
            const item = products[index];
            const product = await ModelProduct.findById(item._id);
            if (!product) {
                throw new Error('Sản phẩm không tồn tại');
            }
            if (item.quantity > product.quantity) {
                throw new Error('Sản phẩm hết hàng');
            }

            if (isNaN(product.price) || isNaN(item.quantity)) {
                throw new Error('Giá hoặc số lượng sản phẩm không hợp lệ');
            }

            const productItem = {
                _id: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            };
            productsInCart.push(productItem);
            total += product.price * item.quantity;
        }

        if (isNaN(total)) {
            throw new Error('Tổng giá trị không hợp lệ');
        }

        // Tạo giỏ hàng mới
        const cart = new ModelCart({
            user: { _id: userInDB._id, name: userInDB.name },
            products: productsInCart,
            total,
        });

        const result = await cart.save();
        setTimeout(async () => {
            for (let index = 0; index < products.length; index++) {
                const item = products[index];
                const product = await ModelProduct.findById(item._id);
                product.quantity -= item.quantity;
                await product.save();
            }
        }, 0);

        return result;

    } catch (error) {
        console.log(error);
        throw new Error('Thêm vào giỏ hàng thất bại');
    }
}


const getCarts = async (status, user) => {
    try {
        let query = {};
        if (status) {
            query.status = status;
        }
        if (user) {
            query.user = user;
        }
        const carts = await ModelCart
            .find(query)
            .sort({ date: -1 });

        return carts;

    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}

const getCartByUserId = async (userId) => {
    try {
        const cart = await ModelCart.findOne({ userId: userId });
        return cart;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm giỏ hàng: ', error);
        throw error;
    }
};

const updateStatus = async (idCart, updateData) => {
    try {
        const cartInDB = await ModelCart.findByIdAndUpdate(
            idCart,
            { $set: updateData },
            { new: true }
        );
        return cartInDB;
    } catch (error) {
        console.log(error);
        throw new Error('Cập nhật tình trạng đơn hàng lỗi');
    }
};

module.exports = { addCart, getCarts,getCartByUserId,updateStatus };