/* eslint-disable no-unused-vars */
const Joi = require('joi');

// 定义userController的验证模式  
const bannerValidateSchema = Joi.object({
    id: Joi.number().required().description('id必须填写'),
    title: Joi.string().max(255).required().description('标题必须填写'),
    pic: Joi.string().max(255).required().description('图片必须填写'),
    description: Joi.string().max(255).description('描述最大255'),
    type: Joi.number().valid(1, 2, 3).required().description('类型必须填写'),
    tag: Joi.string().regex(/^[a-zA-Z0-9_]+$/).required().description('标签必须填写'),
    url_type: Joi.number().valid(0, 1, 2, 3, 4, 5).required().description('地址类型必填'),
    url: Joi.string().max(255).description('url最大255'),
    time_type: Joi.number().valid(1, 2).when('start_time', { is: Joi.exist(), then: Joi.required(), otherwise: Joi.forbidden() }).description('时间型必须填写'),
    start_time: Joi.date().description('开始时间不符合规范'),
    end_time: Joi.date().description('结束时间不符合规范'),
    sort: Joi.number().required().description('排序必须填写'),
    status: Joi.number().valid(1, 2).required().messages({
        'number.invalid': '状态不符合规范',
        'any.required': '状态必须填写'
    }).description('状态必须填写'),
}).required();


function validateUser(ctx, next) {
    return Joi.validate(ctx.request.body, bannerValidateSchema, { abortEarly: false }).then(value => {
        return next();
    }).catch(error => {
        ctx.status = 400;
        ctx.body = { error: error.details.map(detail => detail.message) };
    });
}

module.exports = validateUser;
