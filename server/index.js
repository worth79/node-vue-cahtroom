var ws = require("nodejs-websocket");  //导入websocket模块
var moment = require('moment');  //时间模块

console.log("开始建立连接...")

let users = [];    //存储用户
let conns = {};    //客户端对象群
let groups = [];    //存储群聊

//向所有链接的客户广播消息
function boardcast(obj) {
  if(obj.bridge && obj.bridge.length){

    //遍历所有链接，发送消息
    obj.bridge.forEach(item=>{
      conns[item].sendText(JSON.stringify(obj));
    })
    return;
  }

  //如果有groupId且id不为0   ,则给群中每个成员广播 ，  发送消息时执行
  //此处实现群发消息
  if (obj.groupId) {
    //根据群号在数组中找到该群
    group = groups.filter(item=>{
      return item.id === obj.groupId
    })[0];
    //给群中每个成员发送消息
    group.users.forEach(item=>{
      conns[item.uid].sendText(JSON.stringify(obj));
    })
    return;
  }


  //connections方法：当有对象链接主机时触发， 这里在有对象链接服务器时发送雄消息
  server.connections.forEach((conn, index) => {
      conn.sendText(JSON.stringify(obj));
  })
}

//创建一个websocket服务器实例对象
var server = ws.createServer(function(conn){
  //一个conn对应一个客户端对象

  //text事件监听客户端向服务端发送的文本消息，回调函数接受一个客户端传递的字符串
  conn.on("text", function (obj) {
    obj = JSON.parse(obj);
    //将链接的客户端对象存入conns对象群中，健为id号，值为对象
    conns[''+obj.uid+''] = conn;

    /*根据类型判断操作类型

    */
    switch(obj.type){
      // 创建连接
      case 1:
        let isuser = users.some(item=>{
          return item.uid === obj.uid
        })
        //判断连接中是否已经存在该用户
        if(!isuser){
          //将姓名、id插入数组
          users.push({
            nickname: obj.nickname,
            uid: obj.uid,
            status: 1
          });
        } else {
          //映射数组，根据id得到当前的用户对象
          users.map((item, index)=>{
            if(item.uid === obj.uid){
              item.status = 1;
            }
            return item;
          })
        }
        //开始给每一个链接的用户广播信息
        boardcast({
          type: 1,  //类型
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          msg: obj.nickname+'加入聊天室',   //数据
          users: users,              //广播好友数组    就是所有的用户  可以优化
          groups: groups,         //广播群聊数组  就是总的所有的群    可优化
          uid: obj.uid,            //发送方id
          nickname: obj.nickname,  //发送方姓名
          bridge: obj.bridge       //私聊对象的id
        });
        break;
      // 注销
      case 2:
        // delete conns[''+obj.uid+''];
        users.map((item, index)=>{
          if(item.uid === obj.uid){
            item.status = 0;
          }
          return item;
        })
        boardcast({
          type: 1,
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          msg: obj.nickname+'退出了聊天室',
          users: users,
          groups: groups,
          uid: obj.uid,
          nickname: obj.nickname,
          bridge: []
        });
        break;

      // 创建群
      case 10:
        groups.push({
          id: moment().valueOf(),    //群聊的id由时间字符串组成
          name: obj.groupName,
          users: [{      //默认群聊成员中就自己一个人  每个群聊内置一个成员数组
            uid: obj.uid,
            nickname: obj.nickname
          }]
        })
        boardcast({
          type: 1,
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          msg: obj.nickname+'创建了群' + obj.groupName,
          users: users,
          groups: groups,
          uid: obj.uid,
          nickname: obj.nickname,
          bridge: obj.bridge
        });
        break;
      // 加入群
      case 20:
        let group = groups.filter(item=>{
          return item.id === obj.groupId
        })[0]
        group.users.push({
          uid: obj.uid,
          nickname: obj.nickname
        })
        boardcast({
          type: 1,
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          msg: obj.nickname+'加入了群' + obj.groupName,
          users: users,
          groups: groups,
          uid: obj.uid,
          nickname: obj.nickname,
          bridge: obj.bridge
        });
        break;
      // 发送消息
      default:
        boardcast({    //没有groups 、users,多了gorupId 、 status
          type: 2,
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          msg: obj.msg,
          uid: obj.uid,
          nickname: obj.nickname,
          bridge: obj.bridge,
          groupId: obj.groupId,
          status: 1
        });
        break;
    }
  })
  conn.on("close", function (code, reason) {
    console.log("关闭连接")
  });
  conn.on("error", function (code, reason) {
    console.log("异常关闭")
  });
  
}).listen(8001)
console.log("WebSocket建立完毕")