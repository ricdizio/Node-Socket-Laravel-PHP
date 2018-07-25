
var token = "USE HERE YOUR JWT TOKEN GENERETE FROM LARAVEL";


var wss = "wss://";
if (document.location.protocol === "http:") {
   wss = "ws://";
}

var URL = document.location.toString().split("/")[2];

// Port of the socket server
let port = "3000";
let wsURL = wss + URL + ":" + port ;
let APP_CONFIG ={
	's_url': wsURL,
	'token': token
}

try
{

	var socket = io.connect(APP_CONFIG.s_url, { allowUpgrades: true, secure: false, query: 'jwt=' + APP_CONFIG.token});

    socket.on('connected', ()=> {
        console.log("Connected to the server");
    });

	socket.on('newNotification', (data,callback)=>{

		console.log("messege arrived from laravel");
		callback();
		console.log(data);
	});

	socket.on("connect_failed",function(){
		console.log("Error on conection");
	});
}

catch
{
	console.log("Error");
}