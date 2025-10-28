const fs = require("node:fs");
const axios = require("axios");
const dayjs = require("dayjs");
const { Op, fn, col, Sequelize } = require("sequelize");
const csv = require("csv-parser");
const { PassThrough } = require("stream");
const FormData = require("form-data");
const ExcelJS = require("exceljs");
const getRedisInstance = require("../config/redisClient");
const redis = getRedisInstance();
const {
  labels: Labels,
  orders: Orders,
  customers: Customers,
  customer_services: CustomerServices,
  customer_labels: CustomerLabels,
} = require("../models").customersModels;

const CORP_ID = "wwc49a649fd6771baa";
const CORP_SECRET = "pm-AgJ3kEo30psaV2bp-0dq6XL4hW5BUn03yyrqeRJk";

function sleep(time = 500) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// 获取 access_token
async function getAccessToken(refresh = false) {
  let token = await redis.get("wechat_access_token");
  if (!token || refresh) {
    const response = await axios.get(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${CORP_ID}&corpsecret=${CORP_SECRET}`
    );
    token = response?.data?.access_token ?? null;
    if (token) {
      await redis.setEx("wechat_access_token", token, 7200); // 设置2小时的有效期
    }
  }
  return token;
}

// 获取客户列表（企微）
async function getCustomerList(accessToken, userId) {
  const response = await axios.get(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/list?access_token=${accessToken}&userid=${userId}`
  );
  return response.data.external_userid;
}

// 获取客户详情（企微）
async function getCustomerInfo(accessToken, externalUserid) {
  const response = await axios.get(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get?access_token=${accessToken}&external_userid=${externalUserid}`
  );
  return response.data.external_contact;
}

// 上传临时素材
async function mediaUpload(accessToken, form, type = "image") {
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/media/upload?access_token=${accessToken}&type=${type}`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data.media_id;
}

// 获取企业标签库（企微）
// group_id: 'et8cRBDgAAkiv-q9dt_4iEKli6VwUOEQ'
// group_name: '宠物订单标签',
async function getTagList(accessToken) {
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get_corp_tag_list?access_token=${accessToken}`,
    { access_token: accessToken, group_id: ["et8cRBDgAAkiv-q9dt_4iEKli6VwUOEQ"] }
  );
  return response.data.tag_group;
}

// 添加客户企业标签
async function addCustomerTag(accessToken, tag) {
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_corp_tag?access_token=${accessToken}`,
    { access_token: accessToken, group_name: "宠物订单标签", tag }
  );
  return response.data.tag_group;
}

// 编辑客户企业标签
async function markCustomerTag(accessToken, { userid, external_userid, add_tag = [], remove_tag = [] }) {
  const data = {
    access_token: accessToken,
    userid,
    external_userid,
    add_tag,
    remove_tag,
  };

  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/mark_tag?access_token=${accessToken}`,
    data
  );
  return response.data;
}

// 创建企业群发
async function addMsgTemplate(accessToken, { external_userid, content, attachments }) {
  const data = {
    access_token: accessToken,
    chat_type: "single",
    external_userid,
    text: { content },
    attachments,
  };
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_msg_template?access_token=${accessToken}`,
    JSON.stringify(data)
  );
  return response.data;
}

// 获取群发记录列表
// {
//   "chat_type":"single", // 默认为single，表示发送给客户，group表示发送给客户群
//   "start_time":1605171726, // 群发任务记录开始时间
//   "end_time":1605172726, // 群发任务记录结束时间
//   "creator":"zhangshan", // 群发任务创建人企业账号id
//   "filter_type":1, // 创建人类型。0：企业发表 1：个人发表 2：所有，包括个人创建以及企业创建，默认情况下为所有类型
//   "limit":50, // 返回的最大记录数，整型，最大值100，默认值50，超过最大值时取默认值
//   "cursor":"CURSOR" // 用于分页查询的游标，字符串类型，由上一次调用返回，首次调用可不填
// }
async function getGroupMsgList(startTime, endTime) {
  const accessToken = await getAccessToken();
  const data = {
    chat_type: "single", // 默认为single，表示发送给客户，group表示发送给客户群
    start_time: startTime, // 群发任务记录开始时间，2024-10-01 00:00:00 => 1727712000
    end_time: endTime, // 群发任务记录结束时间，2024-10-31 23:59:59 => 1730390399
  }
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get_groupmsg_list_v2?access_token=${accessToken}`,
    JSON.stringify(data)
  );
  return response.data;
}

// 获取群发成员发送任务列表
// {
//   "msgid": "msgGCAAAXtWyujaWJHDDGi0mACAAAA", // 群发消息的id，通过获取群发记录列表接口返回
//   "limit": 50, // 返回的最大记录数，整型，最大值1000，默认值500，超过最大值时取默认值
//   "cursor": "CURSOR" // 用于分页查询的游标，字符串类型，由上一次调用返回，首次调用可不填
// }
async function getGroupmsgTask(msgid) {
  const accessToken = await getAccessToken();
  const data = {
    msgid: msgid
  };
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get_groupmsg_task?access_token=${accessToken}`,
    JSON.stringify(data)
  );
  return response.data;
}

// 获取企业群发成员执行结果
// {
//   msgid: "msgGCAAAXtWyujaWJHDDGi0mACAAAA", // 群发消息的id，通过获取群发记录列表接口返回
//   userid:"zhangsan ", // 发送成员userid，通过获取群发成员发送任务列表接口返回
//   limit:50, // 返回的最大记录数，整型，最大值1000，默认值500，超过最大值时取默认值
//   cursor:"CURSOR" // 用于分页查询的游标，字符串类型，由上一次调用返回，首次调用可不填
// }
// 昨天精准推送的用户，要看下他们的下单情况，我需要的数据是，昨天筛选了多少人，推送了多少人，在这些人中产生了多少订单，订单的商品是什么
async function getGroupMsgSendResult(msgid, userid) {
  const accessToken = await getAccessToken();
  const data = {
    msgid: msgid,
    userid: userid
  };
  const response = await axios.post(
    `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get_groupmsg_send_result?access_token=${accessToken}`,
    JSON.stringify(data)
  );
  return response.data;
}

// 同步客户数据
async function saveCustomer(customer) {
  const data = {
    name: customer.name,
    type: customer.type,
    avatar: customer.avatar,
    corp_name: customer.corp_name,
    corp_full_name: customer.corp_full_name,
    gender: customer.gender,
    customer_service_id: customer.customer_service_id,
  };

  let [customerInstance, created] = await Customers.findOrCreate({
    where: { external_userid: customer.external_userid },
    defaults: data,
  });

  if (created) {
    await customerInstance.update(data);
  }

  return customerInstance.id;
}

/**
 * 1. 据客服 ID 查询客户列表
 * 2. 循环查询客户详情
 * 3. 同步数据到数据库
 * @param {string} accessToken
 * @param {string} userId
 * @returns
 */
async function synchroDataByUserId(accessToken, customerService) {
  const userId = customerService.user_id;
  const customerList = await getCustomerList(accessToken, userId);
  const len = customerList.length;
  const { default: pLimit } = await import("p-limit");

  // 设置并行处理的批次大小
  const BATCH_SIZE = 20;

  // 使用 p-limit 限制并行请求数量
  const limit = pLimit(BATCH_SIZE);
  // 创建Promise数组来并行处理获取客户信息和保存客户信息的操作
  const promises = customerList.map((id, index) =>
    limit(async () => {
      const info = await getCustomerInfo(accessToken, id);
      await saveCustomer({ ...info, customer_service_id: customerService.id });
    })
  );

  // 等待所有Promise完成
  await Promise.all(promises);

  console.log("All customer data synchronized.");
  return true;
}

/**
 * 同步客户数据
 * 米乐 16621058860 ChongBenBenWaiMai-TuiSongGuan
 * 米团 18616594376 ChongBenBen4
 * 米酒  18621530048 ChongBenBenFuLiGuan-MiYou
 * 米粉 15601870896 ChongBenBenFuLiGuan-MiFen
 * @returns
 */
async function synchroCustomersData() {
  try {
    const accessToken = await getAccessToken();

    // 获取所有客服
    const customerService = await CustomerServices.findAll();

    for (let i = 0; i < customerService.length; i++) {
      await synchroDataByUserId(accessToken, customerService[i]);
    }

    return {
      success: true,
      data: customerService.length,
    };
  } catch (error) {
    console.error("Error fetching customer list:", error);
  }
}

// 将 oss 地址转成 formData
async function transOssToFormData({ url, filename = "image", key = "media" }) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const form = new FormData();

  form.append(key, response.data, {
    filename: filename,
    contentType: response.headers["content-type"],
  });

  return form;
}

// 企微推送参数组装
async function getWechatWorkPushData(accessToken, data) {
  const ruleName = data["规则名称"];
  const productBrand = data["商品品牌"];
  const productCategory = data["商品分类"];
  const boughtDays = data["时间规则(购买多少天后)"];
  const content = data["推送内容(文本)"];
  const miniTitle = data["小程序消息标题"];
  const miniPic = data["小程序消息封面"];
  const miniPage = data["小程序page路径"];
  const image = data["推送内容(图片)"];

  const attachments = [];

  // 小程序消息
  if (miniTitle && miniPic && miniPage) {
    const form = await transOssToFormData({ url: miniPic, filename: "miniPic" });
    const mediaId = await mediaUpload(accessToken, form);
    attachments.push({
      msgtype: "miniprogram",
      miniprogram: {
        title: miniTitle,
        pic_media_id: mediaId,
        appid: "wx9be9e58fb9dc4dc2", // 宠本本到家
        page: miniPage,
      },
    });
  }

  // 图片消息
  if (image) {
    const form = await transOssToFormData({ url: image });
    const mediaId = await mediaUpload(accessToken, form);
    attachments.push({
      msgtype: "image",
      image: { media_id: mediaId },
    });
  }

  /**
   * 商品分组
   * 狗主粮 猫主粮 猫砂 猫零食 狗零食 宠物服饰配件 宠物用品
   * 猫/狗清洁用品  猫/狗保健品 猫/狗玩具
   */

  // 根据条件筛选订单，组合用户 id 去重
  // product_primary_category
  // product_brand
  // order_creation_time
  // boughtDays
  // ruleName productBrand productCategory

  // 计算 boughtDays 天前的日期
  const start = dayjs().subtract(boughtDays, "day").startOf("day").toDate();
  const end = dayjs().subtract(boughtDays, "day").endOf("day").toDate();

  const where = {
    order_creation_time: {
      [Op.between]: [start, end],
    },
  };

  if (productBrand) {
    where.product_brand = productBrand;
  }
  if (productCategory) {
    where.product_primary_category = productCategory;
  }

  const orders = await Orders.findAll({ where });

  const userIds = orders.map(({ user_ids = "" }) => user_ids.split(","));
  const uniqueUserIds = Array.from(new Set(userIds.flat()));

  const customers = await Customers.findAll({
    where: {
      id: {
        [Op.in]: uniqueUserIds,
      },
    },
    attributes: ["external_userid"],
  });

  // 筛选用户
  const external_userid1 = [
    "wm8cRBDgAAw5i4UApiexIGCYN6k-yXXA", // 1 萝卜子儿红红火火版🔥🔆🔥
    "wm8cRBDgAAcTTk5DuQwHlTL1iAqcvKqg", // 4 青豆💦
    "wm8cRBDgAAglvSHhRVhv8FI8dlVAe1rw", // 3 碧江P
    "wm8cRBDgAAWxiwkIG91guijhockx-vIQ", // 4 顾好皮🙈
    "wm8cRBDgAAc83ahQ5yqHAR7n-YP_4Jyg", // 4 02 静静
    "wm8cRBDgAAL-UJR-Jw3BXNS85jLf9wYw", // 4 德赫亚的甜甜圈
  ];

  const external_userid = customers.map(({ external_userid }) => external_userid);

  return { external_userid, content, attachments };
}

// 封装attachments参数
async function getAttachments(data) {
  const { img, mini_program_title, mini_program_img, mini_program_url } = data;
  const accessToken = await getAccessToken();
  const attachments = [];
  // 小程序消息
  if (mini_program_title && mini_program_img && mini_program_url) {
    const form = await transOssToFormData({ url: mini_program_img, filename: "miniPic" });
    const mediaId = await mediaUpload(accessToken, form);
    attachments.push({
      msgtype: "miniprogram",
      miniprogram: {
        title: mini_program_title,
        pic_media_id: mediaId,
        appid: "wx9be9e58fb9dc4dc2", // 宠本本到家
        page: mini_program_url,
      },
    });
  }
  // 图片消息
  if (img) {
    const form = await transOssToFormData({ url: img });
    const mediaId = await mediaUpload(accessToken, form);
    attachments.push({
      msgtype: "image",
      image: { media_id: mediaId },
    });
  }
  return attachments;
}

// 精准推送
async function wechatPush(data) {
  const { external_userid, content, attachments } = data;
  const accessToken = await getAccessToken();
  const pushRes = await addMsgTemplate(accessToken, { external_userid, content, attachments });
  return {
    success: true,
    data: pushRes
  }
}

// 企微推送
async function wechatWorkPush(files) {
  const excel = files.file;
  const workbook = new ExcelJS.Workbook();
  // excelData.media 可以读取到图片信息，但是相同图片会去重，而且只是单个数组，与 excel 数据对应不起来
  const excelData = await workbook.xlsx.readFile(excel.filepath);
  const worksheet = workbook.worksheets[0];

  const rows = [];
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const header = worksheet.getRow(1).getCell(colNumber).value;
      rowData[header] = cell.text;
    });
    rows.push(rowData);
  });

  // 遍历 excel 数据，进行批量推送
  const res = [];
  const accessToken = await getAccessToken();
  for (let index = 0; index < rows.length; index++) {
    const data = await getWechatWorkPushData(accessToken, rows[index]);
    const addRes = await addMsgTemplate(accessToken, data);
    // const addRes = {};
    data.add = addRes;
    res.push(data);
  }

  return {
    success: true,
    data: res,
  };
}

// 聚水潭表单字段转换
const mapOrderFields = (order) => {
  return {
    order_number: order["订单号"],
    product_name: order["商品名称"],
    order_product_status: order["订单商品状态"],
    order_status: order["订单状态"],
    order_creation_time: order["订单创建时间"],
    buyer_payment_time: order["买家付款时间"],
    recipient_name: order["收货人/提货人"],
    buyer_nickname: order["买家昵称"]?.trim(),
    buyer_name: order["买家姓名"],
    buyer_phone: order["买家手机号"]?.trim(),
    product_id: order["商品ID"],
    product_brand: order["商品品牌"],
    product_type: order["商品类型"],
    product_group: order["商品分组"],
    product_primary_category: order["商品一级分类"],
    product_secondary_category: order["商品二级分类"],
    product_tertiary_category: order["商品三级分类"],
    product_quaternary_category: order["商品四级分类"],
    product_category: order["商品类目"],
    product_spec_id: order["商品规格ID"],
    product_spec: order["商品规格"],
    spec_code: order["规格编码"]?.trim(),
    spec_barcode: order["规格条码"],
    product_code: order["商品编码"]?.trim(),
    product_barcode: order["商品条码"],
    product_attributes: order["商品属性"],
    product_unit: order["商品单位"],
    product_quantity: parseInt(order["商品数量"]),
    package_product_details: order["套餐商品明细"],
    supplier: order["供应商"],
  };
};

// 解析出有赞订单后，根据用户名匹配企微用户
const handleMatchCustomersOrders = async (results) => {
  // 获取所有用户，只返回 id 和 username
  const users = await Customers.findAll({ attributes: ["id", "name"] });

  // 创建一个映射以快速查找用户名对应的用户数组
  const userMap = {};
  users.forEach((user) => {
    if (user.name) {
      userMap[user.name] = userMap[user.name] ? [...userMap[user.name], user.id] : [user.id];
    }
  });

  // 插入匹配的订单
  const marchUserOrder = [];

  // 循环订单，买家昵称匹配企微用户
  for (const order of results) {
    const mappedOrder = mapOrderFields(order);
    const user_ids = userMap[mappedOrder.buyer_nickname];
    const statusArray = ["已发货", "交易完成"];
    if (user_ids?.length > 0 && mappedOrder.buyer_nickname && statusArray.includes(mappedOrder.order_status)) {
      marchUserOrder.push({
        user_ids: user_ids.join(","), // 企微用户可能重名，处理成字符串 38868,46798
        ...mappedOrder,
      });
    }
  }

  return marchUserOrder;
};

// 根据分类处理宠物类型标签
function getPetTypeLabels(category = "") {
  if (!category) return [];

  if (category.includes("猫")) {
    if (category.includes("狗")) {
      return ["猫", "狗"];
    }
    return ["猫"];
  } else if (category.includes("狗")) {
    return ["狗"];
  } else if (/(鱼|蜥蜴|龟|蟹|鼠|蜘蛛|蝎|蜈蚣|蜗牛|水母|龙猫|鸭)/.test(category)) {
    return ["异宠"];
  } else {
    return [];
  }
}

// 给用户批量打标签（企微）
async function batchOrdersHitLabels(orders) {
  const { default: pLimit } = await import("p-limit");

  // 使用 p-limit 限制并行请求数量
  const limit = pLimit(5);

  const promises = orders.map((order) =>
    limit(async () => {
      const { product_brand, product_primary_category } = order;

      // 猫/狗/异宠标签 宠物品种
      const petBreeds = getPetTypeLabels(product_primary_category);
      const labelNames = [product_brand, product_primary_category, ...petBreeds].filter(
        (label) => label && label !== "未分类"
      );

      // 批量查找或创建标签
      const labelPromises = labelNames.map((name) => Labels.findOrCreate({ where: { name }, defaults: { name } }));
      await Promise.all(labelPromises);

      // 同步订单数据
      const [newOrder, created] = await Orders.findOrCreate({
        where: { order_number: order.order_number, product_code: order.product_code },
        defaults: order,
      });
    })
  );

  await Promise.all(promises);

  // 并行处理获取客户标签
  const limit2 = pLimit(1);
  const promises2 = orders.map((order, index) =>
    limit2(async () => {
      const { product_brand, product_primary_category } = order;

      // 猫/狗/异宠标签 宠物品种
      const petBreeds = getPetTypeLabels(product_primary_category);
      const labelNames = [product_brand, product_primary_category, ...petBreeds].filter(
        (label) => label && label !== "未分类"
      );

      // 查找或创建标签
      const labels = await Labels.findAll({
        where: {
          name: { [Op.in]: labelNames },
        },
      });

      // 获取客户列表
      const user_ids = order.user_ids.split(",").map((id) => Number(id));
      const customers = await Customers.findAll({
        where: { id: user_ids },
        include: [
          {
            model: CustomerServices,
            as: "customer_service",
          },
        ],
      });

      for (const customer of customers) {
        for (const label of labels) {
          // 检查是否已经存在关联
          const existingAssociation = await CustomerLabels.findOne({
            where: {
              customer_id: customer.id,
              label_id: label.id,
            },
          });

          if (!existingAssociation) {
            if (label) {
              await customer.addLabel(label);
            }
          }
        }
      }
    })
  );

  await Promise.all(promises2);

  console.log("All customer data synchronized.");
  return true;
}

/**
 * 1. 解析有赞文件，获取有赞订单数据 done
 * 2. 得到有赞用户昵称，匹配微信客户 done
 * 3. 得到匹配后的用户后落库 done
 * 4. 得到匹配后的订单后落库 done
 * 5. 根据订单商品信息，给用户打标签 done
 * 6. 根据筛选条件（比如说，在什么日期范围内买过什么产品的用户，根据模版推送消息），另外增加方法
 */
async function marchWechatWorkCustomers(files) {
  const file = files.file;

  const results = [];
  const pass = new PassThrough();

  // 将上传的文件流传递给 PassThrough 流
  fs.createReadStream(file.filepath).pipe(pass);

  // 使用 csv-parser 解析文件
  const res = await new Promise((resolve, reject) => {
    pass
      .pipe(csv())
      .on("data", (data) => {
        // 处理 excel 表头空格问题
        const trimKeyData = Object.keys(data).reduce((acc, key) => {
          acc[key.trim()] = data[key] || "";
          return acc;
        }, {});
        results.push(trimKeyData);
      })
      .on("end", async () => {
        // 解析有赞订单匹配现有企微用户昵称得到的订单
        const orders = await handleMatchCustomersOrders(results);
        console.log("解析有赞订单匹配现有企微用户昵称得到的订单 orders: ", orders.length);

        // 循环订单，获取商品名称、品牌，进行打标签
        await batchOrdersHitLabels(orders);
        await addWechatWorkCustomersTags();

        resolve({
          success: true,
          message: "File uploaded and parsed successfully",
          data: orders.slice(0, 10),
        });
      })
      .on("error", (error) => {
        console.error("Error parsing CSV file:", error);
        resolve({ success: false, message: "Error parsing CSV file", error: error.message });
      });
  });

  return res;
}

// 企微标签批量新增
async function addWechatWorkCustomersTags() {
  const accessToken = await getAccessToken();

  // 找到所有标签，企微标签批量新增
  const labels = await Labels.findAll();
  const formatLabels = labels.map(({ name }) => ({ name }));

  /**
   * group_id: 'et8cRBDgAAkiv-q9dt_4iEKli6VwUOEQ'
   * group_name: '宠物订单标签',
   */
  for (let i = 0; i < formatLabels.length; i++) {
    const label = formatLabels[i];
    const addCustomerTagRes = await addCustomerTag(accessToken, [label]);
  }

  const tagRes = await getTagList(accessToken);
  const tagList = tagRes?.[0]?.tag || [];
  const tagMap = tagList.reduce((acc, tag) => {
    acc[tag.name] = tag;
    return acc;
  }, {});

  // 开始对用户打标签
  const customers = await CustomerLabels.findAll({
    attributes: ["customer_id", [Sequelize.fn("GROUP_CONCAT", Sequelize.col("label_id")), "label_ids"]],
    group: ["customer_id"],
  });

  // 使用 p-limit 限制并行请求数量
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(10);
  // 创建Promise数组来并行处理获取客户信息和保存客户信息的操作
  const promises = customers.map((item, index) =>
    limit(async () => {
      // { customer_id: 48, label_ids: '95,96' }
      const customerData = item.toJSON();
      const label_ids = customerData.label_ids.split(",").map((id) => Number(id));
      const [customer, labels] = await Promise.all([
        Customers.findByPk(customerData.customer_id, {
          include: [
            {
              model: CustomerServices,
              as: "customer_service",
            },
          ],
        }),
        Labels.findAll({ where: { id: { [Op.in]: label_ids } } }),
      ]);

      const { external_userid, customer_service } = customer;
      const labelName = labels.map(({ name }) => tagMap[name].id);
      await markCustomerTag(accessToken, { userid: customer_service.user_id, external_userid, add_tag: labelName });
    })
  );

  await Promise.all(promises);
}

/**
 * 查询推送后复购率
 * 用户怎么来的？（推送逻辑）
 * 根据买过蓝氏、猫主粮的用户，获取到名字
 * 根据名字查询企微客户，查到 1314 个
 */
async function pushCustomerPurchases({ userIds, start, end }) {
  // 推送过产品的所有用户
  const customers = await Customers.findAll({
    where: {
      external_userid: {
        [Op.in]: userIds,
      },
    },
    attributes: ["name"],
  });

  // 获取用户名去重
  const customerNames = customers.map(({ name }) => name);
  const customerNamesSet = Array.from(new Set(customerNames));

  // 根据名字查询所有订单
  const orders = await Orders.findAll({
    where: {
      buyer_nickname: {
        [Op.in]: customerNamesSet,
      },
    },
    attributes: [[fn("DISTINCT", col("order_number")), "order_number"], "buyer_phone", "buyer_nickname"],
  });

  // 所有订单的手机号去重
  const buyerPhones = orders.map(({ buyer_phone }) => buyer_phone);
  const buyerPhonesSet = Array.from(new Set(buyerPhones));

  // 查询日期范围内所有订单
  const startTime = dayjs(start).toDate();
  const endTime = dayjs(end).endOf("day").toDate();
  const betweenTimeOrders = await Orders.findAll({
    where: {
      order_creation_time: {
        [Op.between]: [startTime, endTime],
      },
    },
    attributes: [[fn("DISTINCT", col("order_number")), "order_number"], "buyer_phone", "buyer_nickname"],
  });

  const matchOrders = betweenTimeOrders
    .filter(({ buyer_phone }) => buyerPhones.includes(buyer_phone))
    .map(({ buyer_phone }) => buyer_phone);
  const matchOrdersSet = Array.from(new Set(matchOrders));

  return {
    success: true,
    data: {
      matchOrdersSet: matchOrdersSet,
      matchOrdersSetLen: matchOrdersSet.length,
      buyerPhonesSet: buyerPhonesSet,
      buyerPhonesSetLen: buyerPhonesSet.length,
      radio: matchOrdersSet.length / buyerPhonesSet.length,
      pushUserLen: userIds.length,
    },
  };
}

module.exports = {
  synchroCustomersData,
  marchWechatWorkCustomers,
  wechatWorkPush,
  pushCustomerPurchases,
  getGroupMsgList,
  getGroupmsgTask,
  getAttachments,
  wechatPush
};
