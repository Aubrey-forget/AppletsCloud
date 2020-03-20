Page({
  data: {
    showVideo: false,
    videoUrl: ''
  },

  onLoad(options) {
    this.getWeiboList(102803);
  },

  // 获取微博列表
  getWeiboList(id, curr = 0) {
    if (this.isRun) return;
    this.isRun = true;
    const { weiboList = [] } = this.data;
    wx.cloud.callFunction({
      name: 'weibo',
      data: {
        id,
        curr
      },
      success: res => {
        const { data } = res.result;
        this.setData({
          weiboList: weiboList.concat(data.cards),
          curr: data.cardlistInfo.since_id
        });
        this.isRun = false;
      },
      fail: err => {
        console.log('失败', err);
      }
    });
  },

  // 播放视频
  playVideo(e) {
    const { url } = e.currentTarget.dataset;
    this.setData({
      videoUrl: url,
      showVideo: true
    });
  },

  // 关闭视频
  closeVideo() {
    this.setData({
      videoUrl: '',
      showVideo: false
    });
  },

  // 预览图片
  previewPics(e) {
    const { index, list } = e.currentTarget.dataset;
    let preview = [];
    for (let i = 0; i < list.length; i++) {
      preview.push(list[i].large.url);
    }
    wx.previewImage({
      current: preview[index],
      urls: preview
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  // 加载更多
  onReachBottom() {
    this.getWeiboList(102803, this.data.curr);
  },

  onPageScroll(e) {
    const { scrollTop } = e;
    if (scrollTop > 200) {
      wx.setTabBarItem({
        index: 0,
        text: '刷新',
        selectedIconPath: '/images/tabBar/refresh.png'
      });
    } else {
      wx.setTabBarItem({
        index: 0,
        text: '首页',
        selectedIconPath: '/images/tabBar/home-a.png'
      });
    }
  },

  // tabBar再次点击时刷新
  onTabItemTap() {
    this.getWeiboList(102803);
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 500
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {}
});
