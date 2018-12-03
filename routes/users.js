var express = require('express');
var router = express.Router();

//mongodb 数据库
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;//取特殊文章id的 数据库的模块
var url = 'mongodb://localhost:27017';
var dbname ='czblog';
var articleB = 'article';
var userB = 'user';


function formatTime(date){
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  var h = date.getHours();
  var mi = date.getMinutes();

  return y +'-'+ m +'-'+ d +' '+ h+':'+mi;

}

/* GET users listing. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url,(error,dbC) => {
  var db = dbC.db(dbname);
  db.collection(articleB).find({userid:req.session.userid}).sort({time:-1}).toArray().then((data) => {
    console.log(data);
    
    var userid = new ObjectID(req.session.userid)
    db.collection('user').findOne({_id:userid},function(error,user){
       
      res.render('users', {
        title: '用户首页',
        username: req.session.username,
        data:data,
        formatTime:formatTime,
        user:user,
        type:req.session.type    
      })


    })


   


  }).catch(function(error){
    console.log(error);
  })
    
  })
//   console.log(req.session.username);
//   console.log(req.sessionID);
//   if(req.session.username){
//       // res.send('已登录');
//       res.render('users',{
//         title:"用户首页",//不传title会报错
//         username:req.session.username
//       })
//   }else{
// console.log('没有登陆');
// // res.send('没有登录');
// res.render('users',{
//   title:"用户首页",//不传title会报错
//   username:req.session.username
// })

//   }
//   // res.send('respond with a resource');
});

//注册页
router.get('/register', function(req, res, next) {
  //  res.send('register');//不注释会影响下面的
  res.render('register',{title:"注册", username:req.session.username});
});

var crypto = require('crypto');//密码加密
//注册接口
router.post('/api-register',(req,res) => {
try{

  //获取到 注册页面提交的数据 req.body{username：'12',password:‘12’}
  console.log(req.body);
  var username = req.body.username;

  var md5 = crypto.createHash('md5');
  // console.log(req.body);
  var password= md5.update(req.body.password).digest('hex');//产生md5加密
  console.log(password);

  // var password = req.body.password;//因为有上一条所以这条作废
  var date = new Date();//存储注册时间
  var type = false;
  var user = {username,password,date,type}
  //存入数据库里面
MongoClient.connect(url,function(error,dbC){
  var db = dbC.db(dbname);
  //先做个查询，如果有这个用户就提示用户名已经存在，没有 注册成功
  db.collection('user').find({username}).toArray(function(error,findData){
    console.log(findData);
    if(findData.length){
      res.json({code:0,msg:"用户名已经存在"})

    }else{
      db.collection('user').insertOne(user,(error,data) => {

        console.log(data);
    
        //返回一个页面
      //返回json数据
      res.json({code:1,msg:"注册成功"})
        
      })
    }
  })
})

}catch(error){
  console.log(error);
  res.json({code:500,msg:error})
}


})



//登陆页
router.get('/login',(req,res) => {
  res.render('login',{
  title:'登陆', username:req.session.username,type:req.session.type
  })
})

//登陆接口
router.post('/api-login',(req,res) => {
  try
  { 
    var username = req.body.username;
   //var password = req.body.password;//因为密码加密了 所以这一条作废
    var md5 = crypto.createHash('md5');
    var password= md5.update(req.body.password).digest('hex');//产生md5加密
    

  var user = {username,password}
  MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection('user').find(user).toArray((error,data) => {
      if(data.length){
        //在req上面存的session，在给服务器响应之前
         var userObj = data[0];
         console.log(222,userObj);
        req.session.username = username;//在服务器上存储了对应的user信息 （登陆的标记）
        req.session.userid = userObj._id;
        req.session.type = userObj.type;
        console.log(22222,req.session.type);
      
        res.json({code:1,msg:"登陆成功"})//异步操作 不能写在上一条上面调用res.json相当于执行了end。执行之后在调用session没有意义
      
      }else{
        res.json({code:0,msg:"用户名或者密码错误"})


      }
      
    })
    
  })
  }catch(error){
    console.log(error);
    res.json({code:500,msg:error})
  }
  
  
})


router.get('/logout',(req,res) => {
req.session.destroy((error) => {//清除cookie
  if(error) throw error;
  console.log('session 清除成功');
  
  res.redirect('/');//重定向 （后端控制页面刷新）
  
})  
})








//发表文章
router.post('/publish',(req,res) => {
  console.log(req.body);
  var article = {
    title:req.body.title,
    content:req.body.content,
    time:new Date(),
    username:req.session.username,//用户名
    userid:req.session.userid,//用户id
    type:req.session.type 

  }
  console.log(article);
  MongoClient.connect(url,function(error,dbC){
    var db = dbC.db(dbname);
    db.collection('article').insertOne(article,(error,data) => {
      if(error) throw error;
      res.redirect('/users');
      
    })
  })
})


//产生文章详情页（a标签肯定是get请求）
router.get('/article/:aid',(req,res) => {
  //获取文章的id
  console.log(req.params.aid);
  //根据文章的id区数据库中文章的详情
  //注意要查询的id是个对象还是字符串
  var aid = new ObjectID(req.params.aid);
  MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection('article').findOneAndUpdate({_id:aid},{
      $inc:{
        pv:1
      }

    },{
      returnOriginal:false
    },(error,data) => {
      console.log(data);
      res.render('article',{
        title:'文章详情',
        username:req.session.username,
        article:data.value,
        formatTime,
        userid:req.session.userid,
        aid:req.params.aid,
        type:req.session.type 

      })
    })
    
  })


 
  
})

var path = require('path')
var fs = require('fs')
//上传图片的路由
router.post('/file_upload',(req,res) => {
  console.log(req.files[0],'2222');
  //头像的目标地址
  var ts=Date.now();//当前时间的时间磋 拼到图片地址里防止地址重复
  imgUrl = '/images/'+ ts + req.files[0].originalname;
 des_file = path.join(__dirname,'../public'+imgUrl);
  fs.readFile(req.files[0].path,function(error,data){
    fs.writeFile(des_file,data,function(error){
      console.log('图片上传功',des_file);
      //把图片地址插入数据库中
      MongoClient.connect(url,(error,dbC) => {
        var db = dbC.db(dbname);
        var userid = new ObjectID( req.session.userid);
        db.collection('user').updateOne({_id:userid},{
          $set:{
            headImgUrl:imgUrl
          }
        })
        .then((result) => {
          res.redirect('back')
        }).catch((err) => {
          
        });
      })

    })

  })
  
})




module.exports = router;
