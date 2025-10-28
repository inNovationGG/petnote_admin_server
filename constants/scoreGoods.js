//商品状态
const GOODS_STATUS = {
    UP: 0, //上架（前端显示并可兑换）
    HIDDEN: 1, //隐藏（前端不显示，可兑换）
    SELL_OUT: 2, //线上售罄（前端显示，不可兑换，展示循环补货时间）
    DOWN: 3, //下架（前端不显示，不可兑换）
};

//商品状态
const GOODS_STATUS_TEXT = {
    0: '上架',
    1: '隐藏',
    2: '线上售罄',
    3: '下架'
};

//线上循环方式
const CYCLE_TYPE = {
    0: '不循环',
    1: '日循环',
    2: '月循环'
};

//商品分类
const GOODS_CATE = {
    1: '同城达专用',
    2: '全国通用',
    3: '优惠券',
    4: '配送优惠券',
    5: '商品兑换券',
    6: '宠本本周边',
    7: '同城达专用',
    8: '全国通用',
    9: '新品',
    10: '畅销',
    11: '限量款'
};

//线上循环action类型
const CYCLE_ACTION_TYPE = {
    ADD: 0, //新增
    MINUS: 1, //减少
    OTHER: 2, //其他
};

//线上循环action影响字段
const CYCLE_ACTION_EFFECT = {
    ONLINE_INVENTORY: 0, //线上库存
    OTHER: 1, //其他
};

//是否有兑换次数限制
const IS_EXCHANGE_LIMIT = {
    NO_LIMIT: 0, //无限制
    LIMIT: 1, //有限制
};

//兑换周期限制
const EXCHANGE_DATE_LIMIT = {
    DAY: 2, //天
    MONTH: 4, //月
    ALL: 7, //一辈子
};

//兑换周期限制
const EXCHANGE_DATE_LIMIT_TEXT = {
    2: "每天",
    4: "每月",
}

//是否隐藏款
const IS_HIDDEN = {
    NO_HIDDEN: 0, //非隐藏款
    HIDDEN: 1, //隐藏款
};

//是否可膨胀
const IS_GROW = {
    NO_GROW: 0, //不可膨胀
    GROW: 1, //可膨胀
};

module.exports = {
    GOODS_STATUS,
    CYCLE_TYPE,
    GOODS_CATE,
    CYCLE_ACTION_TYPE,
    CYCLE_ACTION_EFFECT,
    IS_EXCHANGE_LIMIT,
    EXCHANGE_DATE_LIMIT,
    EXCHANGE_DATE_LIMIT_TEXT,
    IS_HIDDEN,
    IS_GROW,
    GOODS_STATUS_TEXT
}
