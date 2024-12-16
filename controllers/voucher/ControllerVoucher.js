const Voucher = require('../voucher/ModelVoucher');
const UserModel = require('../user/userModel');

const createVoucher = async (code, description, discountValue, minimumOrder, usageLimit, startDate, endDate) => {
    // Kiểm tra xem code đã tồn tại chưa
    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
        throw new Error('Voucher code đã tồn tại.');
    }

    // Tạo voucher mới
    const newVoucher = new Voucher({
        code,
        description,
        discountValue,
        minimumOrder,
        usageLimit,
        startDate,
        endDate,
        status: 'active'
    });

    await newVoucher.save();
    return { message: 'Tạo Voucher thành công', voucher: newVoucher };
};

const claimVoucher = async (user, voucherCode) => {
    try {
        const userInDB = await UserModel.findById(user);
        if (!userInDB) {
            throw new Error('Người dùng không tồn tại');
        }
        

        // Tìm voucher theo code
        const voucher = await Voucher.findOne({ code: voucherCode });
        if (!voucher) {
            throw new Error('Voucher không tìm thấy.');
        }

        // Kiểm tra nếu người dùng đã có voucher này
        if (userInDB.vouchers && userInDB.vouchers.includes(voucher._id)) {
            throw new Error('Người dùng đã lấy Voucher này rồi.');
        }

        const currentDate = new Date();
        if (currentDate < voucher.startDate || currentDate > voucher.endDate || voucher.status !== 'active') {
            throw new Error('Voucher không có hiệu lực hoặc đã hết hạn.');
        }

        if (voucher.usageLimit <= voucher.usedCount) {
            throw new Error('Voucher đã đến giới hạn sử dụng.');
        }

        // Thêm voucher vào danh sách của người dùng và tăng số lượng sử dụng
        if (!userInDB.vouchers) userInDB.vouchers = []; // Đảm bảo vouchers là mảng
        userInDB.vouchers.push({ voucherId: voucher._id, VoucherCode: voucher.code });
        await userInDB.save();

        await voucher.save();

        return { message: 'Voucher claimed successfully', voucher };
    } catch (error) {
        console.log('Claim Voucher Error:', error.message);
        throw new Error(error.message);
    }
};

const useVoucher = async ( user, voucherCode ) => {
    const userId = await UserModel.findById(user); 
    if (!userId) {
        throw new Error('Người dùng không tồn tại.');
    }

    const voucher = await Voucher.findOne({ code: voucherCode });
    if (!voucher) {
        throw new Error('Voucher không tìm thấy.');
    }

    if (!userId.vouchers.includes(voucher._id.toString())) {
        throw new Error('Người dùng chưa sở hữu Voucher này.');
    }

    const currentDate = new Date();
    if (currentDate < voucher.startDate || currentDate > voucher.endDate || voucher.status !== 'active') {
        throw new Error('Voucher không có hiệu lực hoặc đã hết hạn.');
    }

    if (voucher.usageLimit <= voucher.usedCount) {
        throw new Error('Voucher đã hết số lần sử dụng.');
    }

    // Xóa voucher khỏi danh sách của người dùng
    userId.vouchers = userId.vouchers.filter(id => id.toString() !== voucher._id.toString());

    // Cập nhật số lần sử dụng voucher
    voucher.usedCount += 1;

    // Lưu thay đổi cho người dùng và voucher
    await Promise.all([userId.save(), voucher.save()]);

    return { message: 'Voucher đã được sử dụng và xóa khỏi danh sách của người dùng thành công', voucher };
};

module.exports = { createVoucher, claimVoucher, useVoucher };
