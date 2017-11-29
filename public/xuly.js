//gọi lên server
var socket = io("http://localhost:3000");

socket.on("server-send-nhiet-do",function(data){
    $("#txtNhietDo").html("");
    $("#txtNhietDo").append(""+data);
});

socket.on("server-send-do-am",function(data){
    $("#txtDoAm").html("");
    $("#txtDoAm").append(""+data);
});

//code jquery
$(document).ready(function(){
  $("#form_nhiet_am").hide();

  $("#btnThietLap").click(function(){
      // $("#divThietLap").hide(1000);
      // $("#form_nhiet_am").show(2000);
       $("#divThietLap").load(this);

  });

  $("#btnLuu").click(function(){
      $("#form_nhiet_am").hide(1000);
      $("#divThietLap").show(2000);
      socket.emit("client-send-data",{nd:$("#ND").val(), da:$("#DA").val()});
  });

  //gui len server yeu cau tang nhiet do
  $("#btnTangNhietDo").click(function(){
    socket.emit("client-send-tang-nhiet-do");
  });
  $("#btnGiamNhietDo").click(function(){
    socket.emit("client-send-giam-nhiet-do");
  });

  $("#btnTangDoAm").click(function(){
    socket.emit("client-send-tang-do-am");
  });
  $("#btnGiamDoAm").click(function(){
    socket.emit("client-send-giam-do_am");
  });



});
