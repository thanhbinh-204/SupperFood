const express = require('express');
const router = express.Router();
const ControllerFeedback = require('../controllers/feedback/ControllerFeedback');

// đánh giá sản phẩm
router.post('/addFeedback', async (req, res) => {
    const { user, content, rating, productId } = req.body;
    try {
        const result = await ControllerFeedback.addFeedback(user, content, rating, productId);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

// hiển thị đánh giá của sản phẩm
router.get('/getfeedbacks/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await ControllerFeedback.getFeedbacksByProductId(productId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ status: false, message: error.message });
    }
});

module.exports = router;
