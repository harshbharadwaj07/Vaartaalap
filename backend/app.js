// Developeed by Harsh Bharadwaj
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const cors=require("cors");
const session=require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app=express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");

require('./models/user');

const PORT=process.env.PORT;

// import authenticated routes file
require("./auth")(app);

const server=app.listen(PORT,function(){
    console.log(`Server started at port ${PORT}`);
});

const io=require("socket.io")(server,{
    pingTimeout:120000,
    cors:{
        origin:["https://vaartalaap.onrender.com","http://localhost:3000"]
    }
});

io.on("connection",(socket)=>{
    console.log("connected to socket.io");
    socket.on("setup",(userData)=>{
        // console.log("User : "+userData);
        socket.join(userData);
        socket.emit("connected");
    });
    socket.on("join chat",(room)=>{
        // console.log("User joined the room : "+room);
        socket.join(room);
    });
    socket.on("new message",(newMsgReceive)=>{
        var chat=newMsgReceive.chat;
        if(!chat.users) return console.log("chat.users not defined");
        chat.users.forEach(user=>{
            if(user._id===newMsgReceive.sender._id) return;
            else socket.in(user._id).emit("message received",newMsgReceive);
        });
    });
    // group event handlers
    socket.on("new_grp_created", (newGroupData) => {
        const { admin } = newGroupData;
        // console.log(admin);
        if (!admin || !newGroupData.GrpChat) return;
        newGroupData.users.forEach((user) => {
        if (user._id !== admin._id) {
            socket.in(user._id).emit("display_new_grp",newGroupData);
        }
        });
    });
    
    socket.on("grp_updated", (updatedGroupData) => {
        // 'updater' is the one who updated the grp (admin/non-admin)
        const parseData = JSON.parse(updatedGroupData);
        if (!parseData.chat.admin || !parseData.chat.GrpChat) return;
        
        parseData.chat.users.forEach((user) => {
        if (user._id !== parseData.userId) {
            socket.to(user._id).emit("display_updated_grp", JSON.stringify(parseData));
        }
        });
        let temp="";
        if(parseData.type==="add"){
            temp="success";
        }else if(parseData.type==="delete"){
            temp="danger";
        }
        if (parseData.userId) {
        socket.to(parseData.userId).emit("display_updated_grp", (JSON.stringify({
            chat:parseData.chat,
            userId:parseData.userId,
            msg:temp
        })));
        }
    });
    
    socket.on("grp_deleted", (deletedGroupData) => {
    // 'admin' is the one who updated the grp
    const parseData=JSON.parse(deletedGroupData)
    if (!parseData.admin || !parseData.deletedGroup) return;

    parseData.deletedGroup.users.forEach((user) => {
      if (user._id !== parseData.admin) {
        socket.to(user._id).emit("remove_deleted_grp", parseData.deletedGroup);
      }
    });
  });


    socket.off("setup",()=>{
        console.log("USER DISCONNECTED");
        socket.leave(userData);
    })
})