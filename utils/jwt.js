const jwt = require("jsonwebtoken");
require("dotenv").config();

// JWT 秘钥
const secretKey = process.env.JWT_SECRET;
const ISSUER = "pet_admin";
const EXPIRATION_TIME = 60 * 60 * 24; // 24 小时
const KEY = "admpient";

// 生成 Admin Token
const generateToken = (params = {}) => {
    const nowTime = Math.floor(Date.now() / 1000); // 当前时间（秒）
    const payload = {
        iss: ISSUER, // 该JWT的签发者
        iat: nowTime, // 签发时间
        nbf: nowTime, // 该时间之前不接收处理该Token
        exp: nowTime + EXPIRATION_TIME, // 过期时间
        jti: require("crypto")
            .createHash("md5")
            .update(KEY + nowTime)
            .digest("hex"), // 该Token唯一标识
        ...params, // 合并额外参数
    };

    console.log("generateToken payload: ", payload);

    const token = jwt.sign(payload, secretKey, { algorithm: "HS256" });
    return token;
};

/**
 * 验证 JWT
 * @param {string} token - 需要验证的 JWT
 * @returns {object|boolean} - 返回解码后的 payload 或者 false（如果验证失败）
 *
 * 示例返回的 payload:
 * {
 *   iss: "pet_admin",          // 签发者
 *   iat: 1717469939,           // 签发时间
 *   nbf: 1717469939,           // 生效时间
 *   exp: 1717471739,           // 过期时间
 *   jti: "42f4a4bb05ed5c03e1b2cf237950f7f5",  // JWT ID
 *   uid: 17,                   // 用户 ID
 *   username: "testing"        // 用户名
 * };
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, secretKey);
    } catch (error) {
        console.log("error: ", error);
        return false;
    }
};

module.exports = {
    generateToken,
    verifyToken,
};
