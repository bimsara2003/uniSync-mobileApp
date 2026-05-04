const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
    {
        eventId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Event",
            required:[true,"Event ID is required"],
        },
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:[true,"User ID is required"],
        },
        status:{
            type:String,
            enum:["CONFIRMED","CANCELLED"],
            default:"CONFIRMED",
        },
    },
    {timestamps:true}
);


registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports=mongoose.model("Registration",registrationSchema);