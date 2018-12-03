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


//管理员
/* GET users listing. */
router.get('/', function(req, res, next) {
    MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}).toArray().then((data) => {
      console.log(data,22222);
      
      var userid = new ObjectID(req.session.userid);
      
        res.render('admin', {
          title: '管理员首页',
          username: req.session.username,
          data:data,
          formatTime,
         
          type:req.session.type
      
        })

    }).catch(function(error){
      console.log(error);
    })
      
    })
  
  
  });



  router.get('/user', function(req, res, next) {
    MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection(userB).find({}).toArray().then((data) => {
      console.log(data,22222);
      
      var userid = new ObjectID(req.session.userid);
      
        res.render('userindex', {
          title: '用户首页',
          username: req.session.username,
          data:data,
          formatTime,
          type:req.session.type
      
        })

    }).catch(function(error){
      console.log(error);
    })
      
    })
  
  
  });



  //添加用户
  router.get('/user/adduser', function(req, res, next) {
    //  res.send('register');//不注释会影响下面的
    res.render('useradd',{title:"添加用户", username:req.session.username});
  });


  //删除用户
router.get('/deluser/:id',function(req,res){
  var id = new ObjectID (req.params.id) || '';
  MongoClient.connect(url,(err,dbC) => {
    var db = dbC.db(dbname);
    db.collection('user').remove({_id:id}).then(function(){ 
            
        res.redirect('back')
     })
   
   }) 
  })
  //修改用户
  router.get('/ediuser/:id',function(req,res){
    var id = new ObjectID (req.params.id) || '';
    MongoClient.connect(url,(err,dbC) => {
      var db = dbC.db(dbname);
      // db.collection('user').find({_id:{$gt:id}}).toArray().then((data) => {
        db.collection('user').findOne({_id:id}).then((data)=>{ 
          console.log(data,777);
        res.render('ediuser',{
          title:"修改用户", 
          data:data,
          formatTime,
          // user:user,
      
        
        
        });
        // console.log(username,888);
       })
     
     }) 
    })

    //修改接口
    router.post('/api-ediuser',(req,res) => {
      try{
      
        //获取到 注册页面提交的数据 req.body{username：'12',password:‘12’}
        console.log(req.body);
        var id =  new ObjectID (req.body.userid) || '';
        var uname = req.body.username;
        var pword = req.body.password;
        var dte = new Date(req.body.date);
         var type = req.body.type;
        console.log(uname,444444);

        MongoClient.connect(url,function(error,dbC){
          var db = dbC.db(dbname);
          //先做个查询，如果有这个用户就提示用户名已经存在，没有 注册成功
          db.collection('user').updateOne({_id:id},
            {
              $set:{
                username:uname,
                password:pword,
                date:dte,
                type:type
              } 
            } ,function(err,results){
              if(err){
                  res.json("-1");
              }else{
                
                  res.json("1");
              }
          });
      
    
      })
      
      }catch(error){
        console.log(error);
        res.json({code:500,msg:error})
      }
 
      })





      //文章管理
      router.get('/content', function(req, res, next) {
        MongoClient.connect(url,(error,dbC) => {
        var db = dbC.db(dbname);
        db.collection(articleB ).find({}).toArray().then((data) => {
          console.log(data,22222);
          
          var _id = new ObjectID(req.session.userid);
          
            res.render('articleindex', {
              title: '内容管理首页',
              username: req.session.username,
              data:data,
              formatTime,
              type:req.session.type
          
            })
    
        }).catch(function(error){
          console.log(error);
        })
          
        })
      
      
      });
    
        //添加文章
  router.get('/content/articleadd', function(req, res, next) {
    //  res.send('register');//不注释会影响下面的
    res.render('articleadd',{title:"添加文章", username:req.session.username});
  });


   //删除文章
router.get('/delarticle/:id',function(req,res){
  var id = new ObjectID (req.params.id) || '';
  MongoClient.connect(url,(err,dbC) => {
    var db = dbC.db(dbname);
    db.collection('article').remove({_id:id}).then(function(){ 
            
        res.redirect('back')
     })
   
   }) 
  })

 //修改用户
 router.get('/ediarticle/:id',function(req,res){
  var id = new ObjectID (req.params.id) || '';
  MongoClient.connect(url,(err,dbC) => {
    var db = dbC.db(dbname);
    // db.collection('user').find({_id:{$gt:id}}).toArray().then((data) => {
      db.collection('article').findOne({_id:id}).then((data)=>{ 
        console.log(data,99999);
      res.render('ediarticle',{
        username:req.session.username,
        title:"修改文章", 
        data:data,
        formatTime,
        // user:user,
    
      
      
      });
      // console.log(username,888);
     })
   
   }) 
  })

  //修改接口
  router.post('/api-ediarticle',(req,res) => {
    try{
    
      //获取到 注册页面提交的数据 req.body{username：'12',password:‘12’}
      console.log(req.body);
      var id =  new ObjectID (req.body.id) || '';
      var title = req.body.title;
      var content = req.body.content;
      // var dte = new Date(req.body.date);
      //  var type = req.body.type;
      console.log(title,444444);

      MongoClient.connect(url,function(error,dbC){
        var db = dbC.db(dbname);
        //先做个查询，如果有这个用户就提示用户名已经存在，没有 注册成功
        db.collection('article').updateOne({_id:id},
          {
            $set:{
              title:title,
              content:content
            
            } 
          } ,function(err,results){
            if(err){
                res.json("-1");
            }else{
              
                res.json("1");
            }
        });
    
  
    })
    
    }catch(error){
      console.log(error);
      res.json({code:500,msg:error})
    }

    })




    router.get('/tongji',(req,res) => {
      res.render('tongji',{
        title:'网站统计',
        username:req.session.username
      })  
     })
     
     
     // 统计每天的注册量
     router.get('/api/tj-a1',(req,res) => {
       MongoClient.connect(url,function(err,dbC){
         var db = dbC.db(dbname);
         db.collection('user').aggregate([
           // 统计每天的发表文章的 文章数据
           // 将time 字段格式化为 年-月-日  的字符串 ，结果放在新属性yearMonthDay 中
           {
             $project:{
               yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }
             }
           }
           //根据 day属性去统计 相同日期的记录 出现的次数 的和
           // 返回的结果包含_id属性和num属性  ，id属性是yearMonthDay的值，num属性是相同yearMonthDay的记录和
           ,{$group:{_id:'$yearMonthDay',num:{$sum:1}}}
           // 根据_id，降序
           ,{$sort:{_id:1}}//-1是降序最近处是最后的值 1在图表中显示才是正常的
     
         ]).toArray(function(err,data){
           console.log(data);
           res.json(data)
         })
       })
     
     })

     router.get('/tongji2',(req,res) => {
      res.render('tongji2',{
        title:'文章发布统计',
        username:req.session.username
      })  
     })
     // 统计每天的发布文章量
     router.get('/api/tj-a2',(req,res) => {
      MongoClient.connect(url,function(err,dbC){
        var db = dbC.db(dbname);
        db.collection('article').aggregate([
          // 统计每天的发表文章的 文章数据
          // 将time 字段格式化为 年-月-日  的字符串 ，结果放在新属性yearMonthDay 中
          {
            $project:{
              yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$time" } }
            }
          }
          //根据 day属性去统计 相同日期的记录 出现的次数 的和
          // 返回的结果包含_id属性和num属性  ，id属性是yearMonthDay的值，num属性是相同yearMonthDay的记录和
          ,{$group:{_id:'$yearMonthDay',num:{$sum:1}}}
          // 根据_id，降序
          ,{$sort:{_id:1}}//-1是降序最近处是最后的值 1在图表中才是正常的
    
        ]).toArray(function(err,data){
          console.log(data,2222222);
          res.json(data)
        })
      })
    
    })

  module.exports = router;
