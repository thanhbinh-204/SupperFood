var express = require('express');
var router = express.Router();
const ControllerCategories = require('../controllers/categories/ControllerCategories');

//http://localhost:8080/categories?page=1&limit=5&keyword=example
router.get('/getallcate', async function (req, res) {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const keyword = req.query.keyword || '';

        const categories = await ControllerCategories.getCategories(page, limit, keyword);

        console.log(`[INFO] (${new Date().toISOString()}) GET /getallcate - Success: Fetched categories`);
        return res.status(200).json({ status: true, data: categories });
    } catch (error) {
        // Log lỗi chi tiết
        console.error(`[ERROR] (${new Date().toISOString()}) GET /getallcate - Error:`, {
            message: error.message,
            stack: error.stack,
            query: req.query,
        });

        return res.status(500).json({ status: false, error: 'Lỗi khi lấy danh mục' });
    }
});

module.exports = router;
