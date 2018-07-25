//imports
const jwt = require('jsonwebtoken');
const server = require('http').createServer();
const io = require('socket.io')(server);
const map = require('hashmap');
const bluebird = require("bluebird");

//Redis
const redis = require("redis");

/**********************************/
/********    Socket MAP     *******/
/**********************************/
var usersSoketsId = new map();


/**********************************/
/****    fucntion handler     *****/
/**********************************/
function handler(req, res) {
    res.writeHead(200);
    res.end("ok");
  }
  
// app key Configs
var envJWTSecret = "APP KEY JWT FROM LARAVEL ENV";
// Port SocketServer
var port = 3000;

console.log("APPKEY: "  + envJWTSecret )


/**********************************/
/********     REDIS     ***********/
/**********************************/

var redisClient = redis.createClient();
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
redisClient.subscribe("message");

/**********************************/
/******** SOCKETS TOKEN ***********/
/**********************************/

io.use(function(socket, next) {

    var decoded = null;

    try {
        decoded = jwt.verify(socket.handshake.query.jwt, envJWTSecret);
    } catch (err) {
        console.error(err);
        next(new Error('Invalid token!'));
    }
    if (decoded) {
        
        // everything went fine - save userId as property of given connection instance
        socket.usuario = decoded.user // Save user in socket obj
        return next();

    } else {
        // invalid token - terminate the connection
        socket.conn.close();
        next(new Error('Invalid token!'));
        
    }
});

/**********************************/
/*****   ON CONNECTION EVENT    ***/
/**********************************/
  
io.on('connection', function(socket) {

    //socket.join('usuario.' + socket.usuario);
    console.log("User: " + socket.user + " connected with socket.id " +  socket.id);
  
    //Push socket id and user in usermap
    usersSoketsId.set(socket.user,socket.id);

    console.log("added user to mapUsers: " + usersSoketsId.get(socket.user));


  /**********************************/
  /*********   Disconnect   *********/
  /**********************************/
  
    socket.on('disconnect', function () {
  
      let toRemove = socket.user;
      
      console.log("user: " + toRemove +" with socket.id " + socket.id +" is disconnect");
  
      //delete socket id and user in usermap
      try{
        usersSoketsId.delete(toRemove);
        console.log("user was removed with socket id " + socket.id);
      }
      catch{
        console.log("error to try delete user in the userMap")
      }
      
      socket.conn.close();
   
    });
  
});


/**********************************/
/*******  LARAVEL EVENT   *********/
/**********************************/

redisClient.on('message',function(channel, data){

    let eventNotPopUp;
  
    //Obj to JSON
    eventNotPopUp = JSON.parse(data);

    //Extraemos Usuario del evento
    let userOfEvent = data.usuario;
  
    console.log("Event recived from laravel " + channel + " to user " + userOfEvent );
  
    let sId = usersSoketsId.get(userOfEvent);
  
    //User is not connected
    if(sId)
    {
      console.log("Notification for: " + userOfEvent);
  
      // sending to individual socketid (private message)

      io.sockets.connected[sId].emit('newNotification', eventNotPopUp ,function (callback) {
        console.log("messege arrived");
        eventNotPopUp.delivered = true;
      });
      
    }
    else
    {
      console.log("User is not connected");
      eventNotPopUp.delivered = false;
    }
});