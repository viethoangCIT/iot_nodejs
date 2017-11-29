var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");

//dựng server
var server = require("http").Server(app);
//khai bao thư viện socket io
var io = require("socket.io")(server);
server.listen(3000);
var pg = require('pg');

var config = {
  user: 'postgres', //tenuser
  database: 'my_db', //tên database
  password: '1234', //PGPASSWORD
  host: 'localhost', //đường dẫn
  port: 5432, //cổng kết nối
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, //tối đa 30s cho mỗi concect
};

//khởi tạo module postgres

var pool = new pg.Pool(config);
var nhiet_do = 0;
var do_am = 0;
var id = "";

//code ketnoi
app.get("/",function(req,res){
  pool.connect(function(err, client, done) {
    if(err) {
      return console.error('error fetching client from pool', err);
    }

    //use the client for executing the query
    client.query('SELECT * FROM iot ORDER BY id DESC LIMIT 1', function(err, result) {
      //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
      done();

      if(err) {
        res.end();
        return console.error('error running query', err);
      }
      //gán nhiệt độ cho biến nhiệt độ
      id = result.rows[0].id;
      nhiet_do = result.rows[0].nhiet_do;
      do_am = result.rows[0].do_am;
      // console.log(id);
      //console.log("nhiet do"+result.rows[0].nhiet_do);
      res.render("home",{danhsach:result});
      //res.render("sinhvien_list");
    });
  });
});

//BEGIN SOCKETIO
io.on("connection",function(socket){
  console.log("co ket noi" + socket.id);

  //lắng nghe sự kiện click tăng nhiệt độ

  //BEGIN: socket.on tăng nhiệt độ
  socket.on("client-send-tang-nhiet-do",function(){
    nhiet_do = nhiet_do + 1;
    var sql = "UPDATE iot SET nhiet_do = "+nhiet_do+" WHERE id = "+id;
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //use the client for executing the query
      client.query(sql, function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done();
        if(err) {
          return console.error('error running query', err);
        }
        io.sockets.emit("server-send-nhiet-do",nhiet_do);
      });
    });
  });//ENG: socket.on tăng nhiệt độ


  //lắng nghe sự kiện click giảm nhiệt độ
  //BEGIN:socket.on giảm nhiệt độ
  socket.on("client-send-giam-nhiet-do",function(){
    nhiet_do = nhiet_do - 1;
    var sql = "UPDATE iot SET nhiet_do = "+nhiet_do+" WHERE id = "+id;
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //use the client for executing the query
      client.query(sql, function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done();
        if(err) {
          return console.error('error running query', err);
        }
        io.sockets.emit("server-send-nhiet-do",nhiet_do);
      });
    });
  });//END: socket.on giảm nhiệt độ

  //BEGIN: socket.on tăng do am
  socket.on("client-send-tang-do-am",function(){
    do_am = do_am + 1;
    var sql = "UPDATE iot SET do_am = "+do_am+" WHERE id = "+id;
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //use the client for executing the query
      client.query(sql, function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done();
        if(err) {
          return console.error('error running query', err);
        }
        io.sockets.emit("server-send-do-am",do_am);
      });
    });
  });//ENG: socket.on tang do am

  //BEGIN: socket.on giam do am
  socket.on("client-send-giam-do_am",function(){
    do_am = do_am - 1;
    var sql = "UPDATE iot SET do_am = "+do_am+" WHERE id = "+id;
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //use the client for executing the query
      client.query(sql, function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done();
        if(err) {
          return console.error('error running query', err);
        }
        io.sockets.emit("server-send-do-am",do_am);
      });
    });
  });//ENG: socket.on giam do am

  //BEGIN: socket.on them moi nhiet do
  socket.on("client-send-data",function(data){

    console.log(data.nd+" - "+data.da);
    var sql = "INSERT INTO iot(nhiet_do, do_am) VALUES("+data.nd+","+data.da+")";
    pool.connect(function(err, client, done) {
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      //use the client for executing the query
      client.query(sql, function(err, result) {
        //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
        done();
        if(err) {
          return console.error('error running query', err);
        }
        console.log(data.nd+" - "+data.da);
        // io.sockets.emit("server-send-data");
      });
    });
  });//ENG: socket.on them moi do am

});//END SOCKETIO

// app.get("/sinhvien/list",function(req,res){
//
//   pool.connect(function(err, client, done) {
//     if(err) {
//       return console.error('error fetching client from pool', err);
//     }
//
//     //use the client for executing the query
//     client.query('SELECT * FROM sinhvien', function(err, result) {
//       //call `done(err)` to release the client back to the pool (or destroy it if there is an error)
//       done();
//
//       if(err) {
//         res.end();
//         return console.error('error running query', err);
//       }
//       // console.log(json(result));
//       console.log("nhiet do: "+result.rows[0].nhiet_do);
//       res.render("sinhvien_list",{danhsach:result});
//
//       //res.render("sinhvien_list");
//     });
//   });
// });
