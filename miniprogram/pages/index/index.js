Page({
  data: {},

  onLoad(options) {
    wx.cloud.callFunction({
      name: 'loginWeibo',
      data: {},
      success: res => {
        const data = JSON.parse(res.result);
        console.log('成功：', data);
      },
      fail: err => {
        console.log('失败', err);
      }
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});
