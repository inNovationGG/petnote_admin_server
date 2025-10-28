const PET_GENDER = new Map([//宠物性别
    [0, "男"],
    [1, "女"],
    [2, "未知"]
]);

const PET_KC_STATUS = new Map([//宠物绝育状态
    [0, "未绝育"],
    [1, "已绝育"],
    [2, "未知"]
]);

const PET_SOMATO_TYPE = new Map([//宠物体型
    [1, "瘦弱"],
    [2, "偏瘦"],
    [3, "标准"],
    [4, "偏胖"],
    [5, "肥胖"]
]);

const PET_SIZE = new Map([//宠物大小
    [0, "其他"],
    [1, "小型"],
    [2, "中型"],
    [3, "大型"]
]);

const PET_IS_DIE = new Map([//宠物是否死亡
    [0, "未死亡"],
    [1, "已死亡"],
]);

const PET_IS_DELETED = new Map([//宠物是否被删除
    [0, "未删除"],
    [1, "已删除"],
]);

module.exports = {
    PET_GENDER,
    PET_KC_STATUS,
    PET_SOMATO_TYPE,
    PET_SIZE,
    PET_IS_DIE,
    PET_IS_DELETED
};