import { getUserInfo } from '../../utils/util';
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    passIndex: 0,
    gold: 0,
    selected: [{}, {}, {}, {}],
    selectList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    getUserInfo()
      .then(res => {
        this.setData({
          gold: res.gold,
          passIndex: res.checkpoint
        });
        return res.checkpoint;
      })
      .then(res => {
        this.getIdiom(res);
      });
  },

  // 获取成语
  getIdiom(curr) {
    wx.showLoading({ title: '加载中...', mask: true });
    wx.cloud
      .callFunction({
        name: 'pagination',
        data: {
          dbName: 'idiom',
          currPage: curr + 1,
          pageSize: 1
        }
      })
      .then(res => {
        const list = res.result.data[0];
        if (res.result.data.length == 0) {
          this.getIdiom(curr - 1);
          wx.showToast({
            title: '恭喜已通关',
            icon: 'success',
            duration: 2000
          });
        } else {
          this.setData(
            {
              list: [[list.pics, list.library, list.idiom, list.paraphrase]]
            },
            () => {
              this.setPassInfo();
              wx.hideLoading();
            }
          );
        }
      })
      .catch(() => wx.hideLoading());
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '看图猜成语',
      path: '/pages/guessTheIdiom/index'
    };
  },

  /* 设置关卡信息 */
  setPassInfo() {
    /* 初始化默认已选择列表 */
    let selectedArr = [];
    for (let i = 0; i < 4; i++) {
      selectedArr.push({
        txt: '',
        index: -1
      });
    }

    const { list } = this.data;
    let info = list[0][1];
    info = info.split('').sort(() => {
      /* 随机打乱 */
      return Math.random() > 0.5 ? -1 : 1;
    });
    this.setData({
      selected: selectedArr,
      selectList: info,
      title: this.title()
    });
  },

  // 称号
  title() {
    const { passIndex } = this.data;
    if (passIndex < 10) {
      return '童生';
    }
    if (passIndex < 30) {
      return '秀才';
    }
    if (passIndex < 50) {
      return '举人';
    }
    if (passIndex < 100) {
      return '贡士';
    }
    if (passIndex < 200) {
      return '进士';
    }
    if (passIndex < 200) {
      return '探花';
    }
    if (passIndex < 500) {
      return '榜眼';
    }
    return '状元';
  },

  // 提示
  useHelp() {
    if (this.data.gold < 10) {
      wx.showToast({
        title: '金币不足',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    let { selectList, list, selected } = this.data;
    /* 当前错误项 */
    let errIndex = this.findIndex();
    /* 正确项位置 */
    let selectIndex = selectList.findIndex((item, index) => {
      if (item == list[0][2].charAt(errIndex)) {
        return index;
      }
    });
    /* 当前错误项上已经存在已选值，则将已选值放回选择列表中 */
    if (selected[errIndex].index >= 0) {
      this.setData({
        selectList,
        [`selected[${errIndex}].index`]: selected[errIndex].index,
        [`selected[${errIndex}].txt`]: selected[errIndex].txt
      });
    }
    this.setData({
      [`selected[${errIndex}].txt`]: selectList[selectIndex],
      [`selected[${errIndex}].index`]: selectIndex
    });
    this.setData(
      {
        gold: (this.data.gold -= 10),
        [`selectList[${selectIndex}]`]: ''
      },
      () => {
        this.verify();
      }
    );
    this.changeUser(this.data.gold, this.data.passIndex);
  },

  /* 查找错误位置 */
  findIndex() {
    const { list, selected } = this.data;
    let result = list[0][2];
    let index = -1;
    for (let i = 0; i < selected.length; i++) {
      if (selected[i].txt != result.charAt(i)) {
        index = i;
        break;
      }
    }
    return index;
  },

  /* 答案校验 */
  verify() {
    if (this.findIndex() < 0) {
      const { gold, list } = this.data;
      let data = list[0];
      this.setData({
        gold: gold + 2,
        isError: false
      });
      wx.showModal({
        title: data[2],
        content: `[释义]:${data[3]}`,
        showCancel: false,
        confirmText: '下一关',
        success: () => {
          this.nextPass();
          this.changeUser(this.data.gold, this.data.passIndex);
        }
      });
    } else {
      const { selected } = this.data;
      let list = selected.filter(item => {
        return item.index == -1;
      });
      if (list.length === 0) {
        this.setData({
          isError: true
        });
      }
    }
  },

  /* 选择 */
  picker(e) {
    let index = Number(e.currentTarget.dataset.index);
    let { selected, selectList } = this.data;
    if (selectList[index]) {
      for (let i = 0; i < selected.length; i++) {
        if (!selected[i].txt) {
          this.setData(
            {
              [`selected[${i}].txt`]: selectList[index],
              [`selected[${i}].index`]: index,
              [`selectList[${index}]`]: ''
            },
            () => {
              this.verify();
            }
          );
          break;
        }
      }
    }
  },

  /* 下一关 */
  nextPass() {
    let { passIndex } = this.data;
    this.setData(
      {
        passIndex: (passIndex += 1)
      },
      () => {
        this.getIdiom(passIndex);
      }
    );
  },

  /* 重新选择 */
  resetPicker() {
    let selectedArr = [];
    let { selected } = this.data;
    selected.forEach((item, index) => {
      if (item.index >= 0) {
        this.setData({
          [`selectList[${item.index}]`]: item.txt
        });
      }
      selectedArr.push({
        txt: '',
        index: -1
      });
    });
    this.setData({
      selected: selectedArr,
      isError: false
    });
  },
  /* 取消选择 */
  cancelPicker(e) {
    let { selected } = this.data;
    let index = Number(e.currentTarget.dataset.index);
    if (selected[index].index < 0) return;
    const idx = selected[index].index;
    this.setData({
      [`selectList[${idx}]`]: selected[index].txt,
      [`selected[${index}].txt`]: '',
      [`selected[${index}].index`]: -1,
      isError: false
    });
  },

  // 修改用户数据
  changeUser(gold, checkpoint) {
    const openid = wx.getStorageSync('openid');
    const db = wx.cloud.database();
    db.collection('user')
      .where({ _openid: openid })
      .get({
        success: res => {
          const data = res.data;
          if (data.length) {
            db.collection('user')
              .doc(data[0]._id)
              .update({
                data: {
                  gold,
                  checkpoint
                },
                success: res => {
                  // 更新数据成功
                  console.log(res);
                },
                fail: err => {
                  // 更新数据失败
                  console.error('err', err);
                }
              });
          } else {
            console.error('未查找到该用户');
          }
        },
        fail: err => console.error('[数据库] [查询记录] 失败：', err)
      });
  },

  // 重玩游戏
  resetPlay() {
    wx.showModal({
      title: '提示',
      content: '数据清零，重新开始',
      confirmText: '重玩',
      success: () => {
        this.changeUser(20, 0);
        this.setData(
          {
            gold: 20,
            passIndex: 0
          },
          () => {
            this.getIdiom(0);
          }
        );
      }
    });
  }
});
