// 云函数入口文件
const cloud = require('wx-server-sdk');
const request = require('request-promise');
cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  var options = {
    uri: 'https://m.weibo.cn/api/container/getIndex',
    qs: {
      containerid: 102803,
      openApp: 0,
      since_id: 1
    },
    headers: {
      'content-type': 'application/json; charset=utf-8'
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
