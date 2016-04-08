var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var app = express();
var server = app.listen(8000, function(){
    console.log("listening on port 8000\nPress Ctrl-C to stop.");
});
var io = require('socket.io').listen(server);
app.use(express.static(path.join(__dirname, "./static")));
app.use(session({secret: 'keyboard cat', cookie: { maxAge: 60000}, resave: true, saveUninitialized: true}));
app.use(bodyParser.urlencoded({extended:true}));
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');


app.get('/', function(req, res){
    res.render('index');
    if(typeof(users) == 'undefined'){
        users = {};
    }

    if(typeof(messages) == 'undefined'){
        messages = [];
    }
});
io.sockets.on('connection', function(socket){
    console.log("Connected on socket ", socket.id);
    socket.on('disconnect', function(){
        console.log('a user disconnected');
        console.log(socket.id + ' has disconnected from the chat.');
        delete users[socket.id];
    });
    
    
    socket.on('new_user', function(data){
        console.log("New user logged in: "+ data.name + ", socket id: " + socket.id);
        users[socket.id] = data.name;
        user = data.name;
        socket.emit("user_login", {messages:messages, users:users, thisuser:user});
        socket.broadcast.emit("newuser_login", {newuser:user})
    });

    socket.on('new_message', function(data){
        console.log("New message received: ", data);
        console.log(users, data.userid)
        userid="/#" + data.userid
        sender = users[userid]
        console.log(sender);
        messages.unshift({sender:sender, timestamp:data.timestamp, message:data.message});
        io.emit("broadcast_message", {message:data.message, sender:sender});
    })
});

