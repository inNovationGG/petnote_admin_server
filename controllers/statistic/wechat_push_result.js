/* eslint-disable no-unused-vars */
const {
    sequelize_customers,
} = require("../../models");
const {
    wechat_push_results: WechatPushResults
} = require("../../models").customersModels;
const { Op, QueryTypes } = require("sequelize");
const moment = require("moment");
const _pushRes = {
    "code": 200,
    "msg": "",
    "data": [
        {
            "external_userid": [
                "wm8cRBDgAACg0_CEl5uopqUjXT3VRscA",
                "wm8cRBDgAAbJ3jQCi5eBLT_0rWeuSqRw",
                "wm8cRBDgAAdafOpg0Rg2jD6Axn6CmDhw",
                "wm8cRBDgAABl5xgbJUN44Yl-kW7AE6Bw",
                "wm8cRBDgAAKu7HpON4W6snFKbtusvV0Q",
                "wm8cRBDgAAM5uYNsg5BzneXVF-CACoaQ",
                "wm8cRBDgAA8DmXs9eOlxG9ZepGTxDRvQ",
                "wm8cRBDgAA84TpSMpuO2NDKwWS7yc7fQ",
                "wm8cRBDgAABHI34iitJzeXa86my6qznw",
                "wm8cRBDgAAcWja-ZX_HYHolFe52ACicA"
            ],
            "content": "喵～主人，猫砂告急\"₍˄·͈༝·͈˄*₎◞ ̑̑\n快帮我换新，保持清洁～🐾\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得多买点哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|猫砂专场",
                        "pic_media_id": "31vr9l0rCnyjv9nhl9-L_oicq4kbCv8Yjp5ad6DHn0Yq3Wy4kGk8mT_x2VvUUnRlu361R8nmW-r9cXd4zS_nn0Q",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3DTKk3lhSH0g%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 0,
                "errmsg": "ok",
                "fail_list": [
                    "wm8cRBDgAAbJ3jQCi5eBLT_0rWeuSqRw",
                    "wm8cRBDgAAdafOpg0Rg2jD6Axn6CmDhw",
                    "wm8cRBDgAABl5xgbJUN44Yl-kW7AE6Bw"
                ],
                "msgid": "msg8cRBDgAArFHVDmeJfy50K0d2D9MMww"
            }
        },
        {
            "external_userid": [
                "wm8cRBDgAALczqXQq291N7YUS1ZW6rsQ",
                "wm8cRBDgAAQ5qxaO7UTzmX_v_tbq_EFg",
                "wm8cRBDgAANLDEWgMUoAufgU5N9shmFA",
                "wm8cRBDgAATKgUm6MBG7wLH50QPsB6sg",
                "wm8cRBDgAA0HTLFm0uDas29t6Za_KTPQ",
                "wm8cRBDgAAfXTaCdJX28kbhXlerxwG7A",
                "wm8cRBDgAAZgbqFC0Dzkynn6GemfUSQQ",
                "wm8cRBDgAAUJAiMaNkcOHAe38YHBdb5Q",
                "wm8cRBDgAA6nkGICIvlaQfcVFbR0ChqA",
                "wm8cRBDgAAVvw6BMiVCHktprLQGxlfHg",
                "wm8cRBDgAAd65Z_glnZRL8_j9Rh47EQA",
                "wm8cRBDgAAcRL2zO7BS0ijvl430JGefg",
                "wm8cRBDgAAzsOPkD5YswoTYx0YayHL1g",
                "wm8cRBDgAA62ilRvI8_RbKkBfTf6-cUg"
            ],
            "content": "🐾喵～主人，我的粮快吃完了，快给我囤粮🐈⁾⁾️\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得买大包哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|猫粮专场",
                        "pic_media_id": "3FgcrJQqmTWUr3RWiK4YT6a92lci7x6w824cU3q3eS6qQEr6YR-5mby7kyj_fqGmTkvXGJ5Z-LdaVdQcFHLANUw",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3Db3IIwwo4fL%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 0,
                "errmsg": "ok",
                "fail_list": [
                    "wm8cRBDgAAQ5qxaO7UTzmX_v_tbq_EFg",
                    "wm8cRBDgAA0HTLFm0uDas29t6Za_KTPQ",
                    "wm8cRBDgAATKgUm6MBG7wLH50QPsB6sg",
                    "wm8cRBDgAAzsOPkD5YswoTYx0YayHL1g"
                ],
                "msgid": "msg8cRBDgAAKTj4sGw5udCEShFbvjsSBg"
            }
        },
        {
            "external_userid": [
                "wm8cRBDgAAWHXHYe3Do4EDZTBBU8t2kw",
                "wm8cRBDgAA_ymDy6Vt7F3IrMl6NwCvNQ",
                "wm8cRBDgAAO-Cmdof0QfmW7wl_f11yYw",
                "wm8cRBDgAAzEJzh195LTaYEkDJuuKdlw",
                "wm8cRBDgAAElKh7DmFx9gpdXEBA0Bvng",
                "wm8cRBDgAA3tWC6ukkPysdBlUSYHi9ww",
                "wm8cRBDgAADzB0Je2MM_bCIkeqrJpCPg",
                "wm8cRBDgAAqkuXhDahqcmyBYbzc_y2JQ",
                "wm8cRBDgAANRbGQtepA8Nyy7D5Vx5ODA",
                "wm8cRBDgAALcazqi12k2ZENAY9XhFMQw",
                "wm8cRBDgAA5PN2vCrI_kz6pL_849MbIA",
                "wm8cRBDgAAsnG0Hu6pe16dL9qyhbvctw",
                "wm8cRBDgAAsBVL9DE0YVNdg8z5Z4Z9sA",
                "wm8cRBDgAAxf9pP9k2fyS_eV8rqkj4_w",
                "wm8cRBDgAABv8d4jxu0fJ8_iVQZe0iYg",
                "wm8cRBDgAA1nCZdAOUttyxyr_N9PhY4Q",
                "wm8cRBDgAAr0UZsnzVr4O2aP1PaxuqYw",
                "wm8cRBDgAA0qBCl5VFlChAwMO4AL2WPA",
                "wm8cRBDgAAH-XIYXcygxT0shRuDwr_bQ",
                "wm8cRBDgAAloPzobdOnQ5VH2jx_yZnWg",
                "wm8cRBDgAAZKFr7JNJRoSlSh5JoJ3Nrg",
                "wm8cRBDgAAaAirY-ovMnKVsQNLodUnmw",
                "wm8cRBDgAA5edAWEnTWo4s1WefWP8-bw",
                "wm8cRBDgAA0oI7PUIGaZQQJjV3_uuUOQ",
                "wm8cRBDgAAvpZP-i7gT5CwU-8eD_-3Ew",
                "wm8cRBDgAAW6r9hyWKLjJHOG1hxfTC_w",
                "wm8cRBDgAAd7-q-nHcIdiJhfkBz0Ry1w",
                "wm8cRBDgAApGeBvEwDxzUssWhEqqS3Bg",
                "wm8cRBDgAAtAWN_qzsufhZwZuXS-adMg",
                "wm8cRBDgAApy3m9kN5C-qJUubveKBwLQ",
                "wm8cRBDgAAom3zjhAnaNLQq46LThZvXw",
                "wm8cRBDgAAd8T5zURC2E0Qh1XHUElcNw",
                "wm8cRBDgAA6NVysQhwM-w6fRHyLmT8Og",
                "wm8cRBDgAA67nY4toQhiD5cx7fmIwwKw",
                "wm8cRBDgAA05aXpMRa9OygFJc-TTXafw",
                "wm8cRBDgAAIvboinPwxlPW-Fk1uFgpxw",
                "wm8cRBDgAApF4SF05MJozq-BekIoB8Vw",
                "wm8cRBDgAAxRuJE9vWTxYA_RqZP045iQ",
                "wm8cRBDgAA3DwSwrz1duVQO9dqIag88w",
                "wm8cRBDgAAUUQ33rYI7USA0DHv0BOWnA",
                "wm8cRBDgAA5CXFVjyPIXPBWFoB-C_4pw",
                "wm8cRBDgAAuszobhE1nwsiI6sqaJuZQg",
                "wm8cRBDgAA6OWhjfNgmue7X0YTxHJj3w",
                "wm8cRBDgAA4fq0N9VEWNG8N2jhSNBLSg",
                "wm8cRBDgAAHEXV0vn_W1M4AP_KYTNa7A",
                "wm8cRBDgAAG9SwR1lJjW0xtZVxvB26Bg",
                "wm8cRBDgAAbkyNbLCevYuEnUtdXk2Emw",
                "wm8cRBDgAAwIEL8IF8o1zc76i0xpWoiw",
                "wm8cRBDgAAijAoy2JjrVs5fZYLAEfJRA",
                "wm8cRBDgAAL_4jZprFQoM2cu_9wny8KA",
                "wm8cRBDgAApUOx8es2hl2IG_IEN-yXmA",
                "wm8cRBDgAAkk8GqdtiblwxMgK-Qoq_QQ",
                "wm8cRBDgAAmHkb_LMgUaBU2zHR80cWag",
                "wm8cRBDgAA97vQpcpoOgZdECDBbSVXcQ",
                "wm8cRBDgAApc1JaKmqsDmqVW2dhwx6RQ",
                "wm8cRBDgAA-8S0i9T_QWZnIjf96TRX1Q",
                "wm8cRBDgAAG85FVUdqdH8om3bldacEOg",
                "wm8cRBDgAAgXC_-rt0RjnDUb0vL2dONQ",
                "wm8cRBDgAAAovqXDDrKYGB32jyyIAsyA",
                "wm8cRBDgAA62_XQohLuwEv0ETYK20rqw",
                "wm8cRBDgAAafPhPm7GDkOA3tYPw5Wr6Q",
                "wm8cRBDgAAlDNheTm3MXNbEjFJ2NLFCg",
                "wm8cRBDgAAKn4BHnC43kNHVihqLvF1BQ",
                "wm8cRBDgAA6GrDHBq-2Hv9_SbncTj-0w",
                "wm8cRBDgAAfEsTxvOr9Ry_eDkCLmzwGA",
                "wm8cRBDgAAEJpZIW34rPr04wYjU4JZww",
                "wm8cRBDgAAPmqL5Gf5-pRviBQ6zelcSw",
                "wm8cRBDgAAmqMQlGyrRDZKDMyXXkngow",
                "wm8cRBDgAA_guGFIHZkDMSU-IVAJpBaA",
                "wm8cRBDgAA5fRrP3H9Lp8lY_sJWZUq2A",
                "wm8cRBDgAAqhlX4EgMWw15ib37oT3Uww",
                "wm8cRBDgAA8xIQArMTfekbjQhpShqXCw",
                "wm8cRBDgAA5Zvqw6_HPIsgbg9_pWu0Lg",
                "wm8cRBDgAAhti2_6DLAQ7xuCvoeegUYA",
                "wm8cRBDgAAJ438ZqCmXsJfcqOyrcEN7Q",
                "wm8cRBDgAAMJUeEUhT_v1WguVIlZ8q-g",
                "wm8cRBDgAAAznbI7z-XvcTA06bflVB3w",
                "wm8cRBDgAANN1-JXGJsf9T76PLAjM5Wg",
                "wm8cRBDgAAd3QH8FwgzdLEx4Ab9IvOhA",
                "wm8cRBDgAAqqBqF5GcNjtoHuff1GKu2w",
                "wm8cRBDgAAF-8sGllmeThgCoe1JBuoKg",
                "wm8cRBDgAAIapHsZe-aN15FUhn7TLZ4g",
                "wm8cRBDgAA5NQDzx5XcZORrRnR5GUslw",
                "wm8cRBDgAAD1GwfSNThn13G6gF3J6abw",
                "wm8cRBDgAArEiGTQZwNyHS48lzRKHv3w",
                "wm8cRBDgAAzOx9DZWo8GwgbTXbkYeOZA",
                "wm8cRBDgAASKR613348pNqbrnq58hbPg",
                "wm8cRBDgAA9yLOtH2MYqhRLUfcMNasdA",
                "wm8cRBDgAATL83bVN17YyT4lC46TIlDg",
                "wm8cRBDgAANt8PgFn7-ATosvX9IVTikw",
                "wm8cRBDgAAJ3Otl94gkiir32eEbAF07A",
                "wm8cRBDgAA8b4BKWzNPDRgR2tzBzfwiA",
                "wm8cRBDgAAryakFXWNeZSEhZQIU7Xtvw",
                "wm8cRBDgAAPHA9OxDZLK3V8JOEqoK5Wg",
                "wm8cRBDgAAvpl9wTgLpudNsqDDa3rgmQ",
                "wm8cRBDgAAyGEdlsrNZIXqQr8hF_H-xQ",
                "wm8cRBDgAAaFicOGhvRFrPeGF5Tl7QDA",
                "wm8cRBDgAAevG04cD7lTisKzvrl5mqrQ",
                "wm8cRBDgAAMwHRuWTiJAbkbs_kGjXILw",
                "wm8cRBDgAABJjh3JkKd5KFAiog0YKP2Q",
                "wm8cRBDgAAT_w0po9jIzhk24Rr5y1DIg",
                "wm8cRBDgAAZM9p4WFGG_AznGeIw2NWoA",
                "wm8cRBDgAAuMrG-3jMxJWytLIqTtsXkQ",
                "wm8cRBDgAA6LCoFqMAYmVMpDJeXWbm5w",
                "wm8cRBDgAAfxJ4_2YOn6oUGCUuq-wb9A",
                "wm8cRBDgAAyEaFKwz-YYdiy1SKfdprZw",
                "wm8cRBDgAACAp7LA5QlzIQ10fJkkwP0Q",
                "wm8cRBDgAA2v_wuxTGBGRHlMs2waZf4w",
                "wm8cRBDgAA51hIyQOv-SGc-fELNp0cwg",
                "wm8cRBDgAAh1WUgvJCw39Qhirlkje_Ww",
                "wm8cRBDgAAOoXxurwSSqakjJp8AJfRMg",
                "wm8cRBDgAAM0kxhTuf__45uEyw4Sz3TA",
                "wm8cRBDgAAHbfK_TbbU6f-bwrZLmqVIQ",
                "wm8cRBDgAAhTose8OrVnc3_loMyyResg",
                "wm8cRBDgAAUGP2dI4jTuKe6EyD8DDBsw",
                "wm8cRBDgAAAq5EZjC8HUudR2H6tHjhsQ",
                "wm8cRBDgAA0oUfBg5PoKhrX9docCmI7Q",
                "wm8cRBDgAAmJQbT6YmYFfkGgQ25tNQQw",
                "wm8cRBDgAA3JzGhiJhvVLULzSKeGGv4g",
                "wm8cRBDgAAx_bTYAgxqDCytiGB60cN5Q",
                "wm8cRBDgAAVobLosfCsU8n-_dEscJ-UA",
                "wm8cRBDgAA9A6KC5L90B6ng-64VfBoHg",
                "wm8cRBDgAAVuzkmaZdd3LK2U6ln3ZOKA",
                "wm8cRBDgAALK8cFCkQS-xWNxJkNaNYkQ",
                "wm8cRBDgAA9zagRnNap1uPSFhwcB77tQ",
                "wm8cRBDgAAitgwsJDt6Rw1k3EvxQFphA",
                "wm8cRBDgAAwVcmjUBHn58hSp7oZJ8vQw",
                "wm8cRBDgAAsDE5uZ9kUvk2NwYgGEtN-Q",
                "wm8cRBDgAAZ2JFUnJjCJU0G5decA0fPw",
                "wm8cRBDgAA7kGpd7MUNoR4BtEamycZKw",
                "wm8cRBDgAAlPqp3hyuvvs66IjcKG4OFw",
                "wm8cRBDgAAcqDmYiMcdePz93OYX_H2ug",
                "wm8cRBDgAAMc_1oJmZ0EPUIwKaDnINvw",
                "wm8cRBDgAAGo02lWkCEt6mKH3QDda74g",
                "wm8cRBDgAAXNAT_QJ3aSHZe3AqTkvm5Q",
                "wm8cRBDgAAEYu3LdFdsBAqzPgSrDyPOA",
                "wm8cRBDgAAdafJce8LHYIM_EZK2YHhSw",
                "wm8cRBDgAA5Q5dgqcRMze5904T7D65HA",
                "wm8cRBDgAA5FYIMrDA-i8ixhIoKQteJQ",
                "wm8cRBDgAA2GKaetG3ehu-GQo-U0bFtg",
                "wm8cRBDgAAcx5jBEQYi8Lhphs48CrLxw",
                "wm8cRBDgAAJ3ZCuSj2ZlLUqV-jY8HuYg",
                "wm8cRBDgAAnqy9rswGcgqDb1nFCWO5mQ",
                "wm8cRBDgAAWU3AshE-dwGHcFXYHEOFqg",
                "wm8cRBDgAA74UT0Vt7tANC_avmFjcz3Q",
                "wm8cRBDgAA9HCcNcIuEHO5OB2apUCP0A",
                "wm8cRBDgAAHVNKWPkriL554wG4VKPxJA",
                "wm8cRBDgAAsg5FXr0ENRge4sFJU95Qpw",
                "wm8cRBDgAAzBEmMNvJ6gn3rTqQgufdFg",
                "wm8cRBDgAA0NASpJuL-CexC0WjniNNWg",
                "wm8cRBDgAAkLMdZIpwntZ4S0JQqcAPPQ",
                "wm8cRBDgAAA-dVv8xKLfVIcy9AtshYGg",
                "wm8cRBDgAANJbcO-tyuC_H_y8WsYbAYg",
                "wm8cRBDgAAzx4KdjmH2l2PQ7jLatz6Cg",
                "wm8cRBDgAAiIk8Pd16f5jFXb3J-0q8Pg",
                "wm8cRBDgAAmmEtKSGK0TZ6O2Mwreclug",
                "wm8cRBDgAAtXu1_laOlB7pP4O3Oda5CA",
                "wm8cRBDgAAJlYpgvz8ysKxF7v4IllX6Q",
                "wm8cRBDgAAIax3QL_mM5Aip_7ZMGx0lQ",
                "wm8cRBDgAAkfIiU7tIvDgbNEdjFiLftg",
                "wm8cRBDgAAMfmS8fRxxu1JVKisDORTVQ",
                "wm8cRBDgAAwlLK8kLuioqNznP7NsjPsg",
                "wm8cRBDgAAX1I1J4wy7Or_qA0WTdiKkQ",
                "wm8cRBDgAANM-3xCWvd3jhph3NlS87Uw",
                "wm8cRBDgAA3rfwAph1W7Aycfd9zLESMQ",
                "wm8cRBDgAAlE1iEQSCr2Cs3MXtC2ylNA",
                "wm8cRBDgAAtsiJmF9f1QM1d0IbMGUmpw",
                "wm8cRBDgAAniw6v0QZYiMA9Ig1zaMe_Q",
                "wm8cRBDgAACGTuPKp8e-aRzkBvtyFpug",
                "wm8cRBDgAAfOr1iSj4cHXuSwfyEleaMQ",
                "wm8cRBDgAAWAiXJZW2swUi5zr42hDKDw",
                "wm8cRBDgAAuNyZc5kgdj6HE4V4MNCMpw",
                "wm8cRBDgAABYOdGxsoHEBYXlS6Fk5m4w",
                "wm8cRBDgAAkH7jxM5jOTUeyq0ojRzuVA",
                "wm8cRBDgAA8bfLtfp_9iQ-pPlvdhb-Qg",
                "wm8cRBDgAABAjCldjT8V7N5wvdqVtkxA",
                "wm8cRBDgAA6Zxy8nwEIL3mb19ELDKFag",
                "wm8cRBDgAAlKtgZ70b6jwdShj6CM6dSg",
                "wm8cRBDgAAu5zi23tCZMxFpNuqn-E9Og",
                "wm8cRBDgAA0xikCbOCPmpX45At_FP99Q",
                "wm8cRBDgAAt9-6l9hcyUWFKcErqw0-lg",
                "wm8cRBDgAA7qhZoYC0AFu42s7R3Ws69Q",
                "wm8cRBDgAACZxqI-1KOxUpU8ifFaRTTQ",
                "wm8cRBDgAA2N15pBBmKtWO6EI9xDPQ_g",
                "wm8cRBDgAAdBVEFEfuy6qYH5I9UKT1cQ",
                "wm8cRBDgAAYYYmnMkaeHNKA1u18uEDlQ",
                "wm8cRBDgAAHAXYjzXKPaeq2Adu31SUZw",
                "wm8cRBDgAAUwj1KIUQZHEvT0D5ym17qA",
                "wm8cRBDgAAXVEsLCxGCLbNRUC_XIReUw",
                "wm8cRBDgAAm8sUbsulQtcCkCZTmh36zg",
                "wm8cRBDgAA3wFq7l0slTYZXBT-EvT8rA",
                "wm8cRBDgAA6v_Dkf6McUIEuGBmvXmRXA",
                "wm8cRBDgAA4ocaJYysv_mQZaLk0V14SA",
                "wm8cRBDgAAqz57tePCzg2rL7Dft_ROVg",
                "wm8cRBDgAA8sIEYt5DwldbCHIVVdXqCQ",
                "wm8cRBDgAAuz5zoSJp6fQf98vnVBWu_Q",
                "wm8cRBDgAAMDTGr2keOWOn7W7GRiI34g",
                "wm8cRBDgAAX1k__Tumu6W81JhxdULwEw",
                "wm8cRBDgAApv0HOz4BpK84aCnYGs6rtw",
                "wm8cRBDgAAHTalJYmsj-XEH9P17souAQ",
                "wm8cRBDgAA6o5UztGFLqgfXP1DXeE1tQ",
                "wm8cRBDgAAVzSxXnEPdv81p7f6MCZ_Aw",
                "wm8cRBDgAAwDBA3cq80E-8cVDeFYTj0w",
                "wm8cRBDgAAun9rujjmF-9ZMskE-y5BdQ",
                "wm8cRBDgAAGf1AvaX4CWsDFCxyPJqfrQ",
                "wm8cRBDgAA6owmJB4i6aoeJ5smM1MP5w",
                "wm8cRBDgAAvgeYu3JApDOyJ-lYMX7s2g",
                "wm8cRBDgAAC6OQLMivLwX0z46LKznQAQ",
                "wm8cRBDgAAEMWPz39OK33-Nq8MbAN-iA",
                "wm8cRBDgAAWjYjqs8ka5_3Qc0na5GMUA",
                "wm8cRBDgAAju8bRTXdurKpPUZBXUEPzA",
                "wm8cRBDgAA3urmms0GItf-0Oscm7IblA",
                "wm8cRBDgAAnrOmwU5e1soPzVhtktoUTQ",
                "wm8cRBDgAAE8Lm3rlKqTfmlX-xlcnUKA",
                "wm8cRBDgAAAz_iPEzbNKgAAP-Yp16Ovg",
                "wm8cRBDgAAObcnu8bqYfYGW3UzQnesMg",
                "wm8cRBDgAApCG2JgORDBbdFK-_2gFBEg",
                "wm8cRBDgAAsmBd6PjLXCEG2OHzBrWgEw",
                "wm8cRBDgAAHumF9oaz-byxR6_v3zf3Jg",
                "wm8cRBDgAAB30VRNflwB2EkrKeBuBI-Q",
                "wm8cRBDgAAtuDFKYxAB-hUDMioDxce5A",
                "wm8cRBDgAA0SXM34_dNOwpXM_7cQlCLQ",
                "wm8cRBDgAANpyf3MK0vzbE5KjP1tBvGw",
                "wm8cRBDgAAzibqA3xTxjudtMgXjQZkKw",
                "wm8cRBDgAAnn-9LWIsyEIJYy8Bfej64Q",
                "wm8cRBDgAAxqrecS6Dba7UjUb-J0yztA",
                "wm8cRBDgAAnBHklYl3dEnSvG799sZ-QA",
                "wm8cRBDgAABQHdOuUbVcoMik7fqBY2Xw",
                "wm8cRBDgAAa-i8nFvfl4eflszz9BWsGA",
                "wm8cRBDgAAiN1jlDXNT3PJfc16jKQzAQ",
                "wm8cRBDgAAvdXzG7lFvkj8DGyOguq_MA",
                "wm8cRBDgAAjHxAhNyBoUGy6f4_egPrFQ",
                "wm8cRBDgAAQxZG881UWR5EzP1Me2DdUg",
                "wm8cRBDgAArq3ltA5HU0rY_1LdWifxAA",
                "wm8cRBDgAAjUSGKemeilY93R0GJmGG3Q",
                "wm8cRBDgAA9UJFobH40sayrnDiwtHCEQ",
                "wm8cRBDgAAw5JvJAm166P-9DjMKtlhVQ",
                "wm8cRBDgAA4umlYI_5UA8FNAviwu_2Qw",
                "wm8cRBDgAALcOla64cTmqCiKHcW86PwQ",
                "wm8cRBDgAA4gmfY_E9UrXXd6qvYulhYw",
                "wm8cRBDgAAaTCSjNALeP20U2jOiORSpw",
                "wm8cRBDgAAdwH_I6Wsw6nB2FCao9RPjg",
                "wm8cRBDgAAEonYRF3mLSVBNbl6A0RvOw",
                "wm8cRBDgAAvsO2hoaSKsc4veRF3QP0Hw",
                "wm8cRBDgAAu3_NGgNL6dzt3mLec-GHeg",
                "wm8cRBDgAAgla4gbeam8Mfvwm5Jx6dtg",
                "wm8cRBDgAAF5raz3iT8IvpUCMxwfOnpQ",
                "wm8cRBDgAA7O6HanOHnSPyOdZ8PyArWw",
                "wm8cRBDgAA22VGRoYcPxIW7WzYlehpuQ",
                "wm8cRBDgAAinucJeBFZ9yvkgEEmM-QeA",
                "wm8cRBDgAAAJ996E7rBVh29Fck1oxbsA",
                "wm8cRBDgAAlB2ofmndVcS6PKUOQ7yGwg",
                "wm8cRBDgAAklZjBTPcPmRYgJjMvUmrzg",
                "wm8cRBDgAApQ-NrgdkCMV0IR2wl1mFNg",
                "wm8cRBDgAABNtuyl3Ai1cfUA-s27d6eA",
                "wm8cRBDgAA3zweiKaTZBdyLrYJeanapw",
                "wm8cRBDgAAabr0J9sBGChKVRAdPQIkmA",
                "wm8cRBDgAAjmW-j1-v5F0WMRn6RGjNgg",
                "wm8cRBDgAAZ0ho4khXm4kMvsoqKWYmBQ",
                "wm8cRBDgAAWJ6Kw6afBgMBLLHH2ufZIg",
                "wm8cRBDgAA95pgWYbtnsvBZI9DXR5bXg",
                "wm8cRBDgAA0iGSzWUnoOpJqNPDtdMzRw",
                "wm8cRBDgAAupnPjk2V1coF6HjseEZVVA",
                "wm8cRBDgAAkSp8zBEIfcQZZe3FN8VbMA",
                "wm8cRBDgAAHOHF6ybPUxkxUfXVgFwK-g",
                "wm8cRBDgAAjXJmyv1lRC8APMb6qRFawQ",
                "wm8cRBDgAARhBIFkr2NiQ_gnVcORNrvA",
                "wm8cRBDgAAMha4ugjB5TFlaPzKgD2Icg",
                "wm8cRBDgAAd8jGVVIJmDdhb722jtVd2g",
                "wm8cRBDgAAwWhUsWI7PKxGHmkJXyEM4A",
                "wm8cRBDgAAus_fwgehlLk2OZcS1vyfoQ",
                "wm8cRBDgAA8w_ycYc0q1WNHwbrSWw9eA",
                "wm8cRBDgAAYSWR7GEz7-1xrpcuG80hnA",
                "wm8cRBDgAAMOX3gR2U0J2nC-WwE-HpSg",
                "wm8cRBDgAAj3kOakxUdgg4o6wKVKEilQ",
                "wm8cRBDgAAWCtPe62w0ipNmN6-W_-ixw",
                "wm8cRBDgAAw8nmmuQJVXYxPiWESwu-6w",
                "wm8cRBDgAAlaiYcQ6hl3_pCp4PuIr3VQ",
                "wm8cRBDgAA4sQMob1p-ympy2wT3-0ZuQ",
                "wm8cRBDgAAADUSkWPSnc3JpdMFtZnAsQ",
                "wm8cRBDgAA4JRz4htmBFdkLhTOGYFr8Q",
                "wm8cRBDgAAp-4QpAiH8ZIjR0rVR4YN3w",
                "wm8cRBDgAADqYXtsMyN84UB2jWHUMp1w",
                "wm8cRBDgAAdTsEoAe_W4dyuhNYd83ZoQ",
                "wm8cRBDgAArov5FnpJUNlIcMP5ayADFg",
                "wm8cRBDgAAGv8CTCRlxelIJYg6_4Lsvw",
                "wm8cRBDgAAihubAcjwLqvc_-eaQ6ZDrw",
                "wm8cRBDgAAWRXMeLWV-TZvOloDKBcTpw",
                "wm8cRBDgAAvedhGwt_kM0sRgwhXaVpGw",
                "wm8cRBDgAA22Z4tBJa4oBM4VK5TMqjgg",
                "wm8cRBDgAA9NYyfWSR_gFec7AonAqopg",
                "wm8cRBDgAAdouYfX8wQmNBvVaHSVQHTA",
                "wm8cRBDgAAiVDKHH3wY_u80QthOuIy3Q",
                "wm8cRBDgAA_YkfleDenoUTFXyrPFpktQ",
                "wm8cRBDgAAsGDXadRf0WjU_WaHFsAc2A",
                "wm8cRBDgAAnAtVr7HW5Qkxzxn9fv-XKw",
                "wm8cRBDgAARSZOaIyp-J-2sDT2GX_d6Q",
                "wm8cRBDgAAdL9Ydo8DCJmrfAdEXRAp5A",
                "wm8cRBDgAAbdjfK_YTkcky2uyAIqSfcQ",
                "wm8cRBDgAALulH8uOOusOx1K_OU5AuMw",
                "wm8cRBDgAAaUrXl9Nuw1i_g43MPNasaw",
                "wm8cRBDgAAU17bg-Hj9HBSXP5pyqbXVw",
                "wm8cRBDgAALKkzTeeNbSRJVa5FCDmF2w",
                "wm8cRBDgAADYRpL62Gumo75NYPZT4c8w",
                "wm8cRBDgAAa4IUAVH1zxHYzI_bcm0Tpw",
                "wm8cRBDgAArkAwikyswObhwI3xrf4AbA",
                "wm8cRBDgAA-wKnQUG3RwJqxEKIE7VSwQ",
                "wm8cRBDgAA-VCuQyc86xZF7KpO3AO4Ug",
                "wm8cRBDgAAC1XY1picDAfkcf9Uw5Iuzg",
                "wm8cRBDgAAOBfxaxU83Ku3h2RfarUjyg",
                "wm8cRBDgAAr7VChcG0XQNkPRtlZbD4JA",
                "wm8cRBDgAAEVPYWxx9ED1KzAFdsWwmCA",
                "wm8cRBDgAADDZE61ADrYu0lV3V1xuYrA",
                "wm8cRBDgAAjwwuKQlSt-MHqQmvQT2dfQ",
                "wm8cRBDgAANYikYF265ixFyx47p1q6XQ",
                "wm8cRBDgAAeW_FCCqHbqzxJWBL10T8Dg",
                "wm8cRBDgAAJbATgUUv3KOmrcrWIBC0Eg",
                "wm8cRBDgAAIwvkVcmoP67ImDgo3ht1NQ",
                "wm8cRBDgAAdRlQ6IQp5bzpqfwRsLex5w",
                "wm8cRBDgAA_8NFX6lo3hmEc2Te6ALatQ",
                "wm8cRBDgAASxbNnuxuw_bDEF3Y9j0gPQ",
                "wm8cRBDgAASwOoNOOep9itKMzhViDwPA",
                "wm8cRBDgAAxgCwwS_vL3awXIrNo1EDnQ",
                "wm8cRBDgAAd44KiT1XE-FL65BXgIsQ0A",
                "wm8cRBDgAA1s-fAj1tb08Xi-cgT4W4QQ",
                "wm8cRBDgAAh87AI9kjl0uQwBo0zJxWZQ",
                "wm8cRBDgAAs5SMzAjzHnBnlWAWtZB1Dw",
                "wm8cRBDgAAMdLFfOrX0bjf4Yb5XULjBQ",
                "wm8cRBDgAA9yaG6q_r3HL9sraYiAOa4A",
                "wm8cRBDgAABh7djvZEagd-2B3tJNpIZg",
                "wm8cRBDgAAkmq3G5aSzmH2cARfkt2cJQ",
                "wm8cRBDgAAS6wPo3DWN1YeAEqZ5nm0QA",
                "wm8cRBDgAAbph1e19vIHNccf1adE0l-Q",
                "wm8cRBDgAA3Y3DB0k61hvJcrl6rAQPGw",
                "wm8cRBDgAAhcuOy6ApAgRhkGCtf35xXA",
                "wm8cRBDgAAvq9Df0WynXGB0YGR_zp7MA",
                "wm8cRBDgAAu_oDvHo4X2tLdkmUBrYJgw",
                "wm8cRBDgAApUF6qtLjkIbqper64c0nXA",
                "wm8cRBDgAAsfSwQjH2mifUIFj58z88Hg",
                "wm8cRBDgAAqXvcw5M9fGVB1a6jJRu_Nw",
                "wm8cRBDgAAZ1QTcnM0aunz4K3-M1ornQ",
                "wm8cRBDgAA1Z9B0Od3CyttAOC-HS_0Bg",
                "wm8cRBDgAAQT2b5K6nOc_DL3dqFpv--A",
                "wm8cRBDgAAIer_-z6w7px2HJ-455D7MA",
                "wm8cRBDgAAkhBnGdeZ0cjl4CvLndlL2g",
                "wm8cRBDgAAf505blZnqQwHATmV70RiLw",
                "wm8cRBDgAAtkvl4NmOuz2blk1e7p-q5w",
                "wm8cRBDgAAaZRxUdZb0xmEz-e5OT47zg",
                "wm8cRBDgAAIufufdsLDehqjdlfgeZDhw",
                "wm8cRBDgAA-a22eqznhsbTpskm0miw5A",
                "wm8cRBDgAAMtjcjJdb5genMtI1Dpbd2Q",
                "wm8cRBDgAAjfeEuiDwaMV8QuGzuDCmSQ",
                "wm8cRBDgAAjSDld2wM4Ib6HwC3fVKKmg",
                "wm8cRBDgAA4Esc_q1Sk9cKd3CZ6qmc2g",
                "wm8cRBDgAA64ck-YJ8EdIjN6b5YEsYHw",
                "wm8cRBDgAA7Xa8pF-tfDwI8_zHYHNg5Q",
                "wm8cRBDgAATp9YAP0TkZekkoHMqrJRbA",
                "wm8cRBDgAAOU5wFINwp6B9UMsnO5Jtsw",
                "wm8cRBDgAATvmqzaaBSL4q4XbdINpEPg",
                "wm8cRBDgAALwbYWZZ-9zpBomWbP3Ujsw",
                "wm8cRBDgAAl0Wrb1grvd5XUjdW1wF9hw",
                "wm8cRBDgAA2cODDstoTV3mErWoz81Icw",
                "wm8cRBDgAAlx5VeG9gFsLXhIBjCW0pMg",
                "wm8cRBDgAARf2M6DSOQP-KPr5WC0MwNw",
                "wm8cRBDgAANVMK5RaiMbS-U8fAMnj-IQ",
                "wm8cRBDgAAjmmNS0cTeiWNURlqa6zfKg",
                "wm8cRBDgAACeQpOPtm5Bf2wv9ZQnluGg",
                "wm8cRBDgAAgobxDCEONg5lNGCywJeDWQ",
                "wm8cRBDgAAxTgXKBXRZqGpYYwO7exqmA",
                "wm8cRBDgAAOs_R_4wWLbj_11JJNBXcXw",
                "wm8cRBDgAA_l1iSlzg0ucaeQ9LPLhZfA",
                "wm8cRBDgAAGlk6DR6sI29yJZcfN3qpYg",
                "wm8cRBDgAApBEDseg8ZKlWfxm77v5ugQ",
                "wm8cRBDgAAQiE22yg-fFJzYA8uSVaKIQ",
                "wm8cRBDgAAIRFcMpgTbfzfa7ISbB-3Dg",
                "wm8cRBDgAACCfhOMmMzLonyJ0keChAog",
                "wm8cRBDgAA766ApEbmwg3uJJuuEysiTg",
                "wm8cRBDgAA5rAw4NtGxOvCRXsSVZrfhQ",
                "wm8cRBDgAA9OoOmTXU_vQZqC7qjV1Eig",
                "wm8cRBDgAAurDRvlQzk0Tbn_sV4ifpEA",
                "wm8cRBDgAAhaRy_0DxxA6Sa5VrrVdS7A",
                "wm8cRBDgAAWYn5kupmffKSYF6iBgwR0Q",
                "wm8cRBDgAAywWf9sFKHD03AaOKTRrstg",
                "wm8cRBDgAA1pBgEGIb_OZI2YpveYnqBA",
                "wm8cRBDgAAGSApEUAhEPnK4JLsHuimEA",
                "wm8cRBDgAAv7lK9IE2ETv0EF1_lgMO8Q",
                "wm8cRBDgAAfu4CF40_wMwZDW_hOAkbqQ",
                "wm8cRBDgAAMxunzlTVhzjjc7SuHcMxCQ",
                "wm8cRBDgAAyD0AG7StvSkLJUjW8YpmVQ",
                "wm8cRBDgAAHMsCN_4eSFMRDzzpVo5g3w",
                "wm8cRBDgAALzCio6vGu9d7x_1RBJau5w",
                "wm8cRBDgAAwPDF2_zr8M5OcjPFCyh19w",
                "wm8cRBDgAAffd-RF_ajFXe6DS9JQ3HZQ",
                "wm8cRBDgAAzj2vhwyq19cR508qqPIUxQ",
                "wm8cRBDgAAP-efB5eu1eO2obO_cr_RdQ",
                "wm8cRBDgAA7qZy-jVMqwkNeLXe18b9XA"
            ],
            "content": "喵～零食见底啦 •̫͡•ʕ\n主人，可以给我买点猫零食吗？🥺\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得多买点哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|猫零食专场",
                        "pic_media_id": "3ekwxlDs-kQdNeH7UoGpviksYqDFM8zPkE0DvrwGvrgDPMp1RkFI7P54H1I3Ttf-8vUu_GhG2V3QE-ZI1-c4Vcw",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3DadMmmc2BXE%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 0,
                "errmsg": "ok",
                "fail_list": [
                    "wm8cRBDgAAWHXHYe3Do4EDZTBBU8t2kw",
                    "wm8cRBDgAAMxunzlTVhzjjc7SuHcMxCQ",
                    "wm8cRBDgAAom3zjhAnaNLQq46LThZvXw",
                    "wm8cRBDgAAxTgXKBXRZqGpYYwO7exqmA",
                    "wm8cRBDgAAd8T5zURC2E0Qh1XHUElcNw",
                    "wm8cRBDgAA5rAw4NtGxOvCRXsSVZrfhQ",
                    "wm8cRBDgAAWU3AshE-dwGHcFXYHEOFqg",
                    "wm8cRBDgAAxqrecS6Dba7UjUb-J0yztA",
                    "wm8cRBDgAA67nY4toQhiD5cx7fmIwwKw",
                    "wm8cRBDgAAffd-RF_ajFXe6DS9JQ3HZQ",
                    "wm8cRBDgAA05aXpMRa9OygFJc-TTXafw",
                    "wm8cRBDgAApF4SF05MJozq-BekIoB8Vw",
                    "wm8cRBDgAA_ymDy6Vt7F3IrMl6NwCvNQ",
                    "wm8cRBDgAAsg5FXr0ENRge4sFJU95Qpw",
                    "wm8cRBDgAAf505blZnqQwHATmV70RiLw",
                    "wm8cRBDgAA3DwSwrz1duVQO9dqIag88w",
                    "wm8cRBDgAAOs_R_4wWLbj_11JJNBXcXw",
                    "wm8cRBDgAAzBEmMNvJ6gn3rTqQgufdFg",
                    "wm8cRBDgAAUUQ33rYI7USA0DHv0BOWnA",
                    "wm8cRBDgAA5CXFVjyPIXPBWFoB-C_4pw",
                    "wm8cRBDgAAzEJzh195LTaYEkDJuuKdlw",
                    "wm8cRBDgAAVuzkmaZdd3LK2U6ln3ZOKA",
                    "wm8cRBDgAAA-dVv8xKLfVIcy9AtshYGg",
                    "wm8cRBDgAAuszobhE1nwsiI6sqaJuZQg",
                    "wm8cRBDgAA6OWhjfNgmue7X0YTxHJj3w",
                    "wm8cRBDgAAzx4KdjmH2l2PQ7jLatz6Cg",
                    "wm8cRBDgAAElKh7DmFx9gpdXEBA0Bvng",
                    "wm8cRBDgAAtuDFKYxAB-hUDMioDxce5A",
                    "wm8cRBDgAAiIk8Pd16f5jFXb3J-0q8Pg",
                    "wm8cRBDgAALK8cFCkQS-xWNxJkNaNYkQ",
                    "wm8cRBDgAA9zagRnNap1uPSFhwcB77tQ",
                    "wm8cRBDgAA3tWC6ukkPysdBlUSYHi9ww",
                    "wm8cRBDgAAmmEtKSGK0TZ6O2Mwreclug",
                    "wm8cRBDgAAtXu1_laOlB7pP4O3Oda5CA",
                    "wm8cRBDgAAEonYRF3mLSVBNbl6A0RvOw",
                    "wm8cRBDgAAvsO2hoaSKsc4veRF3QP0Hw",
                    "wm8cRBDgAAgla4gbeam8Mfvwm5Jx6dtg",
                    "wm8cRBDgAAitgwsJDt6Rw1k3EvxQFphA",
                    "wm8cRBDgAALwbYWZZ-9zpBomWbP3Ujsw",
                    "wm8cRBDgAA7qZy-jVMqwkNeLXe18b9XA",
                    "wm8cRBDgAAJlYpgvz8ysKxF7v4IllX6Q",
                    "wm8cRBDgAAbkyNbLCevYuEnUtdXk2Emw",
                    "wm8cRBDgAAurDRvlQzk0Tbn_sV4ifpEA",
                    "wm8cRBDgAAl0Wrb1grvd5XUjdW1wF9hw",
                    "wm8cRBDgAAwIEL8IF8o1zc76i0xpWoiw",
                    "wm8cRBDgAAkfIiU7tIvDgbNEdjFiLftg",
                    "wm8cRBDgAAijAoy2JjrVs5fZYLAEfJRA",
                    "wm8cRBDgAARSZOaIyp-J-2sDT2GX_d6Q",
                    "wm8cRBDgAANM-3xCWvd3jhph3NlS87Uw",
                    "wm8cRBDgAADzB0Je2MM_bCIkeqrJpCPg",
                    "wm8cRBDgAATp9YAP0TkZekkoHMqrJRbA",
                    "wm8cRBDgAAL_4jZprFQoM2cu_9wny8KA",
                    "wm8cRBDgAAlE1iEQSCr2Cs3MXtC2ylNA",
                    "wm8cRBDgAAtkvl4NmOuz2blk1e7p-q5w",
                    "wm8cRBDgAApUOx8es2hl2IG_IEN-yXmA",
                    "wm8cRBDgAAZ2JFUnJjCJU0G5decA0fPw",
                    "wm8cRBDgAAkk8GqdtiblwxMgK-Qoq_QQ",
                    "wm8cRBDgAAtsiJmF9f1QM1d0IbMGUmpw",
                    "wm8cRBDgAAmHkb_LMgUaBU2zHR80cWag",
                    "wm8cRBDgAAniw6v0QZYiMA9Ig1zaMe_Q",
                    "wm8cRBDgAACGTuPKp8e-aRzkBvtyFpug",
                    "wm8cRBDgAAfOr1iSj4cHXuSwfyEleaMQ",
                    "wm8cRBDgAApBEDseg8ZKlWfxm77v5ugQ",
                    "wm8cRBDgAA-8S0i9T_QWZnIjf96TRX1Q",
                    "wm8cRBDgAA9OoOmTXU_vQZqC7qjV1Eig",
                    "wm8cRBDgAAklZjBTPcPmRYgJjMvUmrzg",
                    "wm8cRBDgAAWYn5kupmffKSYF6iBgwR0Q",
                    "wm8cRBDgAAuNyZc5kgdj6HE4V4MNCMpw",
                    "wm8cRBDgAAG85FVUdqdH8om3bldacEOg",
                    "wm8cRBDgAAlPqp3hyuvvs66IjcKG4OFw",
                    "wm8cRBDgAAcqDmYiMcdePz93OYX_H2ug",
                    "wm8cRBDgAABNtuyl3Ai1cfUA-s27d6eA",
                    "wm8cRBDgAABYOdGxsoHEBYXlS6Fk5m4w",
                    "wm8cRBDgAAAovqXDDrKYGB32jyyIAsyA",
                    "wm8cRBDgAA62_XQohLuwEv0ETYK20rqw",
                    "wm8cRBDgAAkH7jxM5jOTUeyq0ojRzuVA",
                    "wm8cRBDgAA8bfLtfp_9iQ-pPlvdhb-Qg",
                    "wm8cRBDgAAafPhPm7GDkOA3tYPw5Wr6Q",
                    "wm8cRBDgAAlDNheTm3MXNbEjFJ2NLFCg",
                    "wm8cRBDgAAKn4BHnC43kNHVihqLvF1BQ",
                    "wm8cRBDgAANpyf3MK0vzbE5KjP1tBvGw",
                    "wm8cRBDgAABAjCldjT8V7N5wvdqVtkxA",
                    "wm8cRBDgAANRbGQtepA8Nyy7D5Vx5ODA",
                    "wm8cRBDgAA6GrDHBq-2Hv9_SbncTj-0w",
                    "wm8cRBDgAAjHxAhNyBoUGy6f4_egPrFQ",
                    "wm8cRBDgAAMc_1oJmZ0EPUIwKaDnINvw",
                    "wm8cRBDgAA-VCuQyc86xZF7KpO3AO4Ug",
                    "wm8cRBDgAAu5zi23tCZMxFpNuqn-E9Og",
                    "wm8cRBDgAAabr0J9sBGChKVRAdPQIkmA",
                    "wm8cRBDgAAQxZG881UWR5EzP1Me2DdUg",
                    "wm8cRBDgAALcazqi12k2ZENAY9XhFMQw",
                    "wm8cRBDgAAPmqL5Gf5-pRviBQ6zelcSw",
                    "wm8cRBDgAAt9-6l9hcyUWFKcErqw0-lg",
                    "wm8cRBDgAAmqMQlGyrRDZKDMyXXkngow",
                    "wm8cRBDgAA7qhZoYC0AFu42s7R3Ws69Q",
                    "wm8cRBDgAA_guGFIHZkDMSU-IVAJpBaA",
                    "wm8cRBDgAAWJ6Kw6afBgMBLLHH2ufZIg",
                    "wm8cRBDgAA5fRrP3H9Lp8lY_sJWZUq2A",
                    "wm8cRBDgAAqhlX4EgMWw15ib37oT3Uww",
                    "wm8cRBDgAA95pgWYbtnsvBZI9DXR5bXg",
                    "wm8cRBDgAA8xIQArMTfekbjQhpShqXCw",
                    "wm8cRBDgAAdBVEFEfuy6qYH5I9UKT1cQ",
                    "wm8cRBDgAAJ438ZqCmXsJfcqOyrcEN7Q",
                    "wm8cRBDgAAsBVL9DE0YVNdg8z5Z4Z9sA",
                    "wm8cRBDgAAGo02lWkCEt6mKH3QDda74g",
                    "wm8cRBDgAAXNAT_QJ3aSHZe3AqTkvm5Q",
                    "wm8cRBDgAAHAXYjzXKPaeq2Adu31SUZw",
                    "wm8cRBDgAAUwj1KIUQZHEvT0D5ym17qA",
                    "wm8cRBDgAAxf9pP9k2fyS_eV8rqkj4_w",
                    "wm8cRBDgAANN1-JXGJsf9T76PLAjM5Wg",
                    "wm8cRBDgAAd3QH8FwgzdLEx4Ab9IvOhA",
                    "wm8cRBDgAAEYu3LdFdsBAqzPgSrDyPOA",
                    "wm8cRBDgAAqqBqF5GcNjtoHuff1GKu2w",
                    "wm8cRBDgAAdafJce8LHYIM_EZK2YHhSw",
                    "wm8cRBDgAAIapHsZe-aN15FUhn7TLZ4g",
                    "wm8cRBDgAAXVEsLCxGCLbNRUC_XIReUw",
                    "wm8cRBDgAAm8sUbsulQtcCkCZTmh36zg",
                    "wm8cRBDgAA3wFq7l0slTYZXBT-EvT8rA",
                    "wm8cRBDgAA5NQDzx5XcZORrRnR5GUslw",
                    "wm8cRBDgAASKR613348pNqbrnq58hbPg",
                    "wm8cRBDgAA5Q5dgqcRMze5904T7D65HA",
                    "wm8cRBDgAABv8d4jxu0fJ8_iVQZe0iYg",
                    "wm8cRBDgAANt8PgFn7-ATosvX9IVTikw",
                    "wm8cRBDgAAJ3Otl94gkiir32eEbAF07A",
                    "wm8cRBDgAA6v_Dkf6McUIEuGBmvXmRXA",
                    "wm8cRBDgAA5FYIMrDA-i8ixhIoKQteJQ",
                    "wm8cRBDgAA2GKaetG3ehu-GQo-U0bFtg",
                    "wm8cRBDgAAr0UZsnzVr4O2aP1PaxuqYw",
                    "wm8cRBDgAA4ocaJYysv_mQZaLk0V14SA",
                    "wm8cRBDgAA8sIEYt5DwldbCHIVVdXqCQ",
                    "wm8cRBDgAAs5SMzAjzHnBnlWAWtZB1Dw",
                    "wm8cRBDgAA0qBCl5VFlChAwMO4AL2WPA",
                    "wm8cRBDgAAH-XIYXcygxT0shRuDwr_bQ",
                    "wm8cRBDgAAloPzobdOnQ5VH2jx_yZnWg",
                    "wm8cRBDgAAuz5zoSJp6fQf98vnVBWu_Q",
                    "wm8cRBDgAAMDTGr2keOWOn7W7GRiI34g",
                    "wm8cRBDgAAMtjcjJdb5genMtI1Dpbd2Q",
                    "wm8cRBDgAApv0HOz4BpK84aCnYGs6rtw",
                    "wm8cRBDgAAyGEdlsrNZIXqQr8hF_H-xQ",
                    "wm8cRBDgAAHTalJYmsj-XEH9P17souAQ",
                    "wm8cRBDgAAZKFr7JNJRoSlSh5JoJ3Nrg",
                    "wm8cRBDgAAaAirY-ovMnKVsQNLodUnmw",
                    "wm8cRBDgAAaFicOGhvRFrPeGF5Tl7QDA",
                    "wm8cRBDgAARf2M6DSOQP-KPr5WC0MwNw",
                    "wm8cRBDgAA9UJFobH40sayrnDiwtHCEQ",
                    "wm8cRBDgAABJjh3JkKd5KFAiog0YKP2Q",
                    "wm8cRBDgAAT_w0po9jIzhk24Rr5y1DIg",
                    "wm8cRBDgAA6o5UztGFLqgfXP1DXeE1tQ",
                    "wm8cRBDgAAZM9p4WFGG_AznGeIw2NWoA",
                    "wm8cRBDgAAwDBA3cq80E-8cVDeFYTj0w",
                    "wm8cRBDgAAun9rujjmF-9ZMskE-y5BdQ",
                    "wm8cRBDgAA1Z9B0Od3CyttAOC-HS_0Bg",
                    "wm8cRBDgAA0oI7PUIGaZQQJjV3_uuUOQ",
                    "wm8cRBDgAAkmq3G5aSzmH2cARfkt2cJQ",
                    "wm8cRBDgAAuMrG-3jMxJWytLIqTtsXkQ",
                    "wm8cRBDgAA6LCoFqMAYmVMpDJeXWbm5w",
                    "wm8cRBDgAAjUSGKemeilY93R0GJmGG3Q",
                    "wm8cRBDgAA6owmJB4i6aoeJ5smM1MP5w",
                    "wm8cRBDgAAiN1jlDXNT3PJfc16jKQzAQ",
                    "wm8cRBDgAAw8nmmuQJVXYxPiWESwu-6w",
                    "wm8cRBDgAAyEaFKwz-YYdiy1SKfdprZw",
                    "wm8cRBDgAACAp7LA5QlzIQ10fJkkwP0Q",
                    "wm8cRBDgAA2v_wuxTGBGRHlMs2waZf4w",
                    "wm8cRBDgAAC6OQLMivLwX0z46LKznQAQ",
                    "wm8cRBDgAAEMWPz39OK33-Nq8MbAN-iA",
                    "wm8cRBDgAAOoXxurwSSqakjJp8AJfRMg",
                    "wm8cRBDgAAM0kxhTuf__45uEyw4Sz3TA",
                    "wm8cRBDgAAWjYjqs8ka5_3Qc0na5GMUA",
                    "wm8cRBDgAANVMK5RaiMbS-U8fAMnj-IQ",
                    "wm8cRBDgAAywWf9sFKHD03AaOKTRrstg",
                    "wm8cRBDgAAju8bRTXdurKpPUZBXUEPzA",
                    "wm8cRBDgAAd7-q-nHcIdiJhfkBz0Ry1w",
                    "wm8cRBDgAAHbfK_TbbU6f-bwrZLmqVIQ",
                    "wm8cRBDgAAnrOmwU5e1soPzVhtktoUTQ",
                    "wm8cRBDgAAgobxDCEONg5lNGCywJeDWQ",
                    "wm8cRBDgAAaZRxUdZb0xmEz-e5OT47zg",
                    "wm8cRBDgAAE8Lm3rlKqTfmlX-xlcnUKA",
                    "wm8cRBDgAAAq5EZjC8HUudR2H6tHjhsQ",
                    "wm8cRBDgAAAz_iPEzbNKgAAP-Yp16Ovg",
                    "wm8cRBDgAAObcnu8bqYfYGW3UzQnesMg",
                    "wm8cRBDgAAmJQbT6YmYFfkGgQ25tNQQw",
                    "wm8cRBDgAApCG2JgORDBbdFK-_2gFBEg",
                    "wm8cRBDgAAVobLosfCsU8n-_dEscJ-UA",
                    "wm8cRBDgAATvmqzaaBSL4q4XbdINpEPg",
                    "wm8cRBDgAAjmmNS0cTeiWNURlqa6zfKg",
                    "wm8cRBDgAAsmBd6PjLXCEG2OHzBrWgEw",
                    "wm8cRBDgAA766ApEbmwg3uJJuuEysiTg",
                    "wm8cRBDgAAtAWN_qzsufhZwZuXS-adMg",
                    "wm8cRBDgAAnqy9rswGcgqDb1nFCWO5mQ",
                    "wm8cRBDgAAHumF9oaz-byxR6_v3zf3Jg",
                    "wm8cRBDgAAB30VRNflwB2EkrKeBuBI-Q",
                    "wm8cRBDgAAjfeEuiDwaMV8QuGzuDCmSQ"
                ],
                "msgid": "msg8cRBDgAANMywBUSDc52pzCOGuZhg-Q"
            }
        },
        {
            "external_userid": [],
            "content": "主人，喵喵想要新玩具和新窝\n可以买给我吗？爱你哦～💕\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得多买点哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|猫用品专场",
                        "pic_media_id": "3RItZ4v6mEOc6Rp3HSZCHlhX9Sbv6BgrdtqHincoNb_bCU-apCEWXl4cQ4MTMiIK4VTFgulQxdeWQVbISO0c26g",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3DvtToSs6nWs%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 41035,
                "errmsg": "missing external userid, hint: [1731318638567740887924988], from ip: 106.14.253.16, more info at https://open.work.weixin.qq.com/devtool/query?e=41035",
                "fail_list": []
            }
        },
        {
            "external_userid": [
                "wm8cRBDgAAsYtf1Ea_sYOWU3ygVExT9Q",
                "wm8cRBDgAAD5U_BOuPSw68UusYbFK6sg"
            ],
            "content": "主人，汪汪的粮快吃完了\n能再买点吗？拜托拜托～🐶\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得买大包哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|犬粮专场",
                        "pic_media_id": "3ZExRU1_hkpOmT-pvwLfnmzFs9B1B4OZDJptInFOPygCYccOzMxbX1HmYczM6j1cMEH5edgO_E29AEWBIahGyMg",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3DNiZLON8sFk%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 0,
                "errmsg": "ok",
                "fail_list": [],
                "msgid": "msg8cRBDgAA6JfEd-4uDEKscINhi2SXyQ"
            }
        },
        {
            "external_userid": [
                "wm8cRBDgAAGlk6DR6sI29yJZcfN3qpYg"
            ],
            "content": "主人，您什么时候方便去买零食呢？\n🍭我好期待新零食啊～\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得买多一点哦～(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|犬零食专场",
                        "pic_media_id": "37yFX1SwPyVxwNSYcsBh9AnkFCQLiyLAdoUFqkPpWkQ3oOfhit0NJxMm4Ff9CVq_01mQIMj46W26uz2Pbf_Zyzw",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3D8dCPCFCzR8%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 0,
                "errmsg": "ok",
                "fail_list": [],
                "msgid": "msg8cRBDgAAvtrtmaELy5504STbFBGpJQ"
            }
        },
        {
            "external_userid": [],
            "content": "主人，好喜欢那个小球⚽️\n可以买吗？我会超级开心的～💕\n««宠本本优惠，全场9⃣️折\n折后价超划算，记得还买些别的哦(๑˃̵ᴗ˂̵)و✧*\"",
            "attachments": [
                {
                    "msgtype": "miniprogram",
                    "miniprogram": {
                        "title": "宠本本|犬用品专场",
                        "pic_media_id": "30YcDaSCHPqDiaEBeL0-3g00qqDkRTpAQXfC45dFUD8eaUv6jpddWvoLC48ZT38shoJwPVCwIhVj7wu-AQOCj5w",
                        "appid": "wx9be9e58fb9dc4dc2",
                        "page": "pages/common/blank-page/index?weappSharePath=pages%2Fhome%2Ffeature%2Findex%3Falias%3DJI74bj2RXE%26kdt_id%3D134533635&shopAutoEnter=1&kdt_id=134533635"
                    }
                }
            ],
            "add": {
                "errcode": 41035,
                "errmsg": "missing external userid, hint: [1731318641255362351634121], from ip: 106.14.253.16, more info at https://open.work.weixin.qq.com/devtool/query?e=41035",
                "fail_list": []
            }
        }
    ]
}

class WechatPushResultController {
    //工厂方法，用于创建中间件
    createMiddleware(methodName) {
        if (!this[methodName]) {
            throw new Error(`Method ${methodName} does not exist.`);
        }
        //返回一个中间件函数
        return async (ctx, next) => {
            //直接调用类方法，并将ctx作为参数传递
            await this[methodName].call(this, ctx);
            //继续执行下一个中间件
            await next();
        };
    }

    //分析推送结果
    async getWechatPushResult(ctx) {
        try {
            // const startDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
            // const endDate = moment().subtract(1, 'days').format("YYYY-MM-DD");
            // const startTime = moment().subtract(7, 'days').startOf('day').format("YYYY-MM-DD HH:mm:ss");
            // const endTime = moment().subtract(1, 'days').endOf('day').format("YYYY-MM-DD HH:mm:ss");
            let wechatPushResults = await WechatPushResults.findAll({
                where: {
                    created_at: { [Op.between]: ['2024-11-25 00:00:00', '2024-12-01 23:59:59'] },
                    name: { [Op.like]: '%45天内兜底%' }
                    // name: { [Op.like]: '%品类细分%', [Op.ne]: '品类细分-热门零食罐' },
                    // name: { [Op.in]: ['品类-猫砂', '品类-猫粮', '品类-猫零食', '品类-通用用品', '品类-犬粮', '品类-犬零食'] }
                    // name: '低毛SKU召回-皇家K36幼猫全价猫粮2kg',
                    // name: '品类细分-热门零食罐',
                    // name: '「长期」45天未购买用户召回'
                    // name: '【低毛利sku召回】蓝氏1.5kg（一次）'
                },
                attributes: ['result'],
            });
            let data = [];
            if (!wechatPushResults.length) {
                ctx.body = { success: false, msg: "未查询到推送结果" }
            }
            data = wechatPushResults.map(item => item.result);
            let pushList = []; //推送的成员id
            let failList = []; //推送失败的成员id
            let successList = []; //推送成功的成员id
            for (let i = 0; i < data.length; i++) {
                const _pushList = data?.[i]?.external_userid || [];
                const _failList = data?.[i]?.add?.fail_list || [];
                if (!_pushList.length) {
                    continue;
                }
                if (_failList.length) {
                    pushList = pushList.concat(_pushList);
                    failList = failList.concat(_failList);
                    const _successList = _pushList.filter(item => !_failList.includes(item));
                    successList = successList.concat(_successList);
                } else {
                    pushList = pushList.concat(_pushList);
                    successList = successList.concat(_pushList);
                }
            }
            const uniquePushList = [...new Set(pushList)];
            const uniqueFailList = [...new Set(failList)];
            const uniqueSuccessList = [...new Set(successList)];
            let ids = successList.map((item) => `'${item}'`).join(",") || null;
            // let goodsInfo_sql = `
            //     SELECT 
            //         DISTINCT brand, title 
            //     FROM 
            //         youzan_orders 
            //     WHERE 
            //         order_creation_time BETWEEN '2024-11-18 18:00:00' AND '2024-11-24 23:59:59'  
            //         AND 
            //         fans_nickname IN (SELECT DISTINCT name FROM customers WHERE external_userid IN (${ids}))
            // `;
            // const goodsInfo = await sequelize_customers.query(goodsInfo_sql, {
            //     type: QueryTypes.SELECT
            // });
            let orderCount_sql = `
                SELECT 
                    COUNT(DISTINCT order_number) AS '订单数' 
                FROM 
                    youzan_orders 
                WHERE 
                    order_creation_time BETWEEN '2024-11-25 18:00:00' AND '2024-12-01 23:59:59' 
                    AND 
                    fans_nickname IN (SELECT DISTINCT name FROM customers WHERE external_userid IN (${ids}))
            `;
            const orderCount = await sequelize_customers.query(orderCount_sql, {
                type: QueryTypes.SELECT
            });
            ctx.body = {
                success: true,
                data: {
                    '推送人数': uniquePushList.length,
                    '推送失败人数': uniqueFailList.length,
                    '推送成功人数': uniqueSuccessList.length,
                    '购买商品信息': goodsInfo,
                    '产生订单数': orderCount
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = WechatPushResultController
