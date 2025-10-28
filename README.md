## 目录

```bash
pet-admin-server/
    |-- .editorconfig                    # 代码编辑规范配置
    |-- .env.development                 # 开发环境配置信息
    |-- .env.production                  # 生产环境配置信息
    |-- .env.test                        # 测试环境配置信息
    |-- .gitignore                       # git忽略文件
    |-- .prettierignore                  # 代码格式规范忽略文件
    |-- .prettierrc.mjs                  # 代码格式规范文件
    |-- app.js                           # 应用程序入口文件
    |-- eslint.config.mjs                # eslint配置
    |-- jest.config.js                   # jest单元测试配置信息
    |-- package.json                     # 项目依赖
    |-- config                           # 存放配置信息
    |   |-- index.js                     # 主配置文件
    |   |-- pet_dbConfig.js              # 数据库配置
    |-- constants                        # 存放全局常量
    |   |-- code.js                      # 错误码和错误信息
    |-- controllers                      # 控制器层，处理路由逻辑
    |   |-- bi_opt                       # 模块目录
    |   |   |-- pet.js                   # 宠物模块逻辑
    |-- middlewares                      # 中间件层，存放自定义中间件
    |   |-- auth.js                      # 身份验证中间件
    |   |-- responseFormatter.js         # 接口返回中间件
    |-- models                           # 数据模型层
    |   |-- index.js                     # 数据模型主配置文件
    |   |-- pet                          # 数据库名
    |   |   |-- pet.js                   # 数据表名
    |-- routes                           # 路由层，响应前端请求
    |   |-- index.js                     # 路由主配置文件
    |   |-- bi_opt                       # 模块目录
    |   |   |-- pet.js                   # 宠物相关路由
    |-- services                         # 业务逻辑层
    |   |-- authService.js               # 登录验证服务
    |   |-- rpcService.js                # RPC远程调用服务
    |   |-- uploadService.js             # 文件上传服务
    |-- utils                            # 通用函数封装
    |   |-- excelUtil.js                 # excel处理
    |   |-- pagination.js                # 分页处理
    |-- __tests__                        # 单元测试模块
```

## 生成目录结构

```bash
Step 1: 全局安装mddir
npm install mddir -g
Step 2: cd到指定项目目录，然后执行mddir，如果提示禁止运行脚本，则执行npx mddir
npx mddir
Step 3: 在项目目录下生成directoryList.md文件
```

## 确保 SSH 隧道已建立

```bash
ssh -L 3307:rm-uf638e81g52s3c2ey.mysql.rds.aliyuncs.com:3306 root@101.133.171.118 -p 22
# 测试环境
ssh -i C:\Users\mine1\Desktop\id_rsa.txt -L 3307:rm-uf638e81g52s3c2ey.mysql.rds.aliyuncs.com:3306 root@101.133.171.118 -p 22
# 正式环境MySQL
ssh -i C:\Users\mine1\Desktop\ids_rsa.txt -L 3307:rm-uf626enmas6m4kh41.mysql.rds.aliyuncs.com:3306 root@101.133.144.37 -p 22
# 正式环境Redis
ssh -i C:\Users\mine1\Desktop\ids_rsa.txt -L 6379:r-uf6b38b90z3v0e2yir.redis.rds.aliyuncs.com:6379 root@101.133.144.37 -p 22
# 查看日志
pm2 logs --lines 1000 | grep -C 200 "ScheduleJob Cycle Add Inventory Executing"
```

## 连接数据库

PS: 使用命令行拼接密码会拒绝访问

```bash
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): Access denied for user 'test_admin'@'172.27.157.159' (using password: YES)
```

### 运行连接数据库命令

```bash
mysql -u test_admin -p -h 127.0.0.1 -P 3307 plan
```

## 使用 sequelize-auto

- -o：输出目录，用于存放生成的模型文件。
- -d：数据库名称。
- -h：数据库主机。
- -u：数据库用户名。
- -p：数据库端口（可选）。
- -x：数据库密码。
- -e：数据库类型（mysql, postgres, mariadb, sqlite, mssql）。

### 安装

```bash
npm install -g sequelize-auto
```

### 生成 models

```bash
npx sequelize-auto -h 127.0.0.1 -p 3307 -d pet -u test_admin -x 'Pet20240724#testing_A!Project' -e mysql -o "./models/pet"
npx sequelize-auto -h 127.0.0.1 -p 3307 -d pet_admin -u test_admin -x 'Pet20240724#testing_A!Project' -e mysql -o "./models/pet_admin"
npx sequelize-auto -h 127.0.0.1 -p 3307 -d pet_bi -u test_admin -x 'Pet20240724#testing_A!Project' -e mysql -o "./models/pet_bi"
npx sequelize-auto -h 127.0.0.1 -p 3307 -d pet_log -u test_admin -x 'Pet20240724#testing_A!Project' -e mysql -o "./models/pet_log"
npx sequelize-auto -h 127.0.0.1 -p 3307 -d shop_tk -u test_admin -x 'Pet20240724#testing_A!Project' -e mysql -o "./models/shop_tk"
npx sequelize-auto -h 127.0.0.1 -p 3306 -d customers_db -u root -x '' -e mysql -o "./models/customers_db"
```

## 数据库的迁移

### 生成迁移文件

```bash
npx sequelize-cli migration:generate --name add-inventory
```

### 运行迁移

```bash
NODE_ENV=development npx sequelize-cli db:migrate --config config/shop_tk_dbConfig.js
```

### 回滚迁移

```bash
NODE_ENV=development npx sequelize-cli db:migrate:undo --config config/shop_tk_dbConfig.js
```

## 使用 sequelize-cli

### 安装

```bash
npm install -g sequelize-cli
```

### 初始化

```bash
npx sequelize-cli init
```

### 生成模型

```bash
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string
```

### 生成迁移

```bash
NODE_ENV=production npx sequelize-cli db:migrate --config config/shop_tk_dbConfig.js
```
