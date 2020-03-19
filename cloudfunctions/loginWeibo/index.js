// 云函数入口文件
const cloud = require('wx-server-sdk');
const request = require('request-promise');
cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  var options = {
    uri: 'https://passport.weibo.cn/sso/login',
    form: {
      username: '15077814116',
      password: 'ai1570056081',
      pagerefer:
        'https://m.weibo.cn/login?backURL=https%253A%252F%252Fm.weibo.cn%252F',
      entry: 'mweibo'
    },
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Cookie: 'login=219e4a0617d3288012618552eb672f75',
      Referer:
        'https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=https%3A%2F%2Fm.weibo.cn%2F'
    }
    // json: true
  };

  const parm = (param, name) => {
    const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    const r = param.match(reg);
    if (r != null) return unescape(r[2]);
  };
  return await request(options)
    .then(res => {
      const data = JSON.parse(res);
      const url = data.data.errurl.split('?')[1];
      const key = parm(url, 'id');
      const strValue = XMLHttpRequest.getAllResponseHeaders();
      console.log('响应头：', strValue);

      // return res;
      request({
        uri: 'https://security.weibo.com/captcha/ajgeetest',
        qs: {
          action: 'init',
          key
        },
        headers: {
          'content-type': 'application/json; charset=utf-8'
        },
        json: true
      })
        .then(result => {
          console.log('******', result);

          return result;
        })
        .catch(err => {
          console.log('****失败：', err);
        });
    })
    .catch(err => {
      console.log('失败：', err);
      // return err;
    });
};
