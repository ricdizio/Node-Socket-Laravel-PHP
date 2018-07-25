# Node JS Socket IO implementation using Laravel (PHP)


This project is a example of how to implement a broadcast messege from laravel or PHP using Node JS with Socket IO library


##Steps:

1- Create a Server in Node JS with Socket IO 

2- Create a REDIS server

3- Subscribe to "messege" channel from node js server

4- Publish a messege in channel "message" from php file using:
<br>
<br>
  <code>Redis::connection()->publish( 'message',"Message to broadcast with sockets");</code>
<br>
<br>
5- Use Event Redis.on("messege") in node js to emit a socket event with the data messege
 
