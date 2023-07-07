const dotenv=require("dotenv");
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


module.exports=function(app){

  // database connection
  require("./db/conn");

  const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions", // Collection to store sessions
    expires: 1800000
  });
  
  // Catch MongoDB connection errors
  store.on("error", function (error) {
    console.log("Session store error:", error);
  });

  app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie:{
      maxAge:1800000
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());


  // requiring database schema
  const userSchema=require('./models/user');
  userSchema.plugin(passportLocalMongoose);
  const chatSchema=require('./models/chat');
  const messageSchema=require('./models/message');

  const User=new mongoose.model("User",userSchema);
  const Chat=new mongoose.model("Chat",chatSchema);
  const Message=new mongoose.model("Message",messageSchema);

  passport.use(User.createStrategy());

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // main function for sending the user information
  app.get("/profile",function(req,res){
    if(req.isAuthenticated()){
      res.send(req.user);
    }else{
      res.status(401).json({message:"Not authenticated"});
    }
  });

  //// Search users
  app.get("/users",async function(req,res){
    if(req.isAuthenticated()){
      const keyword=req.query.search?{
        $or:[
          {name:{$regex:req.query.search, $options:"i"}},
          {username:{$regex:req.query.search, $options:"i"}}
        ]
      }:{};
      const users=await User.find(keyword).find({_id:{$ne:req.user._id}});
      res.send(users);
    }else{
      res.status(401).send("Not authorised");
    }
  });

  ////// Chats
  app.get("/getchats",async function(req,res){
    if(req.isAuthenticated()){
      try{
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users","-password")
        .populate("admin","-password")
        .populate("latestMsg")
        .sort({updatedAt:-1}) // sorting chats according to latest
        .then(async (results)=>{
          results=await User.populate(results,{
            path:"latestMsg.sender",
            select:"name pic username"
          });
          res.status(200).send(results);
        });
      }catch(error){
        res.status(400);
        throw new Error(error.message);
      }
    }else res.send("Not Authenticated");
  });

  app.post("/postchats",async function(req,res){
    if(req.isAuthenticated()){
      const userId=req.body.userId;
      if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
      }
      var isChat=await Chat.find({
        GrpChat: false,
        $and:[
          {users:{$elemMatch:{$eq:req.user._id}}},
          {users:{$elemMatch:{$eq:userId}}}
        ]
      }).populate("users","-password").populate("latestMsg");
      isChat=await User.populate(isChat,{
        path:"latestMsg.sender",
        select:"name pic username"
      });
      if(isChat.length>0){
        res.send(isChat[0]);
      }else{
        // creating chat since chat not already found
        var chatData={
          chatName:"sender",
          GrpChat:false,
          users:[req.user._id,userId]
        };
        try {
          const createChat=await Chat.create(chatData);
          const fullChat=await Chat.findOne({_id:createChat._id}).populate(
            "users","-password"
          );
          res.status(200).send(fullChat);
        } catch (error) {
          res.status(400);
          throw new Error(error.message);
        }
      }
    }else res.send("Not Authenticated");
  });

  //// Group
  app.post("/group",async function(req,res){
    if(req.isAuthenticated()){
      if(!req.body.users || !req.body.name){
        return res.status(400).send({message:"EmptyFields"});
      }
      let users=(req.body.users);
      if(users.length<2){ // Group should have more than two users
        return res.status(400).send({message:"LessUsers"});
      }
      users.push(req.user);
      try {
        const grpChat=await Chat.create({
          chatName:req.body.name,
          users:users,
          GrpChat:true,
          admin:req.user
        });

        const fullGrpChat=await Chat.findOne({_id:grpChat._id})
        .populate("users","-password")
        .populate("admin","-password");
        res.status(200).json(fullGrpChat);
      } catch (error) {
        res.status(400);
          throw new Error(error.message);
      }
    }else res.send("Not Authenticated");
  });

  app.put("/rename",async function(req,res){
    if(req.isAuthenticated()){
      const groupName=req.body.chatName;
      const updateChat=await Chat.findByIdAndUpdate(
        req.body.chatId,
        {chatName:groupName},
        {
          new:true
        }
      )
      .populate("users","-password")
      .populate("admin","-password");
      if(!updateChat){
        res.status(404);
        throw new Error("ChatNotFound");
      }else{
        res.json(updateChat);
      }
    }else res.send("Not Authenticated");
  });
  app.put("/add",async function(req,res){
    if(req.isAuthenticated()){
      const userId=req.body.userId;
      const add=await Chat.findByIdAndUpdate(
        req.body.chatId,
        {
          $push:{users:userId}
        },
        {new:true}
      )
      .populate("users","-password")
      .populate("admin","-password")
      .populate({
        path: "latestMsg",
        populate: {
          path: "sender",
          select: "name username",
        },
      })
      .exec();
      if(!add){
        res.status(404);
        throw new Error("ChatNotFound");
      }else{
        res.json(add);
      }
    }else res.send("Not Authenticated");
  });
  

  app.put("/remove",async function(req,res){
    if(req.isAuthenticated()){
      const userId=req.body.userId;
      const remove=await Chat.findByIdAndUpdate(
        req.body.chatId,
        {
          $pull:{users:userId}
        },
        {new:true}
      )
      .populate("users","-password")
      .populate("admin","-password")
      .populate({
        path: "latestMsg",
        populate: {
          path: "sender",
          select: "name username",
        },
      })
      .exec();
      if(!remove){
        res.status(404);
        throw new Error("ChatNotFound");
      }else{
      // const cht=await Chat.findById(req.body.chatId);
        // if(cht.users.length===1){
        //   await Chat.deleteOne({_id:req.body.chatId});
        // }
        res.json(remove);
      }
    }else res.send("Not Authenticated");
  });

  app.put("/deletegrp", async function(req, res) {
    if (req.isAuthenticated()) {
      const chatId = req.body.chatId;
      const adminId = req.body.adminId;
      const cht = await Chat.findById(chatId)
      .populate("users","-password")
      .populate("admin","-password");
      // verifying admin
      if(adminId === cht.admin._id.toString()){
        await Chat.findByIdAndDelete(chatId);
        res.send({ message: "Group deleted successfully" });
      } else {
        console.log("You are not authorized to delete this group");
        res.status(403).send({ message: "Unauthorized grp deletion" });
      }
    } else {
      res.send("Not Authenticated");
    }
  });
  

  // Messages
  app.post("/sendMsg",async function(req,res){
    if(req.isAuthenticated()){
      const {context,chatId}=req.body;
      if(context.length===0||chatId.length===0){
        console.log("Invalid data passed in message");
        return res.status(400);
      }
      let newMsg={
        sender:req.user._id,
        body:context,
        chat:chatId
      };
      try {
        let message=await Message.create(newMsg);
        message=await message.populate("sender","name pic username");
        message=await message.populate("chat");
        message=await User.populate(message,{
          path:"chat.users",
          select:"name pic username"
        });

        await Chat.findByIdAndUpdate(req.body.chatId,{
          latestMsg:message
        });
        res.json(message);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  });

  app.get("/messages/:chatId",async function(req,res){
    if(req.isAuthenticated()){
      try {
        const messages=await Message.find({chat:req.params.chatId})
        .populate("sender","name pic username")
        .populate("chat");
        res.send(messages);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  })

  app.post("/register",async function(req,res){
    const {name,username,password,cpassword,pic}=req.body;
    if(name.length===0||username.length===0||password.length===0||cpassword.length===0){
      res.json({message:"EmptyFields"});
    }
    // Check pass length
    else if(password.length<6){
      res.json({message:"SmallLen"});
    }
    // Check passwords match
    else if(password!==cpassword){
      res.json({message:"MisMatch"});
    }
    else if(await User.findOne({username})){
      res.json({message:"UserExistsError"});
    }
    else{
      User.register({name:name,username:username,pic:pic}, password, function(err, user){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/profile");
          });
        }
      });
    }
  });

app.post("/login",function(req,res){
  const user=new User({username:req.body.username,password:req.body.password});
  req.login(user,function(err){
    if (err){
      console.log(err);
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/profile");
      });
    }
  });
});

  app.get("/logout", function(req, res){
    req.logout(function(err) {
      if (err) { res.json({msg:err}); }
        res.status(200).json({msg:"Logged out"});
    });
  });
}