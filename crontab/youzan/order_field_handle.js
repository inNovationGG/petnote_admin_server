const schedule = require('node-schedule');
const {
    sequelize_customers,
    JstOrder,
    JstOrderItem,
    Tax
} = require("../../models");
const {
    youzan_orders: YouzanOrders,
    customers: Customers,
} = require("../../models").customersModels;
const { Op } = require("sequelize");
const moment = require("moment");
const { batchYouzanDecrypt, userInfoQuery, getExternalUserId, getYouzanOpenid } = require("../../services/youzanService");

async function queryUserInfo() {
    // let userInfo = await userInfoQuery('6B25rCeM750072823808000000');
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', userInfo.user_list[0].primitive_info);
    // console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', userInfo.user_list[0].mobile_info);
    // let realNickName = userInfo?.latest_info?.nick_name ?? '';
    // let primitiveNickname = userInfo?.user_list[0]?.primitive_info?.nick_name ?? '';
    // let mobileInfo = userInfo?.user_list[0]?.mobile_info?.mobile ?? '';
    // if (realNickName) {
    //     const sources = [realNickName, primitiveNickname, mobileInfo];
    //     const decryptRes = await batchYouzanDecrypt(sources);
    //     let nickName = decryptRes[userInfo?.latest_info?.nick_name ?? ''] ?? '';
    //     console.log('111111111111111111111111111111111', decryptRes);
    //     if (nickName) {
    //         console.log('2222222222222222222222222222222', nickName);
    //     }
    // }
    let userInfo = await getYouzanOpenid('wm8cRBDgAARz4k15fkhs_-hccMotn_Jg');
    console.log('11111111111111111111111111111111', userInfo);
}

async function handleYouzanOrderFields() {
    console.log('Begin Run Schedule Job handleYouzanOrderFields');
    try {
        const startOfDay = moment().subtract(70, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
        const endOfDay = moment().subtract(50, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
        // const endOfDay = moment().endOf('day').format("YYYY-MM-DD HH:mm:ss");
        // const startOfDay = '2024-11-14 00:00:00';
        // const endOfDay = '2024-11-14 23:59:59';
        const { default: pLimit } = await import("p-limit");
        const limit = pLimit(20);
        const dateArr = [[startOfDay, endOfDay]];
        for (const [startTime, endTime] of dateArr) {
            // 批量查询订单
            let orders = await YouzanOrders.findAll({
                where: {
                    order_creation_time: { [Op.between]: [startTime, endTime] },
                },
                attributes: [
                    'id',
                    'order_number',
                    'store_id',
                    'goods_id',
                    'f_cate_id',
                    'outer_sku_id',
                    'title',
                    'yz_open_id',
                    'fans_nickname',
                    'user_ids'
                ],
            });
            if (!(orders && orders.length)) {
                continue;
            }
            // 批量更新用户昵称为最新值，并清空user_ids
            const resetNicknamePromises = orders.map((order) =>
                limit(async () => {
                    const { id, yz_open_id } = order;
                    let userInfo = await userInfoQuery(yz_open_id);
                    let realNickName = userInfo?.latest_info?.nick_name ?? '';
                    if (realNickName) {
                        const sources = [realNickName];
                        const decryptRes = await batchYouzanDecrypt(sources);
                        let nickName = decryptRes[userInfo?.latest_info?.nick_name ?? ''] ?? '';
                        if (nickName) {
                            // 准备更新数据
                            const updateData = {
                                fans_nickname: nickName,
                                user_ids: ''
                            };
                            await YouzanOrders.update(updateData, { where: { id } });
                        }
                    }
                })
            );
            await Promise.all(resetNicknamePromises);
            // 批量更新user_ids字段
            const updateUidsPromises = orders.map((order) =>
                limit(async () => {
                    const { id, fans_nickname } = order;
                    let customerIdsStr = '';
                    // 查找企微客户信息
                    const customerIds = await Customers.findAll({
                        where: {
                            name: fans_nickname,
                        },
                        attributes: ['id']
                    });
                    if (customerIds && customerIds.length) {
                        customerIdsStr = customerIds.map(v => v.id).join(",");
                    }
                    // 准备更新数据
                    const updateData = {
                        user_ids: customerIdsStr
                    };
                    await YouzanOrders.update(updateData, { where: { id } });
                })
            );
            await Promise.all(updateUidsPromises);
            // 批量更新品牌、品类、商品id等数据
            const updatePromises = orders.map((order) =>
                limit(async () => {
                    const { id, order_number, outer_sku_id, title, store_id, goods_id, f_cate_id } = order;
                    if (!(store_id && goods_id && f_cate_id)) {
                        let goodsId = '';
                        let storeId = '';
                        let brand = '';
                        let fCateId = '';
                        let fCateName = '';
                        let sCateId = '';
                        let sCateName = '';
                        let tCateId = '';
                        let tCateName = '';

                        // 查找SKU信息
                        let skuInfo = await JstOrderItem.findOne({
                            where: { sku_id: outer_sku_id },
                            attributes: ["sku_id"],
                        });
                        if (!skuInfo) {
                            skuInfo = await JstOrderItem.findOne({
                                where: { name: title },
                                attributes: ["sku_id"],
                            });
                        }
                        goodsId = skuInfo?.sku_id ?? '';

                        if (goodsId) {
                            // 查找U8C数据
                            let taxInfo = await Tax.findOne({
                                where: { goods_id: goodsId },
                                attributes: ["brand", "f_cate_id", "f_cate_name", "s_cate_id", "s_cate_name", "t_cate_id", "t_cate_name"],
                            });
                            if (taxInfo) {
                                brand = taxInfo?.brand ?? '';
                                fCateId = taxInfo?.f_cate_id ?? '';
                                fCateName = taxInfo?.f_cate_name ?? '';
                                sCateId = taxInfo?.s_cate_id ?? '';
                                sCateName = taxInfo?.s_cate_name ?? '';
                                tCateId = taxInfo?.t_cate_id ?? '';
                                tCateName = taxInfo?.t_cate_name ?? '';
                            }
                        }

                        // 查找分仓信息
                        let jstOrderInfo = await JstOrder.findOne({
                            where: { so_id: order_number },
                            attributes: ["wms_co_id"],
                        });
                        storeId = jstOrderInfo?.wms_co_id ?? '';

                        // 准备更新数据
                        const updateData = {
                            goods_id: goodsId,
                            store_id: storeId,
                            brand,
                            f_cate_id: fCateId,
                            f_cate_name: fCateName,
                            s_cate_id: sCateId,
                            s_cate_name: sCateName,
                            t_cate_id: tCateId,
                            t_cate_name: tCateName,
                        };
                        await YouzanOrders.update(updateData, { where: { id } });
                    }
                })
            );
            await Promise.all(updatePromises);
        }
    } catch (error) {
        console.error('handleYouzanOrderFields Error ===>>>', error);
    }
    console.log('End Run Schedule Job handleYouzanOrderFields');
}

// module.exports = () => {
//     // 每天3点执行一次
//     const time = "0 3 * * *";
//     schedule.scheduleJob(time, function () {
//         handleYouzanOrderFields();
//     });
// }

module.exports = () => {
    // handleYouzanOrderFields();
    queryUserInfo();
}
