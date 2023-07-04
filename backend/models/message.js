const mongoose=require("mongoose");
const msgSchema=new mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    body:{
        type:String,
        trim:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    }
},
{
    timestamps:true
}
);
module.exports=msgSchema;