const youzanyun = require('youzanyun-sdk');
const getRedisInstance = require("../config/redisClient");
const redis = getRedisInstance();

const CLIENT_ID = "07485d54e8d7607aa8";
const CLIENT_SECRET = "861cf97d265db9a13ddc56c0b5f98281";
const GRANT_ID = "134533635";

// 1、当请求 API 时，access_token 提示失效或过期，请重新获取。
// 2、若因网络等原因未能成功获取新的 access_token，在 1 个小时内仍可重新获取，多次重复调用拿到的是同一个 access_token
// 3、开发者需要缓存 access_token，不能频繁调用，否则会受到调用频率限流，请合理使用 access_token 的有效期。
// 4、旧access_token 在有效期内，当 refresh=true 时，生成新的token，旧token会在一小时后失效;
// 旧access_token已过期，当 refresh=true 时，生成新的token；
// 旧access_token 在有效期内，当 refresh=false 时，返回旧的token，不会生成新的token，也不会给的旧token续期;
// 旧access_token已过期，当 refresh=false 时，生成新的token。
// 5、当多个店铺授权给同一个应用时，每个应用对应的店铺的 access_token 是彼此独立的，所以缓存时需要区分店铺 id。
// 6、一个店铺只能授权给一个自用型应用，而一个自用型应用可以有多个店铺授权（需要有赞云审核）。
// 7、因授权实现业务需要，建议开发者应实现 access_token 失效时重新获取的逻辑（正常情况下，生成的token有7天有效期，接口返回expires是失效时间）。
async function getYouzanyunToken(refresh = false) {
    try {
        let token = await redis.get("youzan_access_token");
        if (!token || refresh) {
            const resp = await youzanyun.token.get({
                authorize_type: 'silent', // 授权方式，固定值"slient"
                client_id: CLIENT_ID, // 有赞云颁发给开发者的应用ID
                client_secret: CLIENT_SECRET, // 有赞云颁发给开发者的应用secret
                grant_id: GRANT_ID, // 授权店铺id（即kdt_id），API接口对接传店铺id，支付商户对接传mchId
                refresh: refresh, // 是否刷新，默认为false，如需刷新access_token则值为true
            });
            const access_token = resp?.data?.data?.access_token ?? null;
            token = access_token;
            if (token) {
                await redis.setEx("youzan_access_token", token, 604800); // 设置7天的过期时间
            }
        }
        return token;
    } catch (error) {
        console.log('getYouzanyunToken error', error);
    }
}

// 查询有赞优惠券列表
async function getYouzanTickets(pageno = 1, pagesize = 20, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            request: {
                ump_type: 105, // 活动类型，6:秒杀；11:限时折扣；21：砍价0元购；23:0元抽奖；101:满减送；104:打包一口价；115:第二件半价；105:优惠券；10006:好友瓜分券
                page_no: pageno,
                page_size: pagesize
            }
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.ump.manage.activity.find',
            version: '1.0.0',
            token,
            params,
        });
        if (resp.data && resp.data.code === 200 && resp.data.data && resp.data.data.length) {
            return { success: true, data: resp.data.data }
        } else if (resp.data && resp.data.gw_err_resp) {
            // 如果token失效或过期（4202-token过期，4203-token不存在），则执行重试
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await getYouzanTickets(pageno, pagesize, retryCount + 1, true);
            } else {
                // 如果达到最大重试次数，则返回失败
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('getYouzanTickets error', error);
    }
}

// 查询有赞优惠券库存（send_stock_qty）和状态（status）
async function getYouzanTicketInfo(id, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            activity_id: id
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.ump.voucheractivity.detail.query',
            version: '3.0.2',
            token,
            params,
        });
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            let result = {
                success: true,
                data: {
                    status: 0, // -1：活动无法发放和使用，0：正常，可发放 1：已失效 2：审核中 3：已作废
                    qty: 0, // 优惠券库存
                }
            };
            const { status, send_stock_qty } = resp.data.data;
            result.data = {
                status: status || 0,
                qty: send_stock_qty || 0
            }
            return result;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await getYouzanTicketInfo(id, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('getYouzanTicketInfo error', error);
    }
}

// 订单批量查询接口
async function getYouzanOrders(startTime, endTime, page_no = 1, page_size = 100, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            start_created: startTime,
            end_created: endTime,
            page_no: page_no,
            page_size: page_size
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.trades.sold.get',
            version: '4.0.4',
            token,
            params,
        });
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            return resp.data.data;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await getYouzanOrders(startTime, endTime, page_no, page_size, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('getYouzanOrders error', error);
    }
}

// 批量解密接口
async function batchYouzanDecrypt(sources, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        // 批量解密的内容；一次最大请求不能超过10000条；
        // 注意：请求参数中请勿包含空字符，否则会导致报错code：10500，系统异常
        const params = {
            sources: sources
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.cloud.secret.decrypt.batch',
            version: '1.0.0',
            token,
            params,
        });
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            return resp.data.data;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await batchYouzanDecrypt(sources, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('batchYouzanDecrypt error', error);
    }
}

async function userInfoQuery(openid, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            yz_open_id: openid
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.users.info.query',
            version: '1.0.1',
            token,
            params,
        });
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            return resp.data.data;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await userInfoQuery(openid, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('userInfoQuery error', error);
    }
}

// 根据yz_open_id查询externalUserId（接口计费，但没有开通权限）
async function getExternalUserId(openid, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            yz_open_id: openid
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.users.customer.get.externalUserId',
            version: '1.0.0',
            token,
            params,
        });
        console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', resp);
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            return resp.data.data;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await getExternalUserId(openid, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('getExternalUserId error', error);
    }
}

// 根据externalUserid查询yz_open_id（接口不计费，但没有开通权限）
async function getYouzanOpenid(externalUserid, retryCount = 0, refresh = false) {
    const maxRetries = 1;
    try {
        const token = await getYouzanyunToken(refresh);
        const params = {
            external_user_id: externalUserid
        };
        const resp = await youzanyun.client.call({
            api: 'youzan.users.customer.get.openUserId',
            version: '1.0.0',
            token,
            params,
        });
        console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', resp);
        if (resp.data && resp.data.code === 200 && resp.data.data) {
            return resp.data.data;
        } else if (resp.data && resp.data.gw_err_resp) {
            if ((resp.data.gw_err_resp.err_code === 4202 || resp.data.gw_err_resp.err_code === 4203) && retryCount < maxRetries) {
                return await getYouzanOpenid(externalUserid, retryCount + 1, true);
            } else {
                return { success: false, data: null }
            }
        } else {
            return { success: false, data: null }
        }
    } catch (error) {
        console.log('getYouzanOpenid error', error);
    }
}

module.exports = {
    getYouzanTickets,
    getYouzanTicketInfo,
    getYouzanOrders,
    batchYouzanDecrypt,
    userInfoQuery,
    getExternalUserId,
    getYouzanOpenid
};
