const axios = require("axios");
const crypto = require("crypto");
const dayjs = require("dayjs");
const radash = require("radash");
const { Op, Sequelize } = require("sequelize");
const {
  jst_order: JstOrder,
  jst_order_item: JstOrderItem,
  jst_goods_sku: JstGoodsSku,
  jst_warehouses: JstWarehouses,
  jst_inventory: JstInventory,
} = require("../models").shopTkModels;
const { wmsPartnerList, getInventoryInfo, getSkuInfo } = require("./jstService");
const { extractProvinceCity } = require("../utils/city");

/**
 * 同步仓库列表
 * {
 *   wms_co_id: 11851118,
 *   is_main: true,
 *   name: "上海万粒网络科技有限公司",
 *   co_id: 11851118,
 *   remark1: "",
 *   status: "生效",
 *   remark2: "",
 * }
 */
async function syncWarehousesList() {
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(5);
  const { page_count } = await wmsPartnerList({ page_index: 1, page_size: 1 });
  const { datas } = await await wmsPartnerList({ page_index: 1, page_size: page_count });
  const promises = datas?.map((data) =>
    limit(async () => {
      const warehouse = extractProvinceCity(data);
      const [instance, created] = await JstWarehouses.findOrCreate({
        where: { wms_co_id: data.wms_co_id },
        defaults: warehouse,
      });
      if (created) {
        await instance.update(warehouse);
      }
    })
  );
  await Promise.all(promises);

  return datas;
}

// 根据 sku_ids 同步单仓库存
async function syncSingleInventory(data, batchArray) {
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(5);

  const promises = batchArray?.map((ids) =>
    limit(async () => {
      // 查询库存信息
      const { inventorys = [] } = await getInventoryInfo({
        wms_co_id: data.wms_co_id,
        age_index: 1,
        page_size: 100,
        sku_ids: ids.join(","),
      });

      // 获取所有需要的仓库信息
      const wmsCoIds = [...new Set(inventorys.map((inv) => inv.wms_co_id))];
      const warehouses = await JstWarehouses.findAll({
        where: { wms_co_id: wmsCoIds },
        raw: true,
      });

      const warehouseMap = warehouses.reduce((map, warehouse) => {
        map[warehouse.wms_co_id] = warehouse.id;
        return map;
      }, {});

      const inventoryData = inventorys
        .map((inventory) => {
          const warehouseId = warehouseMap[inventory.wms_co_id];
          if (!warehouseId) return null;

          const { name, ...reset } = inventory;
          return {
            ...reset,
            warehouse_id: warehouseId,
            sku_id: inventory.sku_id,
          };
        })
        .filter(Boolean);

      if (inventoryData.length > 0) {
        await JstInventory.bulkCreate(inventoryData, {
          updateOnDuplicate: Object.keys(inventoryData[0]), // 自动更新重复记录
        });
      }
    })
  );
  await Promise.all(promises);
}

// 更新所有 sku 信息
async function syncSku(skuIds) {
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(2);

  // 已在数据库内 sku
  const existingSkus = await JstGoodsSku.findAll({
    where: {
      sku_id: {
        [Op.in]: skuIds,
      },
    },
    attributes: ["sku_id"],
  });

  const existingSkuIds = existingSkus.map((sku) => sku.sku_id);
  const diffIds = radash.diff(skuIds, existingSkuIds);
  const chunkedArray = radash.cluster(diffIds, 20); // 将数组切分成每个 20 个元素的小数组

  const promises = chunkedArray.map((ids, index) =>
    limit(async () => {
      // 聚水潭查询 sku 信息
      const skuRes = await getSkuInfo({ sku_ids: ids.join(",") });
      const skuList = skuRes?.datas || [];
      await radash.sleep(1000);
      await JstGoodsSku.bulkCreate(skuList, {
        updateOnDuplicate: ["sku_id"], // 如果 sku_id 已存在，则更新其他字段
      });
    })
  );

  await Promise.all(promises);
}

/**
 * 匹配所有历史库存
 * 1. 获取 jst_order_item 表去重后 skuid
 */
async function syncHistoryInventory() {
  console.log("syncHistoryInventory: ", "call");
  // 获取所有仓库
  const warehouses = await JstWarehouses.findAll();

  console.log("warehouses: ", warehouses);

  // 获取订单表去重 sku
  const distinctSku = await JstOrderItem.findAll({
    attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("sku_id")), "sku_id"]],
  });
  const skuIds = distinctSku.map((item) => item.sku_id).filter((id) => id && id !== "商品编码缺失");

  // 同步 sku 信息
  await syncSku(skuIds);

  // 获取最新 sku ids
  const newSkuList = await JstGoodsSku.findAll({
    attributes: ["sku_id"],
  });
  const newSkuIds = newSkuList.map((sku) => sku.sku_id);

  // 将数组切分成每个 100 个元素的小数组
  const chunkedArray = radash.cluster(newSkuIds, 100);
  for (let i = 0; i < warehouses.length; i++) {
    const data = warehouses[i];
    await syncSingleInventory(data, chunkedArray);
  }

  return true;
}

async function getWmsStock() {
  // 同步仓库列表
  const list = await syncWarehousesList();
  const info = await syncHistoryInventory();
  return {
    success: true,
    data: {
      list,
      info,
    },
  };
}

/**
 * 定时同步库存
 * 1. 获取时间段内 jst_order 新增的订单，得到 id、wms_co_id
 * 2. 根据订单 id 查询 jst_order_item 的产品维度订单，可以拿到 skuid 数组
 * 3. skuid 是否落库，未落库去查询聚水潭接口，落入 sku 库
 * 4. skuid 落库完成，此时拿到了 wms_co_id、sku_id，去查询库库存信息，同步库存数据库
 * @returns
 */
async function inventoryTimedTask() {
  // 获取时间范围订单
  const start = dayjs().subtract(3, "hour").startOf("day").toDate();
  const end = dayjs().endOf("day").toDate();

  const orders = await JstOrder.findAll({
    where: { pay_date: { [Op.between]: [start, end] } },
    include: [
      {
        model: JstOrderItem,
        required: true,
        attributes: ["id", "sku_id"],
      },
    ],
    attributes: ["id", "wms_co_id"],
  });

  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(5);
  const promises = orders.map((order) =>
    limit(async () => {
      const skuIds = order.jst_order_items?.map((item) => item.sku_id);
      await syncSku(skuIds);
      await syncSingleInventory(order, [skuIds]);
    })
  );
  await Promise.all(promises);

  return {
    success: true,
    data: {
      orders: orders.slice(0, 10),
    },
  };
}

module.exports = {
  getWmsStock,
  inventoryTimedTask,
};
