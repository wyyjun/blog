//获取数据库相关配置
var dbSetting = require('./db');
var MongoClient = require('mongodb').MongoClient;
//发表评论
//跟数据库相关的操作
function comment({content,aid,userid,time=new Date()},callback){
    // console.log(callback,222);
    MongoClient.connect(dbSetting.url,(error,dbC) => {
        var db = dbC.db(dbSetting.dbname);
        var insertObj = {content,aid,userid,time}
        db.collection(dbSetting.commentTable).insertOne(insertObj,(error,data) => {
            console.log('插入成功');
            callback()
        })
        
    })
}

//获取评论
//根据文章id获取所有评论
function getCommentList(aid,callback){
MongoClient.connect(dbSetting.url,(error,dbC) => {
    var db = dbC.db(dbSetting.dbname);
    db.collection(dbSetting.commentTable)
    .aggregate([
        {$match:{aid:aid}}
        ,{
            $lookup:{
                //根据 commnet 表的userid 去user表中查_id
                localField:'userid',
                from:'user',
                foreignField:'_id',
                as:'user'
            }
        }
        ,{$unwind:'$user'}
        ,{ 
           $project:{
               user:{
                   password:0
               }
           } 
        }
    ])
    
    
    .toArray((error,data) => {
            
              callback(data);
    })
    
})
}
module.exports={
    comment,getCommentList
};