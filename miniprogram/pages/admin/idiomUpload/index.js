import { uploadFile } from '../../../utils/util';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    idiomPics: '',
    library: '',
    idiom: '',
    paraphrase: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  idiomLibrary(e) {
    this.setData({
      library: e.detail.value
    });
  },

  correctIdiom(e) {
    this.setData({
      idiom: e.detail.value
    });
  },

  idiomParaphrase(e) {
    this.setData({
      paraphrase: e.detail.value
    });
  },

  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: res => {
        this.setData({
          idiomPics: res.tempFilePaths[0]
        });
      }
    });
  },

  upload() {
    const { idiomPics, paraphrase, idiom, library } = this.data;
    uploadFile(idiomPics).then(res => {
      const db = wx.cloud.database();
      db.collection('idiom')
        .add({
          data: {
            pics: res.fileID,
            library,
            idiom,
            paraphrase
          }
        })
        .then(() => {
          wx.showModal({
            title: '提示',
            content: '上传成功',
            showCancel: false,
            success: () => {
              wx.navigateBack();
            }
          });
        })
        .catch(() => {});
    });
  }
});
