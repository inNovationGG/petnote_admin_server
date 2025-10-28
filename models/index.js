const { Sequelize, DataTypes } = require("sequelize");
const {
  db_pet_config,
  db_pet_admin_config,
  db_pet_log_config,
  db_plan_config,
  db_plan_log_config,
  db_customers_config,
  db_shop_tk_config,
} = require("../config");
const initCustomersModels = require("./customers_db/init-models");
const initShopTkModelsModels = require("./shop_tk/init-models");

//初始化Sequelize实例
const createSequelizeInstance = (config) => {
  return new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port,
      dialect: "mysql",
      // 可以添加其他Sequelize配置选项
    }
  );
}
//创建Sequelize实例
const sequelize_pet = createSequelizeInstance(db_pet_config);
const sequelize_pet_admin = createSequelizeInstance(db_pet_admin_config);
const sequelize_pet_log = createSequelizeInstance(db_pet_log_config);
const sequelize_plan = createSequelizeInstance(db_plan_config);
const sequelize_plan_log = createSequelizeInstance(db_plan_log_config);
const sequelize_customers = createSequelizeInstance(db_customers_config);
const sequelize_shop_tk = createSequelizeInstance(db_shop_tk_config);

//==============================================Model=============================================//
//数据库pet的Model
const Banner = require("./pet/banner")(sequelize_pet, DataTypes);
const Pet = require("./pet/pet")(sequelize_pet, DataTypes);
const User = require("./pet/user")(sequelize_pet, DataTypes);
const PetCate = require("./pet/pet_cate")(sequelize_pet, DataTypes);
const Area = require("./pet/area")(sequelize_pet, DataTypes);
const UserBreeder = require("./pet/user_breeder")(sequelize_pet, DataTypes);
const Note = require("./pet/note")(sequelize_pet, DataTypes);
const NotePet = require("./pet/note_pet")(sequelize_pet, DataTypes);
const NoteImage = require("./pet/note_image")(sequelize_pet, DataTypes);
const SchedulePet = require("./pet/schedule_pet")(sequelize_pet, DataTypes);
const Messages = require("./pet/messages")(sequelize_pet, DataTypes);
const NoteCate = require("./pet/note_cate")(sequelize_pet, DataTypes);
const NoteCateAttr = require("./pet/note_cate_attr")(sequelize_pet, DataTypes);
const NoteCateAttrVal = require("./pet/note_cate_attr_val")(sequelize_pet, DataTypes);
const NoteNumEveryday = require("./pet/note_num_everyday")(sequelize_pet, DataTypes);
const Score = require("./pet/score")(sequelize_pet, DataTypes);
const ScoreGoods = require("./pet/score_goods")(sequelize_pet, DataTypes);
const ScoreGoodsCate = require("./pet/score_goods_cate")(sequelize_pet, DataTypes);
const ScoreTask = require("./pet/score_task")(sequelize_pet, DataTypes);
const ScoreLog = require("./pet/score_log")(sequelize_pet, DataTypes);
const SurpriseTicket = require("./pet/surprise_ticket")(sequelize_pet, DataTypes);
const UserExt = require("./pet/user_ext")(sequelize_pet, DataTypes);
const ScoreExpired = require("./pet/score_expired")(sequelize_pet, DataTypes);
const LotteryText = require("./pet/lottery_text")(sequelize_pet, DataTypes);
const YouzanTicket = require("./pet/youzan_ticket")(sequelize_pet, DataTypes);

//数据库pet_admin的Model
const PetAdminUser = require("./pet_admin/user")(sequelize_pet_admin, DataTypes);
const PetAdminActionLog = require("./pet_admin/action_log")(sequelize_pet_admin, DataTypes);

//数据库pet_log的Model
const PetLogUserLoginLog = require("./pet_log/user_login_log")(sequelize_pet_log, DataTypes);
const PetLogSendMiniLog = require("./pet_log/send_mini_log")(sequelize_pet_log, DataTypes);
const PetLogSendWechatLog = require("./pet_log/send_wechat_log")(sequelize_pet_log, DataTypes);

//数据库plan的Model
const PlanArticle = require("./plan/article")(sequelize_plan, DataTypes);
const PlanBanner = require("./plan/banner")(sequelize_plan, DataTypes);
const PlanBrand = require("./plan/brand")(sequelize_plan, DataTypes);
const PlanGoodsCate = require("./plan/goods_cate")(sequelize_plan, DataTypes);
const PlanGoodsContent = require("./plan/goods_content")(sequelize_plan, DataTypes);
const PlanGoods = require("./plan/goods")(sequelize_plan, DataTypes);
const PlanOutputArticle = require("./plan/output_article")(sequelize_plan, DataTypes);
const PlanOutputRecommend = require("./plan/output_recommend")(sequelize_plan, DataTypes);
const PlanOutput = require("./plan/output")(sequelize_plan, DataTypes);
const PlanSubject = require("./plan/subject")(sequelize_plan, DataTypes);
const PlanSubjectItem = require("./plan/subject_item")(sequelize_plan, DataTypes);
const PlanUserGoodsCollect = require("./plan/user_goods_collect")(sequelize_plan, DataTypes);
const PlanUserReportDataStat = require("./plan/user_report_data_stat")(sequelize_plan, DataTypes);
const PlanUserReportData = require("./plan/user_report_data")(sequelize_plan, DataTypes);
const PlanUserReportFlow = require("./plan/user_report_flow")(sequelize_plan, DataTypes);
const PlanUserReport = require("./plan/user_report")(sequelize_plan, DataTypes);
const PlanUserSubjectItem = require("./plan/user_subject_item")(sequelize_plan, DataTypes);
const PlanUserSubject = require("./plan/user_subject")(sequelize_plan, DataTypes);
const PlanUser = require("./plan/user")(sequelize_plan, DataTypes);

//数据库shop_tk的Model
const Tax = require("./shop_tk/tax")(sequelize_shop_tk, DataTypes);
const JstGoodsSku = require("./shop_tk/jst_goods_sku")(sequelize_shop_tk, DataTypes);
const JstInventory = require("./shop_tk/jst_inventory")(sequelize_shop_tk, DataTypes);
const JstOrderItem = require("./shop_tk/jst_order_item")(sequelize_shop_tk, DataTypes);
const JstOrder = require("./shop_tk/jst_order")(sequelize_shop_tk, DataTypes);
const JstShopWms = require("./shop_tk/jst_shop_wms")(sequelize_shop_tk, DataTypes);
const JstShop = require("./shop_tk/jst_shop")(sequelize_shop_tk, DataTypes);
const JstStoreHouse = require("./shop_tk/jst_store_house")(sequelize_shop_tk, DataTypes);
const JstWareHouses = require("./shop_tk/jst_warehouses")(sequelize_shop_tk, DataTypes);
const OpenOrderItem = require("./shop_tk/open_order_item")(sequelize_shop_tk, DataTypes);
const OpenOrder = require("./shop_tk/open_order")(sequelize_shop_tk, DataTypes);
const TkGoodsItemDownLog = require("./shop_tk/tk_goods_item_down_log")(sequelize_shop_tk, DataTypes);
const TkGoodsItem = require("./shop_tk/tk_goods_item")(sequelize_shop_tk, DataTypes);
const JstStoreSkuCost = require("./shop_tk/jst_store_sku_cost")(sequelize_shop_tk, DataTypes);
const JstOrderNum = require("./shop_tk/jst_order_num")(sequelize_shop_tk, DataTypes);
const JstStoreOrderNum = require("./shop_tk/jst_store_order_num")(sequelize_shop_tk, DataTypes);
const CityStore = require("./shop_tk/city_store")(sequelize_shop_tk, DataTypes);
const GoodsCate = require("./shop_tk/goods_cate")(sequelize_shop_tk, DataTypes);
//==============================================================================================//
const sequelize_pet_group = {
  sequelize_pet,
  Banner,
  Pet,
  User,
  PetCate,
  Area,
  UserBreeder,
  Note,
  NotePet,
  NoteImage,
  SchedulePet,
  Messages,
  NoteCate,
  NoteCateAttr,
  NoteCateAttrVal,
  NoteNumEveryday,
  Score,
  ScoreGoods,
  ScoreGoodsCate,
  ScoreTask,
  ScoreLog,
  SurpriseTicket,
  UserExt,
  ScoreExpired,
  LotteryText,
  YouzanTicket
}

const sequelize_pet_admin_group = {
  sequelize_pet_admin,
  PetAdminUser,
  PetAdminActionLog
}

const sequelize_pet_log_group = {
  sequelize_pet_log,
  PetLogUserLoginLog,
  PetLogSendMiniLog,
  PetLogSendWechatLog,
}

const sequelize_plan_group = {
  sequelize_plan,
  PlanArticle,
  PlanBanner,
  PlanBrand,
  PlanGoodsCate,
  PlanGoodsContent,
  PlanGoods,
  PlanOutputArticle,
  PlanOutputRecommend,
  PlanOutput,
  PlanSubject,
  PlanSubjectItem,
  PlanUserGoodsCollect,
  PlanUserReportDataStat,
  PlanUserReportData,
  PlanUserReportFlow,
  PlanUserReport,
  PlanUserSubjectItem,
  PlanUserSubject,
  PlanUser
}

const sequelize_plan_log_group = {
  sequelize_plan_log,
}

const sequelize_customers_group = {
  sequelize_customers,
  customersModels: initCustomersModels(sequelize_customers),
}

const sequelize_shop_tk_group = {
  sequelize_shop_tk,
  Tax,
  JstGoodsSku,
  JstInventory,
  JstOrderItem,
  JstOrder,
  JstShopWms,
  JstShop,
  JstStoreHouse,
  JstWareHouses,
  OpenOrderItem,
  OpenOrder,
  TkGoodsItemDownLog,
  TkGoodsItem,
  JstStoreSkuCost,
  JstOrderNum,
  JstStoreOrderNum,
  CityStore,
  GoodsCate,
  shopTkModels: initShopTkModelsModels(sequelize_shop_tk),
}

module.exports = {
  Sequelize,
  ...sequelize_pet_group,
  ...sequelize_pet_admin_group,
  ...sequelize_pet_log_group,
  ...sequelize_plan_group,
  ...sequelize_plan_log_group,
  ...sequelize_customers_group,
  ...sequelize_shop_tk_group,
};
