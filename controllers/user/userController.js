const { now } = require('mongoose');
const userModel = require('../user/userModel');
const bcrypt = require('bcryptjs');
const { sendOTP,sendNewPassword } = require('../../util/mailer');
const randomstring = require("randomstring");


// Register:
// 1: Nhận dữ liệu (username, password, email) từ user.js
// 2: kiểm tra dữ liệu đầu vào (validate)
// 3: Nếu ok thì sẽ tạo account --> trả acc cho user.js
// 4: Nếu không ok thì trả lỗi

const register = async (email, password, username) => {
    try {
        // Kiểm tra xem email có tồn tại không
        let user = await userModel.findOne({ email });
        if (user) {
            throw new Error('Email đã tồn tại');
        }

        // Mã hóa mật khẩu
        const salt = bcrypt.genSaltSync(10);
        password = bcrypt.hashSync(password, salt);

        // Tạo mã OTP
        const otp = randomstring.generate({ length: 4, charset: 'numeric' });

        // Gửi OTP qua email
        await sendOTP(email, otp);

        // Tạo user với trạng thái chưa xác minh và lưu OTP vào database
        user = new userModel({ email, password, username, otp, verified: false });
        const result = await user.save();
        
        return result;
    } catch (error) {
        console.log('Register error:', error.message);
        throw new Error(error.message);
    }
};

// Hàm xác minh OTP
const verifyOTP = async (email, otp) => {
    try {
        // Tìm user với email và otp
        const user = await userModel.findOne({ email, otp });
        if (!user) {
            throw new Error('OTP không đúng hoặc tài khoản không tồn tại');
        }

        // Cập nhật trạng thái xác thực và xóa OTP sau khi xác minh
        user.verified = true;
        user.otp = null;
        await user.save();

        return { message: 'Email đã được xác thực thành công' };
    } catch (error) {
        console.log('OTP Verification Error:', error.message);
        throw new Error('Không thể xác thực OTP');
    }
};



const login = async (email, password) => {
    try {
        let userInDB = await userModel.findOne({ email });
        
        // Kiểm tra xem email có tồn tại hay không
        if (!userInDB) {
            throw new Error('Email không tồn tại');
        }

        // Kiểm tra xem tài khoản đã được xác thực chưa
        if (!userInDB.verified) {
            throw new Error('Tài khoản chưa được xác thực');
        }

        // Kiểm tra mật khẩu
        const result = bcrypt.compareSync(password, userInDB.password);
        if (result) {
            return {
                _id: userInDB._id,
                email: userInDB.email,
                password: userInDB.password,
                role: userInDB.role,
                createAt: userInDB.createAt,
                updateAt: userInDB.updateAt,
            };
        } else {
            throw new Error('Không đúng mật khẩu!');
        }
    } catch (error) {
        console.log('Error: ', error.message);
        throw new Error(error.message);
    }
};

const updateuser = async (id, oldPassword, newPassword, username, role) => {
    try {
        let userid = await userModel.findById(id);
        if (!userid) {
            throw new Error('Id không hợp lệ!');
        }

        // Kiểm tra mật khẩu cũ (Sử dụng bcrypt.compare)
        const isPasswordValid = bcrypt.compareSync(oldPassword, userid.password);
        if (!isPasswordValid) {
            throw new Error('Mật khẩu cũ không chính xác!');
        }

        // Cập nhật thông tin nếu mật khẩu cũ đúng
        userid.username = username || userid.username;

        // Mã hóa mật khẩu mới trước khi lưu
        if (newPassword) {
            userid.password = bcrypt.hashSync(newPassword, 10);
        }

        userid.role = role || userid.role;
        userid.updateAt = Date.now();
        await userid.save();

        const user = new userModel({
            _id: userid._id,
            username: userid.username,
            email: userid.email,
            password: userid.password,
            role: userid.role,
        });

        return user;
    } catch (error) {
        console.log('Error: ', error);
        throw new Error('Có lỗi khi cập nhật thông tin');
    }
    return null;
};


const deleteuser = async (id) => {

    try {
        let user = await userModel.findById({ id });
        if (!user) {
            throw new Error('Id khong hop le !')
        }
        // Edit data

        const result = await userModel.deleteOne({ _id: id });
        return result;

    }
    catch (error) {
        console.log('Error: ', error);
        throw new Error('Error when delete user')
    }
    return null;
}


// Quên mật khẩu
const forgetpassword = async (email) => {
    try {
        let userInDB = await userModel.findOne({ email });
        if (!userInDB) {
            throw new Error('Email không tồn tại');
        }
        // tạo mật khẩu mới
        const newPassword = randomstring.generate({ length: 7, charset: 'alphanumeric' });

        // gửi pass mới về mail
        await sendNewPassword(email, newPassword);

        // Mã hóa mật khẩu
        const salt = bcrypt.genSaltSync(10);
        const hashedpassword = bcrypt.hashSync(newPassword, salt);

        userInDB.password = hashedpassword
        userInDB.updateAt = new Date();
        await userInDB.save();

        return { email: userInDB.email, updateAt: userInDB.updateAt };

    } catch (error) {
        console.log('Error: quên mật khẩu', error.message);
        throw new Error(error.message);
    }
}




module.exports = { register, login, updateuser, deleteuser, verifyOTP,forgetpassword }