const Koa = require("koa");
const cors = require("koa2-cors");
const logger = require("koa-logger");

const config = require("./config");
const routes = require("./routes");
const { initializeDatabases } = require("./config/sequelize");
const responseFormatter = require("./middlewares/responseFormatter");
const schedule = require('node-schedule');
const moment = require("moment");
const { addDataToDatabase, synchroCustomersData, inventoryTimedTask } = require("./crontab/pet/note");
const { addJstStoreSkuCostToDatabase } = require("./crontab/jst/store_sku_cost");
const { addJstOrderNumToDatabase } = require("./crontab/jst/order_num");
const { addJstStoreOrderNumToDatabase } = require("./crontab/jst/store_order_num");
const updateOnlineInventory = require("./crontab/vip/cycle");
const syncInventory = require("./crontab/vip/inventory");
const expireScore = require("./crontab/vip/scoreExpired");
const saveYouzanTicket = require("./crontab/youzan/ticket");
const addCityStoreToDatabase = require("./crontab/tax/city_store");
const addGoodsCateToDatabase = require("./crontab/tax/goods_cate");
const syncYouzanOrdersEverySixHours = require("./crontab/youzan/order");
const handleYouzanOrderFields = require("./crontab/youzan/order_field_handle");
const syncYouzanOrderLabels = require("./crontab/youzan/wechat_label");
const syncWechatCustomersLabels = require("./crontab/youzan/wechat_customers_labels");
const createWechatPush = require("./crontab/youzan/wechat_push");

const getResult = require("./crontab/jst/customer");

const app = new Koa();

// middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["*"],
    credentials: true,
  })
);
app.use(logger());
app.use(responseFormatter());

// routes
app.use(routes.routes());
app.use(routes.allowedMethods());

// error handler
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

async function sequelizeAuthenticate() {
  try {
    if (process.env.UNIT_TESTING !== "jest") {
      await initializeDatabases();
      app.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
      });
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}
// 初始化数据库连接
sequelizeAuthenticate();

module.exports = app;
