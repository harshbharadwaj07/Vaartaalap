const mongoose=require("mongoose");
const chatSchema=new mongoose.Schema({
    chatName:{type:String,trim:true},
    GrpChat:{type:Boolean,default:false},
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            joinedAt:{
                type:Date,
                default: Date.now
            }
        }
    ],
    latestMsg:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},
    {
        timestamps:true
    }
);
chatSchema.pre("save", function (next) {
    if (this.isNew) {
      const currentTime = this.createdAt || Date.now();
      this.users.forEach((user) => {
        user.joinedAt = currentTime;
      });
    }
    next();
  });
  
module.exports=chatSchema;