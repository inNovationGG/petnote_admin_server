const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { PetAdminUser } = require("../models");

/**
 * 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Object} - 登录结果
 */
const login = async (username, password) => {
    try {
        // 检查用户是否存在
        const user = await PetAdminUser.findOne({ where: { username } });
        if (!user) {
            return { success: false, message: "用户名或密码错误", code: 400 };
        }
        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return { success: false, message: "用户名或密码错误", code: 400 };
        }
        // 生成 JWT Token
        const payload = {
            uid: user.uid,
            username: user.username,
        };
        const token = generateToken(payload);
        return { success: true, data: { token, uid: user.uid, username: user.username } };
    } catch (error) {
        return { success: false, message: "登录失败", error };
    }
};

/**
 * 用户注册
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} truename - 真实名字
 * @returns {Object} - 注册结果
 */
const register = async (username, password, truename) => {
    try {
        // 检查用户是否存在
        const user = await PetAdminUser.findOne({ where: { username } });
        if (user) {
            return { success: false, message: "用户名已经存在，请重新输入", code: 400 };
        }
        const _password = await encryptPassword(password);
        const nowTime = Math.floor(Date.now() / 1000);
        await PetAdminUser.create({
            username: username,
            truename: truename,
            password: _password,
            role_id: 1,
            remark: "",
            expired_at: nowTime,
            created_at: nowTime,
            updated_at: nowTime,
        });
        return { success: true, message: "注册成功", code: 200 };
    } catch (error) {
        return { success: false, message: "注册失败", error };
    }
};

const encryptPassword = async (pwd) => {
    // 生成盐值（salt），通常盐值会随机生成以保证加密的安全性  
    const salt = await bcrypt.genSalt(10); // 10是盐值的复杂度  
    // 使用盐值和密码生成哈希值  
    const hash = await bcrypt.hash(pwd, salt);
    return hash;
};

module.exports = {
    login,
    register
};
