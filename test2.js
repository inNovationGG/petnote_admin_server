const obj =
{
    "code": 200,
    "msg": "",
    "data": {
        "id": 1, //推送id
        "name": "XXX", //推送名称
        "status": 0, //0-进行中，1-暂停
        "startDate": "2024-10-01", //生效开始时间
        "endDate": "2024-10-07", //生效结束时间
        "weekDayPushTime": [{ week: 1, time: "12:00" }, { week: 2, time: "10:00" }], //推送时间
        "cityLabels": "上海,北京", //城市标签
        "storeLabels": "1001,1002", //分仓id标签
        "brandLabels": "蓝氏,皇家", //品牌标签
        "cateLabels": "1001,1002", //二级品类id标签
        "skuLabels": "SKU001,SKU002", //商品id标签
        "lastOrderDay": 7, //购买天数间隔
        "lastOrderDayLimit": 7, //购买天数间隔区间
        "lockDay": 0, //防疲劳天数
        "content": "AAA", //推送文案
        "img": "https://img/", //图片地址
        "miniProgramTitle": "小程序标题", //小程序标题
        "miniProgramImg": "小程序图片地址", //小程序图片地址
        "miniProgramUrl": "小程序链接", //小程序链接
    }
}