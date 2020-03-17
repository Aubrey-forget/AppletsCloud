// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const path = event.path;
  const fileList = [
    {
      fileID: path,
      maxAge: 7200
    }
  ];
  // for (let i = 0; i < list.length; i++) {
  //   const obj = {
  //     fileID: list[i],
  //     maxAge: 7200
  //   };
  //   fileList.push(obj);
  // }
  const result = await cloud.getTempFileURL({ fileList });
  // 返回可被下载的地址链接
  return result.fileList;
};
