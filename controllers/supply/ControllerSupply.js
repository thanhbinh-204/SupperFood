const Supplier = require('../supply/ModelSupply'); 

const addSupplier = async (name) => {
    if (!name) {
        throw new Error('Tên nhà cung cấp là bắt buộc.');
    }

    const newSupplier = new Supplier({ name });
    return await newSupplier.save();
};

// Cập nhật nhà cung cấp
const updateSupplier = async (id, name) => {
    if (!name) {
        throw new Error('Tên nhà cung cấp là bắt buộc.');
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
        id,
        { name, update_at: Date.now() },
        { new: true }
    );

    if (!updatedSupplier) {
        throw new Error('Nhà cung cấp không tồn tại.');
    }

    return updatedSupplier;
};

// Xóa nhà cung cấp
const deleteSupplier = async (id) => {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);

    if (!deletedSupplier) {
        throw new Error('Nhà cung cấp không tồn tại.');
    }

    return { message: 'Nhà cung cấp đã được xóa thành công.' };
};


module.exports = { addSupplier, updateSupplier, deleteSupplier };
