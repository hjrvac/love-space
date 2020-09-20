// pages/loves/setting/setting.js
const app = getApp();
var userInfo;
//var userInfo_against;
var userInfo_against={
  avatarUrl:'',
  nickName:'t'
};
wx.cloud.init({
  env: 'hjr20200906-0y44d'
})
const DB = wx.cloud.database()
var that;
var openid_gb;
var id;
var openid_against;
var cp_id;
var weather='';
var weather_against='';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden:true,
    sex:0,
    partner:true,
    dates:'',
    start:'',
    yima:'',
    photo:[],
    pic:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    that = this;
    wx.getSetting({
      withSubscriptions: true,
      success:function(res){
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
              success: function(res) {
                  // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
                  // 根据自己的需求有其他操作再补充
                  // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
                 that.setData({
                   userInfo:res.userInfo
                 })
                 console.log(userInfo);
                 console.log(res);
                  wx.login({
                      success: res => {
                          // 获取到用户的 code 之后：res.code
                          console.log("用户的code:" + res.code);
                          console.log(res);
                        }
                  });
              }
          });
        }  else {
          // 用户没有授权
          that.setData({
              hidden: false 
          });
        }
      }
    })
    wx.cloud.callFunction({
      name: "getOpenid",
      success(res) {
        let openid = res.result.openid;
        openid_gb=openid;
        app.openid=openid;
        console.log('open1:',openid);
        // 判断数据库中是否已经有数据
        DB.collection('index').where({
          _openid: openid,
        })
        .get().then(ress => {
          if(ress.data.length!=0){
            console.log('ress.id:',ress.data[0]._id);
            id = ress.data[0]._id;
            app.id=id;
            cp_id = ress.data[0].cp_id;
            app.cp_id=cp_id;
            console.log('iud:',openid)
            that.setData({
              dates:ress.data[0].birthday,
              start:ress.data[0].start,
              sex:ress.data[0].sex,
            })
            app.start=ress.data[0].start;
            app.dates=ress.data[0].birthday;

            //weather
            that.getLocation();
            if(openid_against!=null){
              that.getPartnerWeather();
            }
            
            //获取月经日期
            DB.collection('cp').doc(cp_id)
            .get({
              success: function(ress) {
                // res.data 是包含以上定义的两条记录的数组
                console.log(ress);
                if(ress.data.yima!=undefined){
                  that.setData({
                  yima:ress.data.yima,
                 })
                 app.yima=ress.data.yima;
                }
              },
              fail:function(res){
                console.log('shibi')
              }
            })          
          }
        });
      },
      fail(res) {
        console.log('登录失败', res)
      } 
    })
//     if (getCurrentPages().length != 0) {
//       //刷新当前页面的数据
//       getCurrentPages()[getCurrentPages().length - 1].onLoad()
// }
    
   
  
    
    // wx.showShareMenu({
    //   withShareTicket: true
    // })
  },

  userAdd(openId) {
    var user = userInfo;
    wx.setStorageSync('index', user);
 
    DB.collection('index').add({
      // data 字段表示需新增的 JSON 数据
      data: user
    }).then(res => {
      console.log(res)
      // wx.switchTab({
      //   url: '/pages/studycentre/studycentre',
      // })
    })
  },

  onGetUserInfo: function(e){
    console.log(e);
    userInfo = e.detail.userInfo;
 
    wx.cloud.callFunction({
      name: "getOpenid",
      success(res) {
        let openid = res.result.openid;
        console.log('onGetUserInfo_openid'+openid);
        // 判断数据库中是否已经有数据
        DB.collection('index').where({
          _openid: openid,
        })
        .get().then(ress => {
          console.log('ressressressressressressressress',ress.data);
          if (ress.data.length == 0) {
            that.userAdd(openid)
            
          } 
         
        });
      },
      fail(res) {
        console.log('登录失败', res)
      }
    })
    this.setData({
      hidden:true
    });
    this.onLoad();
    this.onLoad();
    },

  

  setSex:function(e){
  //   console.log(id);
  //  if(id!=NUll){
  //     that.setData({
  //       hidden:false,
  //     })
  //  }
    DB.collection('index').doc(id).update({
      data:{
      sex:e.detail.value  
      }    
    })
    that.setData({
      sex:e.detail.value
    });
    
    
  },

  onGetPartner:function(e){
    //获得发送者openid
    var part=false; 
    console.log('us_a1'+openid_against);
      wx.showModal({
        title: '提示',
        content: '您已被对象所寻找，是否接受',
        success: function (e) {
          if (e.confirm) {
              // 用户点击了确定 
              part=true;
              DB.collection('index').doc(id).update({
                data:{
                  openid_against:openid_against 
                }    
              });  
              DB.collection('cp').add({
                // data 字段表示需新增的 JSON 数据
                data: {
                }
              }).then(res => {
                console.log(res)
                DB.collection('cp').where({
                  _openid: openid_gb,
                })
                .get().then(ress => {
                    console.log('ress.id:',ress.data[0]._id);
                    cp_id = ress.data[0]._id;
                    app.cp_id=cp_id;
                    DB.collection('index').doc(id).update({
                      data:{
                        cp_id:cp_id
                      }
                    })
                });
              })
            } else if (e.cancel) {
            }
          }
        })

      console.log('us_a2:'+openid_against),
      DB.collection('index').where({
        _openid: openid_against
      })
      .get({
        success: function(ress) {
          // res.data 是包含以上定义的两条记录的数组
          console.log(ress);
          userInfo_against=ress.data[0];
          console.log('user_ag:'+userInfo_against);
        },
        fail:function(res){
          console.log('shibi')
        }
      })
      
      that.onLoad();
    
  },

  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    console.log(e.detail.value)
    DB.collection('index').doc(id).update({
      data:{
      birthday:e.detail.value  
      }    
    })
   this.setData({
     dates: e.detail.value
   })
 },

 //获取开始日期
 bindStartDay: function (e) {
  console.log(e.detail.value)
  DB.collection('index').doc(id).update({
    data:{
    start:e.detail.value  
    }    
  })
 this.setData({
   start: e.detail.value
 })
},

yimaDay: function (e) {
  console.log(e.detail.value)
  DB.collection('cp').doc(cp_id).update({
    data:{
    yima:e.detail.value  
    }    
  })
 this.setData({
   yima: e.detail.value
 })
},


//退出
 exit:function(e){
  wx.clearStorage()
  try {
  wx.clearStorageSync()
  } catch(e) {
  // Do something when catch error
  }
   that.setData({
     hidden:false,
     userInfo:null,
   })
 },
 
//  获取地理位置
  getLocation:function(){
    var that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.log("lat:"+latitude+"lon:"+longitude)
        that.getCity(latitude,longitude)
      }
    })
   
  },

  //获取城市
  getCity: function (latitude, longitude){
    var that = this
    var url = "https://api.map.baidu.com/reverse_geocoding/v3/";
    var params={
      ak:"yGfGxZOxpM58punzSYIqGDDYYvZIQaZO",
      output:"json",
      location: latitude +","+longitude
    }
    wx.request({
      url: url,
      data:params,
      success:function(res){
        var city = res.data.result.addressComponent.city//当前城市
        var district = res.data.result.addressComponent.district//当前城区（例如我所在越秀区）
        var street = res.data.result.addressComponent.street//当前街道
        that.setData({
          city:city,
          street:street,
          district:district
        })
        var finalCity = city.substring(0,city.length-1)
        //console.log(finalCity)
        app.city=finalCity;
        DB.collection('index').doc(id).update({
          data:{
            location: finalCity
          }    
        });  

        // wx.showModal({
        //   title: '提示',
        //   content: '是否让您的对象知道您所在地的天气状况',
        //   success: function (e) {
        //     if (e.confirm) {
        //         // 用户点击了确定 
        //         DB.collection('index').doc(id).update({
        //           data:{
        //             location: finalCity
        //           }    
        //         });  
        //       } else if (e.cancel) {
        //       }
        //     }
        //   })

       that.getWeather(finalCity)
     
         //console.log(JSON.stringify(res))
      },
      fail:function(res){
        //console.log(JSON.stringify(res))
      },
      complete:function(res){
        //console.log(JSON.stringify(res))
      }
    })
  },
//获取天气
  getWeather:function(city){
    var that = this
    var url = "https://api.seniverse.com/v3/weather/daily.json"
    var params={
       location:city,
       key:"SJAH1fPYz1Z6bPAGC"
    }
    wx.request({
      url:url,
      data:params,
      fail: function (res) {
        console.log(JSON.stringify(res))
      },
      complete: function (res) {
        //console.log(JSON.stringify(res))
      },
      success:function(res) {
        //console.log(res.data.results[0].daily)
        if(weather==''){
          weather=res.data.results[0].daily
          app.weather=res.data.results[0].daily
        }else{
          weather_against=res.data.results[0].daily
          app.weather_against=res.data.results[0].daily
        }
        
        // var tmp = res.data.results[0].daily[0].high;
        // var min = res.data.results[0].daily[0].low;
        // var txt = res.data.results[0].daily[0].text_day;
        // var code = res.data.results[0].daily[0].code_day;
        // var qlty = res.data.results[0].daily[0].precip;
        // var sc = res.data.results[0].daily[0].wind_scale;
        // var fl = res.data.results[0].daily[0].wind_direction;
        // var daily_forecast = res.data.results[0].daily;
        // that.setData({
        //   tmp: tmp,
        //   min:min,
        //   txt: txt,
        //   code: code,
        //   qlty: qlty,
        //   sc: sc,
        //   fl: fl,
        //   daily_forecast: daily_forecast
        // })
        //console.log(res);
        //console.log(JSON.stringify(res))
      },
    })
  },
//获取对方天气
  getPartnerWeather:function(e){
    var location;
    DB.collection('index').where({
      _openid: openid_against
    })
    .get({
      success: function(ress) {
        // res.data 是包含以上定义的两条记录的数组
        //console.log(ress);
        location =ress.data[0].location;
        //console.log('user_ag_loc:'+location);
        that.getWeather(location); 
        app.city_against=location;
      },
      fail:function(res){
        console.log('shibi')
      }
    })
    
  },

  uploadPhoto:function(e){
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
        let pic = res.fileID

        DB.collection('cp').doc(app.cp_id)
        .get({
          success: function(ress) {
            // res.data 是包含以上定义的两条记录的数组
            console.log(ress);
         
              this.setData({
              photo:ress.data.photo,
             })
          
             console.log("zp"+ress.data.photo)
            
          },
          fail:function(res){
            console.log('shibi')
          }
        })
        var list=[{
          pic:pic
        }]
        this.setData({
          photo:this.data.photo.concat(list)
        })
        DB.collection('cp').doc(app.cp_id).update({
          data:{
          photo:this.data.photo
          }    
        })

      },
      fail: console.error
    })
    
    
  },
  








    /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  //获取天气





  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    that=this;


    wx.cloud.callFunction({
      name: "getOpenid",
      success(res) {
        let openid = res.result.openid;
        openid_gb=openid;
        app.openid=openid;
        console.log('open1:',openid);
        // 判断数据库中是否已经有数据
        DB.collection('index').where({
          _openid: openid,
        })
        .get().then(ress => {
          if(ress.data.length!=0){
            console.log('ress.id:',ress.data[0]._id);
            id = ress.data[0]._id;
            app.id=id;
            cp_id = ress.data[0].cp_id;
            app.cp_id=cp_id;
            console.log('iud:',openid)
            that.setData({
              dates:ress.data[0].birthday,
              start:ress.data[0].start,
              sex:ress.data[0].sex,
            })
            app.start=ress.data[0].start;
            app.dates=ress.data[0].birthday;

            //weather
            that.getLocation();   
            that.getPartnerWeather();
            
            //获取月经日期
            DB.collection('cp').doc(cp_id)
            .get({
              success: function(ress) {
                // res.data 是包含以上定义的两条记录的数组
                console.log(ress);
                if(ress.data.yima!=undefined){
                  that.setData({
                  yima:ress.data.yima,
                 })
                 app.yima=ress.data.yima;
                }
              },
              fail:function(res){
                console.log('shibi')
              }
            })          
          }
        });
      },
      fail(res) {
        console.log('登录失败', res)
      } 
    })

    openid_against=app.openid_against;
    console.log('us_a1'+openid_against);
    console.log(id);
    if(openid_against!=undefined && id!=null){
      this.setData({
        partner:false
      })
    };


    //若被邀请人同意，则自动获取其openid为openid_against 和 cp_id
    
    DB.collection('index').where({
      openid_against: openid_gb
    })
    .get({
      success: function(ress) {
        console.log(openid_gb);
        console.log('aga1:'+ress);
        // res.data 是包含以上定义的两条记录的数组
        if(ress.data[0].length!=0){
          DB.collection('index').doc(id).update({
            data:{
              openid_against:ress.data[0]._openid,
              cp_id:ress.data[0].cp_id
            }    
          });  
        }
      },
      fail:function(res){
        console.log('shibi')
      }
    })
    // wx.showShareMenu({
    //   withShareTicket: true
    // })
      
     
        // console.log('us_a2:'+openid_against),
        // DB.collection('index').where({
        //   _openid: openid_against
        // })
        // .get({
        //   success: function(ress) {
        //     // res.data 是包含以上定义的两条记录的数组
        //     console.log(ress.data)
        //   },
        //   fail:function(res){
        //     console.log('shibi')
        //   }
        // })
    
      
      
    
    
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
  onShareAppMessage: (res) => {
    if (res.from === 'button') {
      console.log("来自页面内转发按钮");
      console.log(res.target);
    }
    else {
      console.log("来自右上角转发菜单");
    }
    return {
      title: 'love',
      path: 'pages/loves/index/index?openid='+openid_gb,
      // imageUrl: "/images/1.jpg",
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  

})