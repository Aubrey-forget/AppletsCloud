// 动画名称
const ANIMATION_NAME = {
  centerEnter: 'pop-enter-center',
  centerLeave: 'pop-leave-center',
  topEnter: 'slide-enter-top',
  topLeave: 'slide-leave-top',
  bottomEnter: 'slide-enter-bottom',
  bottomLeave: 'slide-leave-bottom',
  leftEnter: 'slide-enter-left',
  leftLeave: 'slide-leave-left',
  rightEnter: 'slide-enter-right',
  rightLeave: 'slide-leave-right',
};

// 关闭弹窗
const closePopBox = thisArg => {
  thisArg.setData({ animationName: ANIMATION_NAME[`${thisArg.data.direction}Leave`] }, () => {
    setTimeout(() => {
      thisArg.setData({ realShowPopBox: false });
      thisArg.triggerEvent('closePopBox', {}, {});
    }, thisArg.data.duration);
  });
};

Component({
  properties: {
    // 是否显示弹窗
    showPopBox: {
      type: Boolean,
      value: false,
      observer(newVal) {
        if (newVal) {
          this.setData({
            // 真正控制弹窗显示与隐藏
            realShowPopBox: true,
            // 动画名称
            animationName: ANIMATION_NAME[`${this.data.direction}Enter`],
          });
        } else {
          closePopBox(this);
        }
      },
    },

    // 蒙层颜色
    maskBgColor: {
      type: String,
      value: 'rgba(0, 0, 0, 0.5)',
    },

    // 点击蒙层关闭弹窗
    tapMaskClose: {
      type: Boolean,
      value: false,
    },

    /**
     * slot位置
     * 可选 center top bottom left right
     */
    position: {
      type: String,
      value: 'center',
    },

    // 动画时长
    duration: {
      type: Number,
      value: 300,
    },

    /**
     * 动画进入开始和离开结束的方向
     * 可选 center top bottom left right
     */
    direction: {
      type: String,
      value: 'center',
    },
  },

  methods: {
    // 点击蒙层
    tapMask() {
      if (this.data.tapMaskClose) {
        closePopBox(this);
      }
    },

    // 阻止slot内事件冒泡
    stopPropagation() {
      return;
    },
  },
});
