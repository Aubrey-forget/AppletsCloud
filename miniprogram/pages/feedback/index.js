import { getUnix, formatDate, setLog } from '../../utils/util';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    content: ''
  },

  getTitle(e) {
    const { value } = e.detail;
    this.setData({ title: value });
  },

  getContent(e) {
    const { value } = e.detail;
    this.setData({ content: value });
  },

  clkSubmit() {
    const { title, content } = this.data;
    if (!title || !title.trim()) {
      return wx.showToast({
        icon: 'none',
        title: '请输入标题'
      });
    }

    if (!content || !content.trim()) {
      return wx.showToast({
        icon: 'none',
        title: '请输入您的建议'
      });
    }

    const db = wx.cloud.database();
    db.collection('feedback')
      .add({
        data: {
          createTime: formatDate(getUnix(), 'Y-M-D h:m:s'),
          title: title.trim(),
          content: content.trim()
        }
      })
      .then(() => {
        wx.showToast({
          icon: 'none',
          title: '感谢您宝贵的意见',
          success: () => {
            setTimeout(() => {
              wx.navigateBack({});
            }, 1500);
          }
        });
      })
      .catch(err => {
        setLog('反馈意见添加失败：' + err);
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {}
});
