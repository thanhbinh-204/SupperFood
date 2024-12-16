const Feedback = require('../feedback/ModelFeedback');
const Product = require('../product/ModelProduct');
const User = require('../user/userModel')

// Đánh giá sản phẩm
const addFeedback = async (user, content, rating, productId) => {
    try {
        const userId = await User.findById(user);
        if (!userId) {
            throw new Error('Người dùng không tồn tại');
        }

        // Kiểm tra các trường bắt buộc
        if (!userId || !content || rating === undefined || !productId) {
            throw new Error('Tất cả các trường là bắt buộc.');
        }

        // kiểm tra người dùng đã đánh giá sản phẩm này hay chưa
        const existingFeedback = await Feedback.findOne({
            'user.id': userId,  
            productId: productId 
        });
        
        if (existingFeedback) {
            throw new Error('Người dùng đã đánh giá cho sản phẩm.');
        }

        

        // Tạo một đánh giá mới
        const newFeedback = new Feedback({
            user: { id: user, name: userId.username },
            content,
            rating,
            productId: productId 
        });

        // Lưu đánh giá vào cơ sở dữ liệu
        const savedFeedback = await newFeedback.save();

        // Cập nhật sản phẩm với ID của đánh giá mới
        await Product.findByIdAndUpdate(
            productId,
            { $push: { feedbacks: savedFeedback._id } },
            { new: true }
        );

        return {
            status: true,
            message: "Đánh giá đã được thêm thành công.",
            feedback: savedFeedback, // Trả về phản hồi đã lưu

        };
    } catch (error) {
        console.error(error);
        throw new Error('Lỗi khi thêm đánh giá.');
    }
};

// Hiển thị tất cả đánh giá của một sản phẩm
const getFeedbacksByProductId = async (productId) => {
    try {

        const product = await Product.findById(productId).populate('feedbacks');

        if (!product) {
            throw new Error('Sản phẩm không tồn tại.');
        }

        return { status: true, feedbacks: product.feedbacks };
    } catch (error) {
        console.error(error);
        throw new Error('Lỗi khi lấy đánh giá.');
    }
};

// Xuất các hàm controller
module.exports = { addFeedback, getFeedbacksByProductId };
