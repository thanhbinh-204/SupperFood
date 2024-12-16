var express = require('express');
var router = express.Router();
const ControllerCart = require('../controllers/carts/ControllerCart');

// Thêm giỏ hàng mới
// method : POST
// body: { user, products }
// url: http://localhost:8080/carts
// return: { _id, user, product, total, status, date }
router.post('/', async (req, res, next) => {
    try {
        const { user, products } = req.body;
        const result = await ControllerCart.addCart(user, products);

        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(400).json({ status: false, data: error.message });
    }
})

// Get giỏ hàng
// method : get
// body: { user, products }
// url: http://localhost:8080/carts
// return: { _id, user, product, total, status, date }
router.get('/', async (req, res, next) => {
    try {
        const { user, products } = req.body;
        const result = await ControllerCart.getCarts(user, products);

        return res.status(200).json({ status: true, data: result });
    } catch (error) {
        return res.status(400).json({ status: false, data: error.message });
    }
})


//gio hang theo id user
// router.get('/user/:id', async (req, res) => {
//     console.log('Received request for user ID: ', req.params.id);
//     try {
//         const userId = req.params._id;
//         const cart = await ControllerCart.getCartByUserId(userId);
//         if (!cart) {
//             return res.status(404).json({ status: false, message: 'Không tìm thấy giỏ hàng cho người dùng này!' });
//         }
//         return res.status(200).json({ status: true, data: cart });
//     } catch (error) {
//         console.error('Lỗi khi lấy giỏ hàng: ', error);
//         return res.status(500).json({ status: false, error: error.message });
//     }
// });

router.get('/user/:id', async (req, res) => {
    try {
        const userId = req.params._id;
        const cart = await ControllerCart.getCartByUserId(userId);
        if (!cart) {
            return res.status(404).json({ status: false, message: 'Không tìm thấy giỏ hàng cho người dùng này!' });
        }
        return res.status(200).json({ status: true, data: cart ,message: 'len gio hang' });
    } catch (error) {
        console.error('Lỗi khi lấy giỏ hàng: ', error);
        return res.status(500).json({ status: false, error: error.message });
    }
});

router.put('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Lấy trạng thái mới từ body
        const updatedCart = await ControllerCart.updateStatus(id, { status });
        if (!updatedCart) {
            return res.status(404).json({ status: false, error: 'Giỏ hàng không tồn tại' });
        }
        return res.status(200).json({ status: true, data: updatedCart });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái giỏ hàng:', error.message);
        return res.status(500).json({ status: false, error: 'Lỗi khi cập nhật trạng thái giỏ hàng' });
    }
});

router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Lấy trạng thái mới từ body
        const updatedCart = await ControllerCart.updateStatus(id, { status });
        if (!updatedCart) {
            return res.status(404).json({ status: false, error: 'Giỏ hàng không tồn tại' });
        }
        return res.status(200).json({ status: true, data: updatedCart });
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error.message);
        return res.status(500).json({ status: false, error: 'Lỗi' });
    }
});


module.exports = router;