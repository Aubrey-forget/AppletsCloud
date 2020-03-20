// 云函数入口文件
const cloud = require('wx-server-sdk');
const request = require('request-promise');
cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('参数：', event);

  const { id, curr, cookie = '' } = event;
  const options = {
    uri: 'https://m.weibo.cn/api/container/getIndex',
    qs: {
      containerid: id,
      openApp: 0,
      since_id: curr
    },
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'set-cookie':
        'M_WEIBOCN_PARAMS=oid%3D4484188289541876%26luicode%3D10000011%26lfid%3D102803%26uicode%3D10000011%26fid%3D102803; expires=Fri, Max-Age=600; path=/; domain=.weibo.cn; HttpOnly'
    },
    json: true
  };
  return await request(options)
    .then(res => {
      console.log('结果：', res);
      return res;
    })
    .catch(err => {
      // API call failed...
    });
};
