//task_key对应的task_id
const TASK_KEY_ID = {
    FIRST_CONSUME: "ede88acd-dd4d-425d-871f-853c73a0098b", //宠本本三方平台消费订单首次兑换积分
    CONSUME: "e278d6da-175f-4339-b672-f234b6940a27", //宠本本三方平台消费订单兑换积分
    PETHOME_CONSUME: "b485cfc7-f03a-4966-a38c-3e97714a7d7e", //宠本本到家消费订单兑换积分
    FINISH_USER_INFO: "73cc48cb-4d81-46dd-82a1-d16266f3a34d", //完善用户信息100%
    FINISH_PET_INFO: "5287bc25-2183-4eb3-a6a9-b90842e01516", //完成宠物信息建档
    ADD_FIRST_NOTE: "084a0a8c-3d0b-4f15-84f1-c47edacd45b4", //首次创建记录（系统自动创建记录除外）
    ADD_FIRST_SCHEDULE: "fa39918d-a49e-4798-b650-62c7b6624336", //首次创建宠物循环提醒
    ADD_ADMIN_FRIEND: "d3e0e00f-d46e-44b9-ae99-7038d47903a2", //添加宠本本福利官为好友
    OPEN_SIGN_SCHEDULE: "165bace7-6d7e-4fbb-8313-c486eb6ef1b6", //开启连续签到打卡提醒
    ADD_NOTE: "b3f5c48d-0647-4c98-8abf-f5d8f21af806", //添加1条记录
    VISIT_PETHOME_APP: "c23d9c86-621c-4505-ba0f-80bc0e2e3869", //访问宠本本到家小程序
    SIGN_ONE_DAY: "0f76bd11-dfd6-497d-958d-62eb860bd094", //连续签到1天
    SIGN_TWO_DAY: "9bb7c69d-435e-4786-9f6c-03e3675d9b68", //连续签到2天
    SIGN_THREE_DAY: "06f4b891-db44-452e-bc30-b86481d5606f", //连续签到3天
    SIGN_FOUR_DAY: "4737a3d2-c4e9-4f0c-926c-a02d9b121960", //连续签到4天
    SIGN_FIVE_DAY: "46245055-fe9e-4b8e-8623-56a857260e56", //连续签到5天
    SIGN_SIX_DAY: "0ba7dc8c-1607-490d-8b8a-078f4734ad38", //连续签到6天
    SIGN_SEVEN_DAY: "01655405-938f-4c52-b4c9-9d5f952a3bf8", //连续签到7天
    SURPRISE: "2b00f99b-b141-4f48-af64-5564e7592d9a", //惊喜奖励设置
    LUCK_TEXT: "bc7bcd04-26d0-4b4a-858a-26218e457121", //抽签文案设置
    SCORE_LIMIT: "e98a1e2b-78ca-43c4-8ee1-1caa0bf0f1a0", //每日获取积分上限
    COLLECT_TEXT: "959c1495-ab2a-4329-a2bc-b52232681488", //屯罐计划玩法规则
};

//任务类型
const TASK_TYPE = {
    CONSUME_TASK: 0, //消费送积分规则
    NEWUSER_TASK: 1, //新用户任务规则
    DAILY_TASK: 2, //每日任务规则
    SIGN_TASK: 3, //连续签到任务规则
    OTHER_TASK: 4, //其他规则
};

//惊喜奖励优惠券状态
const SURPRISE_TICKET_STATUS = {
    0: "生效",
    1: "失效"
};

//task_key
const TASK_KEY = {
    FIRST_CONSUME: "FIRST_CONSUME", //宠本本三方平台消费订单首次兑换积分
    CONSUME: "CONSUME", //宠本本三方平台消费订单兑换积分
    PETHOME_CONSUME: "PETHOME_CONSUME", //宠本本到家消费订单兑换积分
    FINISH_USER_INFO: "FINISH_USER_INFO", //完善用户信息100%
    FINISH_PET_INFO: "FINISH_PET_INFO", //完成宠物信息建档
    ADD_FIRST_NOTE: "ADD_FIRST_NOTE", //首次创建记录（系统自动创建记录除外）
    ADD_FIRST_SCHEDULE: "ADD_FIRST_SCHEDULE", //首次创建宠物循环提醒
    ADD_ADMIN_FRIEND: "ADD_ADMIN_FRIEND", //添加宠本本福利官为好友
    OPEN_SIGN_SCHEDULE: "OPEN_SIGN_SCHEDULE", //开启连续签到打卡提醒
    ADD_NOTE: "ADD_NOTE", //添加1条记录
    VISIT_PETHOME_APP: "VISIT_PETHOME_APP", //访问宠本本到家小程序
    SIGN_ONE_DAY: "SIGN_ONE_DAY", //连续签到1天
    SIGN_TWO_DAY: "SIGN_TWO_DAY", //连续签到2天
    SIGN_THREE_DAY: "SIGN_THREE_DAY", //连续签到3天
    SIGN_FOUR_DAY: "SIGN_FOUR_DAY", //连续签到4天
    SIGN_FIVE_DAY: "SIGN_FIVE_DAY", //连续签到5天
    SIGN_SIX_DAY: "SIGN_SIX_DAY", //连续签到6天
    SIGN_SEVEN_DAY: "SIGN_SEVEN_DAY", //连续签到7天
    SURPRISE: "SURPRISE", //惊喜奖励设置
    LUCK_TEXT: "LUCK_TEXT", //抽签文案设置
    SCORE_LIMIT: "SCORE_LIMIT", //每日获取积分上限
    COLLECT_TEXT: "COLLECT_TEXT", //屯罐计划玩法规则
};

//消费送积分规则配置模板
const CONSUME_TEMPLATE = {
    rate: { type: 'number', required: true }, //消费金额转换积分的倍率
    unit: { //兑换周期限制
        type: 'string',
        required: false,
        allowedValues: ['hour', 'day', 'week', 'month', 'year', 'none']
    },
    limit: { type: 'number', required: false }, //周期内兑换次数限制
};

//新用户任务配置模板
const NEW_USER_TEMPLATE = {
    score: { type: 'number', required: true }, //完成任务可获得的积分数
};

//每日任务规则配置模板
const DAILY_TEMPLATE = {
    score: { type: 'number', required: true }, //每次获得的积分数
    unit: { //周期限制
        type: 'string',
        required: false,
        allowedValues: ['hour', 'day', 'week', 'month', 'year', 'none']
    },
    limit: { type: 'number', required: true }, //周期内次数限制
};

//连续签到任务规则模板
const SIGN_TEMPLATE = {
    baseScore: { type: 'number', required: true }, //基础积分
    extraScore: { type: 'number', required: true }, //首次打卡奖励
};

//惊喜奖励设置模板
const SURPRISE_TEMPLATE = {
    min: { type: 'number', required: true }, //惊喜奖励保底：最少获得积分数
    max: { type: 'number', required: true }, //惊喜奖励保底：最多获得积分数
};

//抽签文案设置模板
const LUCK_TEXT_TEMPLATE = {
    luck_list: {
        type: 'array',
        required: true,
        items: {
            type: 'object',
            required: false,
            properties: {
                id: { type: 'number', required: true },
                type: { type: 'string', required: true },
                rate: { type: 'number', required: true },
                text: { type: 'string', required: true },
            }
        }
    }
};

//每日获取积分上限配置模板
const SCORE_LIMIT_TEMPLATE = {
    score: { type: 'number', required: true }, //每天最多获取的积分数量
};

//屯罐计划玩法规则配置模板
const COLLECT_TEXT_TEMPLATE = {
    text: { type: 'string', required: true }, //屯罐玩法规则介绍富文本
};

//新增或编辑任务规则时需要遵循对应的规则配置模板
const TASK_TEMPLATE = {
    0: CONSUME_TEMPLATE, //消费送积分
    1: NEW_USER_TEMPLATE, //新用户任务
    2: DAILY_TEMPLATE, //每日任务
    3: SIGN_TEMPLATE, //连续签到任务
    SURPRISE: SURPRISE_TEMPLATE, //惊喜奖励设置
    LUCK_TEXT: LUCK_TEXT_TEMPLATE, //抽签文案设置
    SCORE_LIMIT: SCORE_LIMIT_TEMPLATE, //每日获取积分上限
    COLLECT_TEXT: COLLECT_TEXT_TEMPLATE, //屯罐计划玩法规则
}

//校验config_data是否合规
function validateTemplate(param, schema, path = []) {
    const errors = [];
    function validateValue(value, schema, key) {
        const { type, ...restSchema } = schema;
        if (type) {
            if (Array.isArray(type)) {
                // 处理枚举类型
                if (!type.includes(value)) {
                    errors.push(`Invalid value for '${path.join('.')}.${key}': ${value} is not in the allowed values`);
                }
            } else if (type !== 'array' && typeof value !== type) {
                // 处理基本类型(由于typeof [] === 'object'，所以排除type === 'array'的情况)
                errors.push(`Invalid type for '${path.join('.')}.${key}': expected ${type}, got ${typeof value}`);
            } else if (type === 'object' && value !== null) {
                // 递归验证对象
                if (restSchema.properties) {
                    validateObject(value, restSchema.properties, [...path, key]);
                }
            } else if (type === 'array') {
                // 验证数组
                if (restSchema.items) {
                    value.forEach((item, index) => {
                        validateValue(item, restSchema.items, `${index}`);
                    });
                }
            }
        }
    }
    function validateObject(obj, schema, currentPath) {
        for (const key in obj) {
            const fullPath = [...currentPath, key];
            // 检查属性是否在schema中定义
            if (!schema.hasOwnProperty(key)) {
                errors.push(`Unexpected property '${fullPath.join('.')}'`);
                break;
            }
            const value = obj[key];
            const schemaForKey = schema[key];
            // 处理必填字段
            if (value === undefined && schemaForKey.required) {
                errors.push(`Missing required property '${fullPath.join('.')}'`);
            } else if (value !== undefined) {
                validateValue(value, schemaForKey, fullPath);
            }
        }
    }
    validateObject(param, schema, path);
    return errors.length === 0 ? true : errors;
}

// 使用示例
// const param = {
//     luck_list: [
//         {
//             id: 1,
//             type: "大吉",
//             rate: 30,
//             text: "今天天气好"
//         },
//         {
//             id: 2,
//             type: "小吉",
//             rate: "50%", // 触发错误
//             text: "今天天气好"
//         }
//     ]
// };
// console.log(validateTemplate(param, LUCK_TEXT_TEMPLATE));

module.exports = {
    TASK_KEY_ID,
    TASK_TYPE,
    SURPRISE_TICKET_STATUS,
    TASK_TEMPLATE,
    validateTemplate,
    TASK_KEY
}
