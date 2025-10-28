const NOTE_CATE_PET_TYPE = new Map([//作用在指定宠物的类型0-全部1-猫2-狗,3-猫狗,4-其它
    [0, "全部"],
    [1, "猫"],
    [2, "狗"],
    [3, "猫狗"],
    [4, "其它"]
]);

const NOTE_CATE_IS_DELETED = new Map([//记录类型是否被删除
    [0, "未删除"],
    [1, "已删除"],
]);

module.exports = {
    NOTE_CATE_PET_TYPE,
    NOTE_CATE_IS_DELETED
};