const path = require("path");
const dotenv = require("dotenv");
const env = process.env.NODE_ENV;
const petDbConfig = require("./pet_dbConfig")[env];
const planDbConfig = require("./plan_dbConfig")[env];
const customersDbConfig = require("./customers_dbConfig")[env];

// 根据 NODE_ENV 加载相应的 .env 文件
const envFilePath = path.resolve(__dirname, "../", `.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envFilePath });

/**
 * 创建数据库配置
 *
 * @param {string} databaseName
 * @param {object} databaseConfig
 * @return {object}
 */
const createDbConfig = (databaseName, databaseConfig) => {
  return {
    database: databaseName,
    username: databaseConfig.username, //账号
    password: databaseConfig.password, //密码
    host: databaseConfig.host, // 注意这里是本地主机，因为SSH隧道会将远程MySQL服务器映射到本地端口
    port: databaseConfig.port, // 这里是SSH隧道的本地端口
    dialect: "mysql",
  };
};

//创建数据库配置
const db_pet_config = createDbConfig("pet", petDbConfig);
const db_pet_admin_config = createDbConfig("pet_admin", petDbConfig);
const db_pet_log_config = createDbConfig("pet_log", petDbConfig);
const db_plan_config = createDbConfig("plan", planDbConfig);
const db_plan_log_config = createDbConfig("plan_log", planDbConfig);
const db_customers_config = createDbConfig("customers_db", customersDbConfig);
const db_shop_tk_config = createDbConfig("shop_tk", petDbConfig);

console.log("process.env.NODE_ENV: ", env);
console.log("PET-ADMIN-SERVER => db_pet_config ======>>>>>>", db_pet_config);
console.log("PET-ADMIN-SERVER => db_pet_admin_config ======>>>>>>", db_pet_admin_config);
console.log("PET-ADMIN-SERVER => db_pet_log_config ======>>>>>>", db_pet_log_config);
console.log("PET-ADMIN-SERVER => db_plan_config ======>>>>>>", db_plan_config);
console.log("PET-ADMIN-SERVER => db_plan_log_config ======>>>>>>", db_plan_log_config);
console.log("PET-ADMIN-SERVER => db_customers_config ======>>>>>>", db_customers_config);
console.log("PET-ADMIN-SERVER => db_shop_tk_config ======>>>>>>", db_shop_tk_config);

const sshConfig = {
  host: process.env.SSH_HOST,
  port: process.env.SSH_PORT,
  username: process.env.SSH_USER,
  password: process.env.SSH_PASSWORD,
};

const forwardConfig = {
  srcHost: process.env.FORWARD_SRC_HOST, // 本地的SSH客户端
  srcPort: process.env.FORWARD_SRC_PORT, // 本地端口
  dstHost: process.env.FORWARD_DST_HOST, // 目标数据库主机
  dstPort: process.env.FORWARD_DST_PORT, // 目标数据库端口
};

const ossConfig = {
  region: process.env.OSS_REGION,
  endpoint: process.env.OSS_ENDPOINT,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  bucketHost: process.env.OSS_BUCKET_HOST,
};

module.exports = {
  port: 3001,
  sshConfig,
  forwardConfig,
  ossConfig,
  db_pet_config, // 数据库pet
  db_pet_admin_config, // 数据库pet_admin
  db_pet_log_config, // 数据库pet_log
  db_plan_config, // 数据库plan
  db_plan_log_config, // 数据库plan_log
  db_customers_config, // 企微客服 customers_db
  db_shop_tk_config, // 数据库shop_tk
};
