var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017'
var dbname = 'czblog';
var articleB  = 'article';
var userB = 'user';

function formatTime(date){
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  var h = date.getHours();
  var mi = date.getMinutes();

  return y +'-'+ m +'-'+ d +' '+ h+':'+mi;

}


/* GET home page. */

router.get('/', function(req, res, next) {
  //把index模板中的数据渲染之后给浏览器
  //xss脚本攻击
 /* res.render('index', { title: '首页',a:'哈哈哈', username:req.session.username
// ,arr:[
//   {title:'第一条新闻',desc:'2018年11月11日销售额再创新高'},
//   {title:'第二条新闻',desc:'2018年11月15日上午双十一货物运输中再次出现意外，货车自燃起火'}
// ],isLogin:true
// ,c:'<script>var d = new Date();var y=d.getFullYear(),mo=d.getMonth()+1,dd=d.getDate(),h=d.getHours(),m=d.getMinutes(),s=d.getSeconds();document.write("今天的时间是：" + y + "-" + mo + "-"+dd + "-"+h + ":"+m + ":"+s);</script>'

});*/





  //数据库中把文章列表查出来，渲染到uses模板
  MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection(articleB).find({},{limit:20}).sort({time:-1}).toArray().then((data) => {
      console.log(data);
      res.render('index', {
        title: '首页',
        username: req.session.username,
        type: req.session.type,
        data:data,
        formatTime:formatTime,
        pageNum:1,
        preUrl:'/page/',
        nextUrl:'/page/2'
      })


    }).catch(function(error){
      console.log(error);
    })
  })


});

router.get('/page/:num',(req,res) => {
  console.log(req.params.num);
  var pageSize = 20;//一页显示多少条数据
  var num = parseInt(req.params.num);//要显示的页面
  console.log(num);
  MongoClient.connect(url,(error,dbC) => {
    var db = dbC.db(dbname);
    db.collection('article').find({},{
      skip:(num-1)*pageSize,
      limit:pageSize
    }).toArray((error,data) => {
      console.log(data.length);

      res.render('index', {
        title: '首页',
        username: req.session.username,
        data:data,
        formatTime:formatTime,
        pageNum:num,
        preUrl:'/page/'+(num-1),
        nextUrl:'/page/'+(num+1)
      })

    })

    
  })
  
})
module.exports = router;
