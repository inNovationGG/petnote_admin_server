//积分收支类型（0-增加，1-减少）
const SCORE_LOG_TYPE = {
    INCREMENT: 0,
    DECREMENT: 1,
};

//积分收支细分类型
const SCORE_LOG_CHILD_TYPE = {
    INCRE_CONSUME: 0, //消费获取
    INCRE_NEW_USER_TASK: 1, //新用户任务获取
    INCRE_DAILY_TASK: 2, //每日任务获取
    INCRE_SIGN_TASK: 3, //签到任务获取
    INCRE_ACTIVITY_TASK: 4, //活动任务获取
    INCRE_ADMIN: 5, //管理员添加
    INCRE_OTHER: 6, //其他方式获取
    DECRE_EXCHANGE: 7, //兑换商品扣减
    DECRE_EXPIRED: 8, //积分到期扣减
    DECRE_ADMIN: 9, //管理员扣减
    DECRE_OTHER: 10, //其他方式扣减
};

module.exports = {
    SCORE_LOG_TYPE,
    SCORE_LOG_CHILD_TYPE
};