var express = require('express');
var router = express.Router();
const ControllerVoucher = require('../controllers/voucher/ControllerVoucher');

//http://localhost:8080//vouchers

router.post('/createVoucher', async (req, res) => {
    const { code, description, discountValue, minimumOrder, usageLimit, startDate, endDate } = req.body;
    try {
        const result = await ControllerVoucher.createVoucher(code, description, discountValue, minimumOrder, usageLimit, startDate, endDate);
        res.status(200).json({ status: true, result });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});


router.post('/claimVoucher', async (req, res) => {
    try {
        const { user, voucherCode } = req.body;
        const result = await ControllerVoucher.claimVoucher(user, voucherCode);
        res.status(200).json({ status: true, result });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});

router.post('/useVoucher', async (req, res) => {
    try {
        const { user, voucherCode } = req.body;
        const result = await ControllerVoucher.useVoucher(user, voucherCode);
        res.status(200).json({ status: true, result });
    } catch (error) {
        res.status(400).json({ status: false, message: error.message });
    }
});

module.exports = router;