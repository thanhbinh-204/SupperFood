const ModelCategory = require('./ModelCategory');

// get neu co va add neu khong co danh muc 
const getCategories = async (page, limit, keyword) => {
    try {
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let skip = (page - 1) * limit;
        let sort = { create_at: -1 }; // 1: tăng dần, -1: giảm dần
    
        // query: điều kiện tìm kiếm
        let query = {};
        if (keyword) {
            query.name = { $regex: keyword, $options: 'i' }; // tìm kiếm theo tên
        }
    
        let categories = await ModelCategory.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sort);
    
        // Thêm danh mục nếu không có
        if (categories.length === 0) {
            console.log("Không có danh mục nào, thêm danh mục mẫu...");
            const sampleCategories = [
                { name: "Hamberger" },
                { name: "Nước Ngọt" },
                { name: "Kem" },
                { name: "Pizza" },
                { name: "Bánh ngọt" },
                { name: "Gà giòn" }
            ];
            await ModelCategory.insertMany(sampleCategories);
            categories = await ModelCategory.find(query)
                .skip(skip)
                .limit(limit)
                .sort(sort);
        }
    
        return categories;
    
    } catch (error) {
        // Ghi lại thông tin lỗi chi tiết
        console.error('Lấy tất cả danh mục lỗi:', {
            message: error.message,
            stack: error.stack,
            additionalInfo: {
                page,
                limit,
                keyword,
            },
        });
    
        // Ném lỗi để xử lý ở cấp cao hơn nếu cần
        throw new Error('Lấy tất cả danh mục lỗi');
    }
    
};

module.exports ={getCategories}