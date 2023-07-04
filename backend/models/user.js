const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:String,
    pic:{
        type:String,
        required:false,
        default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkEp5rLeT9c0Z6L96pAdlhMynYRHqMO6f4zQ&usqp=CAU",
        set: a => a===''? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkEp5rLeT9c0Z6L96pAdlhMynYRHqMO6f4zQ&usqp=CAU":a
    },
    notification:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    }
},
    {timestamps:true}
);


module.exports=userSchema;