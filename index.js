//Base template code from Socket.io chat template page: https://socket.io/get-started/chat
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var userList = ["Users Online: "];
var chatHistory = [];
var colorList = [];

function addZero(time){
  if(time <= 9){
    time = "0" + time;
  }
  return time;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  //stuff that occurs when users connect
    console.log('a user connected');
    io.emit('a user has joined');
    socket.emit('createCookie');

    for(var i in userList){
      io.emit('user online', userList[i]);
    }

    for(var i in chatHistory){
      socket.emit('chat message', chatHistory[i]);
    }

    //stuff that happens when user disconnects man
    socket.on('disconnect', () => {
      //reference that helped for indexOf command
      //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
      var tempIndex = userList.indexOf(socket.id);
      if(tempIndex >= 0){
        userList.splice(tempIndex,1);
      }

      io.emit('update users');
      console.log('user disconnected');
      io.emit('a user has left');
      for(var i in userList){
        io.emit('user online', userList[i]);
      }
    });

    //sends a message to the server
    socket.on('chat message', (msg) => {
      currentTime = new Date();
      getTime = addZero(currentTime.getHours()) + " : " + addZero(currentTime.getMinutes()) + " : " + addZero(currentTime.getSeconds());
      msg += "<p></p>" + getTime;
      chatHistory.push(msg);
      io.emit('chat message', msg);
      console.log('message: ' + msg + " time: " + getTime);
    });

    socket.on('nickname', (name) => {
      if(!(userList.includes(name))){
        var tempInd = userList.indexOf(socket.id);
        if(tempInd >= 0){
          userList.splice(tempInd,1);
        }
        socket.id = name;
        socket.emit('new Cookie', socket.id);
        userList.push(name);
        io.emit('update users');
        for(var i in userList){
          io.emit('user online', userList[i]);
        }
      } 
      else{
        socket.emit('refuse nickname');
      }
    });

    socket.on('check cookie', (cookie) => {
      if(cookie === ""){
        socket.emit('new Cookie', socket.id);
        io.emit('update users');
        socket.emit('check user'); //identifies user
        userList.push(socket.id);
      }
      else{
        //reference that was used for the split methods
        //https://www.w3schools.com/jsref/jsref_split.asp
        var tempData = cookie.split(",")[0].split("=")[1];
        if(userList.includes(tempData) === false){
          socket.id = tempData;
        } 
        else{
          //reference for creating random whole numbers by the user of user3937907
          //https://stackoverflow.com/questions/36660063/generate-random-whole-number
          socket.id = Math.floor((Math.random()*10000)+1);
          socket.emit('nickname taken', socket.id);
        }

        io.emit('update users');
        socket.emit('change userData', socket.id);
        socket.emit('check user');
        userList.push(socket.id);
      }
      for(var i in chatHistory){
        socket.emit('chat message', chatHistory[i]);
      }
      for(var i in userList){
        io.emit('user online', userList[i]);
      }
    });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});