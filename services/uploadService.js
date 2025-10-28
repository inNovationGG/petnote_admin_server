const OSS = require("ali-oss");
const { ossConfig } = require("../config");
const crypto = require("crypto");
const { getCurrentDate } = require("../utils/helpers");

class UploadService {
    constructor() {
        this.client = new OSS({
            region: ossConfig.region,
            accessKeyId: ossConfig.accessKeyId,
            accessKeySecret: ossConfig.accessKeySecret,
            bucket: ossConfig.bucket,
        });
    }

    /**
     * 上传图片到OSS
     * @param {string} fileType - 文件类型（例如 'jpg', 'png' 等）
     * @param {string} fileData - 文件数据（base64 编码）
     * @param {string} [fileName] - 文件名
     * @param {string} [bucket=ossConfig.bucket] - OSS 存储桶名称
     * @returns {string} - 文件 URL
     */
    async uploadImg(fileType = "jpg", fileData = "") {
        const allowType = ["jpeg", "jpg", "gif", "png", "JPG", "GIF", "PNG"];

        if (!allowType.includes(fileType) || !fileData) {
            throw new Error("Invalid file type or empty file data");
        }

        // 去除 Base64 数据前缀
        const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        const dir = "plan";
        const ossPath = `${dir}/${getCurrentDate()}`;
        const object = `${ossPath}/${this.hash(buffer)}.${fileType}`;
        try {
            const result = await this.client.put(object, buffer);
            return result.url;
        } catch (err) {
            console.error("OSS upload error:", err);
            throw new Error("Failed to upload to OSS");
        }
    }

    /**
     * 生成文件数据的哈希值
     * @param {string} data - 文件数据
     * @returns {string} - 哈希值
     */
    hash(data) {
        return crypto.createHash("md5").update(data).digest("hex");
    }
}

module.exports = new UploadService();
