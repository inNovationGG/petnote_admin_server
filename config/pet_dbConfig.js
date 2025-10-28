const path = require("path");
const dotenv = require("dotenv");

// 根据 NODE_ENV 加载相应的 .env 文件
const envFilePath = path.resolve(__dirname, "../", `.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFilePath });

module.exports = {
    development: {
        username: process.env.PET_DB_USER,
        password: process.env.PET_DB_PASSWORD,
        database: process.env.PET_DB_NAME,
        host: process.env.PET_DB_HOST,
        port: process.env.PET_DB_PORT,
        dialect: "mysql",
    },
    test: {
        username: process.env.PET_DB_USER,
        password: process.env.PET_DB_PASSWORD,
        database: process.env.PET_DB_NAME,
        host: process.env.PET_DB_HOST,
        port: process.env.PET_DB_PORT,
        dialect: "mysql",
    },
    production: {
        username: process.env.PET_DB_USER,
        password: process.env.PET_DB_PASSWORD,
        database: process.env.PET_DB_NAME,
        host: process.env.PET_DB_HOST,
        port: process.env.PET_DB_PORT,
        dialect: "mysql",
    },
};
