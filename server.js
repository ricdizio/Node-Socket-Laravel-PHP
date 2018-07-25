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
        socket.usuario = decoded.usuario // Guardamos usuario
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
    console.log("Se conecto el usuario: " + socket.usuario + " socket.id " +  socket.id);
  
    //Push socket id y usuario en map
    usersSoketsId.set(socket.usuario,socket.id);

    console.log("se agrego al map de usuarios " + usersSoketsId.get(socket.usuario));


  /**********************************/
  /*********   Disconnect   *********/
  /**********************************/
  
    socket.on('disconnect', function () {
  
      let toRemove = socket.usuario;
      
      console.log("usuario: " + toRemove +" con socket.id " + socket.id +" se desconecto");
  
      //delete socket id y usuario en map
      try{
        usersSoketsId.delete(toRemove);
        console.log("usuario removido con socket id " + socket.id + " se removio con éxito");
      }
      catch{
        console.log("error al eliminar usuario del user socket id map")
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
  
    console.log("Evento recibido de laravel " + channel + " para el usuario " + userOfEvent );
  
    let sId = usersSoketsId.get(userOfEvent);
  
    //Si no esta conectado
    if(sId)
    {
      console.log("notificacion para: " + userOfEvent);
  
      // sending to individual socketid (private message)

      io.sockets.connected[sId].emit('newNotification', eventNotPopUp ,function (callback) {
        console.log("el mensaje llego");
        eventNotPopUp.entregado = true;
      });
      
    }
    else
    {
      console.log("usuario no conectado");
      eventNotPopUp.entregado = false;
    }
});