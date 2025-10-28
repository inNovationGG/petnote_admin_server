const Redis = require('ioredis');
const path = require("path");
const dotenv = require("dotenv");
const envFilePath = path.resolve(__dirname, "../", `.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFilePath });
class RedisClient {
    constructor(options = {}) {
        this.options = {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD !== "null" ? process.env.REDIS_PASSWORD : null,
            ...options, // 其他配置信息
        };
        this.redisInstance = null;
        this.connect();
    }

    connect() {
        if (!this.redisInstance) {
            this.redisInstance = new Redis(this.options);
            this.redisInstance.on('error', (err) => {
                console.error('Redis Client Error', err);
            });
        }
    }

    async get(key) {
        const result = await this.redisInstance.get(key);
        return result ? JSON.parse(result) : null;
    }

    async set(key, value) {
        await this.redisInstance.set(key, JSON.stringify(value));
    }

    async setEx(key, value, ttl) {
        // 设置过期时间，单位秒
        await this.redisInstance.set(key, JSON.stringify(value), 'EX', ttl);
    }

    async hSet(key, field, value) {
        try {
            if (typeof value === 'object' && value !== null) {
                value = JSON.stringify(value);
            }
            await this.redisInstance.hset(key, field, value);
        } catch (error) {
            throw error;
        }
    }

    async hGet(key, field) {
        try {
            const result = await this.redisInstance.hget(key, field);
            return result ? JSON.parse(result) : null;
        } catch (error) {
            throw error;
        }
    }
}

// 创建一个单例
let redisSingleton = null;
function getRedisInstance(options = {}) {
    if (!redisSingleton) {
        redisSingleton = new RedisClient(options);
    }
    return redisSingleton;
}

module.exports = getRedisInstance;