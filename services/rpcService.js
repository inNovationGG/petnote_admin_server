const simpleSign = require('../utils/simpleSign');
const axios = require('axios');
const moment = require('moment');

class RpcService {
    static signTag = '_sign';
    static timestamp = '_t';
    static nonce = '_nonce';

    constructor() {
        this.defaultHost = process.env.PET_API_HOST || '';
    }

    /**
     * 生成随机字符串
     * @param length 长度
     * @returns 随机字符串
     */
    generateNonce(length = 8) {
        return (
            moment().format('YYYYMMDDHHmmss') +
            Math.random()
                .toString(36)
                .substring(2, length + 2)
        );
    }

    /**
     * 获取签名数组
     * @returns 签名数组
     */
    getSignParams() {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = this.generateNonce();
        const sign = simpleSign.getSign(
            process.env.PET_SIGN_SECRET_KEY || '',
            timestamp,
            nonce,
        );

        return {
            [RpcService.signTag]: sign,
            [RpcService.timestamp]: timestamp,
            [RpcService.nonce]: nonce,
        };
    }

    /**
     * 递归地将对象中的 BigInt 值转换为字符串
     * @param obj 要处理的对象
     * @returns 处理后的对象
     */
    convertBigIntToString(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (typeof obj === 'bigint') {
            return obj.toString();
        }
        if (typeof obj === 'object') {
            if (Array.isArray(obj)) {
                return obj.map((item) => this.convertBigIntToString(item));
            } else {
                const result = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key] = this.convertBigIntToString(obj[key]);
                    }
                }
                return result;
            }
        }
        return obj;
    }

    /**
     * HTTP 请求
     * @param options 请求参数对象
     * @returns 响应结果
     */
    async request(
        url,
        params = {},
        method = 'POST',
        type = 'json',
        timeout = 5000,
    ) {
        const fullParams = { ...params, ...this.getSignParams() };
        const config = {
            method,
            url,
            timeout,
            headers: {
                'Content-Type':
                    type === 'json'
                        ? 'application/json'
                        : 'application/x-www-form-urlencoded',
            },
            data:
                type === 'json'
                    ? this.convertBigIntToString(fullParams)
                    : new URLSearchParams(fullParams).toString(),
        };

        const response = await axios(config);
        return response.data;
    }
}

module.exports = new RpcService();
