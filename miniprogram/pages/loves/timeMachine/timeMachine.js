// pages/loves/timeMachine/timeMachine.js
var that;
const app = getApp();
const DB = wx.cloud.database();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    axis:[],
    imgURL:"",
    inputvalue:"",
    tmDate:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */

   
  onLoad: function (options) {
    that=this;
    DB.collection('cp').doc(app.cp_id)
    .get({
      success: function(ress) {
        // res.data 是包含以上定义的两条记录的数组
        console.log(ress);
        if(ress.data.axis!=undefined){
          that.setData({
          axis:ress.data.axis,
         })
        }
      },
      fail:function(res){
        console.log('shibi')
      }
    })


    let startList = [{
      time:app.start,
      name:'',
      event:'我们在一起啦'
    }];
    that.setData({
      axis:this.data.axis.concat(startList)
    })
  },

  upload(){
    //把this赋值给that，就相当于that的作用域是全局的。
    let that = this;
    console.log("jaj");
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log("成功",res);
        that.uploadImage(res.tempFilePaths[0]);
      }
    })
  },
  uploadImage(fileURL) {
    wx.cloud.uploadFile({
      cloudPath:new Date().getTime()+'.png', // 上传至云端的路径
      filePath: fileURL, // 小程序临时文件路径
      success: res => {
        // 返回文件 ID
        console.log("上传成功",res)
        //获取文件路径
        this.setData({
          imgURL:res.fileID
        })
      },
      fail: console.error
    })
  },
  getvalue:function(e){
    var that =this
    //将value添加到定义data中
    that.setData({
      inputvalue:e.detail.value
    })
  },

  timeMachineDate:function(e){
    console.log(e.detail.value),
    this.setData({
      tmDate: e.detail.value
    })
  },

  uploadAxis:function(e){
    if(this.data.tmDate!=''){
      if(this.data.imgURL!=null || this.data.inputvalue!=null){
        var list=[{
          time:this.data.tmDate,
          event:this.data.inputvalue,
          image:this.data.imgURL,
        }]
        console.log(this.data.axis)
        that.setData({
          axis:this.data.axis.concat(list)
        })
        DB.collection('cp').doc(app.cp_id).update({
          data:{
          axis:this.data.axis,
          }    
        })
      }
    }
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})