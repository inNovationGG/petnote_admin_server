const { sequelize_pet, sequelize_pet_admin, sequelize_pet_log, sequelize_customers, sequelize_shop_tk } = require("../models");

const initializeDatabases = async () => {
  try {
    await sequelize_pet.authenticate();
    await sequelize_pet_admin.authenticate();
    await sequelize_pet_log.authenticate();
    await sequelize_customers.authenticate();
    await sequelize_shop_tk.authenticate();
    await sequelize_pet.sync();
    await sequelize_pet_admin.sync();
    await sequelize_pet_log.sync();
    await sequelize_customers.sync();
    await sequelize_shop_tk.sync();
    console.log("Databases synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

module.exports = {
  initializeDatabases,
};
