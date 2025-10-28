const bcrypt = require("bcryptjs");

/**
 * 加密密码
 * @param {string} pwd - 明文密码
 * @returns {Promise<string>} - 返回加密后的密码
 */
const encryptPassword = async (pwd) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pwd, salt);
    return hashedPassword;
};

/**
 * 验证密码
 * @param {string} pwd - 明文密码
 * @param {string} hash - 加密后的密码
 * @returns {Promise<boolean>} - 返回验证结果，匹配返回 true，不匹配返回 false
 */
const checkPassword = async (pwd, hash) => {
    const isMatch = await bcrypt.compare(pwd, hash);
    return isMatch;
};

module.exports = {
    encryptPassword,
    checkPassword,
};
