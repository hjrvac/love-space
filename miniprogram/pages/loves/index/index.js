// pages/loves/index/index.js
var openid_against
var that
var app = getApp()
var openid_gb;
var id;
var currentdate;
wx.cloud.init({
  env: 'hjr20200906-0y44d'
})
const DB = wx.cloud.database()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    yimaDay:'',
    nowDate:'',
    start:'',
    during:'',
    weather:[],
    weather_against:[],
    city:'',
    city_against:'',
    photo:[],

  },

  yima:function(e){
    wx.switchTab({
      url: '../setting/setting',   //注意switchTab只能跳转到带有tab的页面，不能跳转到不带tab的页面
    })
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (res) {
    openid_gb=app.openid;
    id=app.id;
    that=this;
    
    var weatherList=[{
      date:'今天',
      daytime:app.weather[0].text_day,
      high:app.weather[0].high,
      low:app.weather[0].low
    },
    {
      date:'明天',
      daytime:app.weather[1].text_day,
      high:app.weather[1].high,
      low:app.weather[1].low
    }
  ]

  var weather_againstList=[{
    date:'今天',
    daytime:app.weather_against[0].text_day,
    high:app.weather_against[0].high,
    low:app.weather_against[0].low
  },
  {
    date:'明天',
    daytime:app.weather_against[1].text_day,
    high:app.weather_against[1].high,
    low:app.weather_against[1].low
  }]
   
    this.setData({
      weather:weatherList,
      weather_against:weather_againstList
    })
    console.log(app.weather)

    
    //console.log(res);
    if(res != null && res != undefined){
      openid_against=res.openid;
      app.openid_against=openid_against;
      console.log('id:',id);
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
    var current = new Date().getTime();//获取当前时间，单位ms
   // console.log(current);
    var yimaTime=new Date(app.yima);
    //console.log(current- yimaTime)
    const day=1000*60*60*24;
    var diff=current-yimaTime;
    //console.log('sss'+diff/day)
    if(app.yima==undefined){
      this.setData({
        yimaDay:"请点击设置"
      })
    }else{
      this.setData({
        yimaDay:(28-Math.floor((diff/day)%28))+'天'
      })
    }

    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    currentdate = year + seperator1 + month + seperator1 + strDate;
    this.setData({
      nowDate: currentdate
    })
    console.log(currentdate)

    var du=Math.floor((date-new Date(app.start))/(1000*60*60*24))
    this.setData({
      start:app.start,
      during:du
    })

    this.setData({
      city:app.city,
      city_against:app.city_against,
    })

    DB.collection('cp').doc(app.cp_id)
    .get({
      success: function(ress) {
        // res.data 是包含以上定义的两条记录的数组
        console.log(ress);
        if(ress.data.photo!=undefined){
          that.setData({
          photo:ress.data.photo,
         })
        }
      },
      fail:function(res){
        console.log('shibi')
      }
    })

  },

  photo:function(e){
    wx.switchTab({
      url: '../setting/setting',
    })
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