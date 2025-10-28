const crypto = require('crypto');

const expireTime = 60; //请求过期时间
class SimpleSign {
  /**
   * 获取数据签名
   *
   * @param token 安全校验码
   * @param timestamp 时间戳
   * @param nonce 随机字符串
   * @returns 签名字符串
   */
  static getSign(
    token,
    timestamp,
    nonce,
  ) {
    const signArr = [token, timestamp.toString(), nonce];
    signArr.sort();
    const signStr = signArr.join('');
    return crypto.createHash('sha1').update(signStr).digest('hex');
  }

  /**
   * 校验数据签名
   *
   * @param signature 接口收到的签名
   * @param timestamp 时间戳
   * @param token 安全校验码
   * @param nonce 随机字符串
   * @returns 签名是否正确
   */
  static checkSign(
    signature,
    timestamp,
    token,
    nonce,
  ) {
    if (Date.now() / 1000 > timestamp + expireTime) {
      return false;
    }

    const tmpArr = [token, timestamp.toString(), nonce];
    tmpArr.sort();
    const tmpStr = tmpArr.join('');
    const tmpSign = crypto.createHash('sha1').update(tmpStr).digest('hex');

    return tmpSign === signature;
  }
}

module.exports = SimpleSign;
