const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required: [true, "Event title is required"],
            trim: true,
        },
        description:{
            type:String,
            required: [true, "Event description is required"],
            trim: true,
        },
        category:{
            type:String,
            required: [true, "Event category is required"],
            enum:["ACADEMIC","SPORTS","SOCIETY","CULTURAL","CAREER"],
        },
        bannerImageUrl:{
            type:String,
            default:null,
        },
        date:{
            type:Date,
            required: [true, "Event date is required"],
        },
        startTime:{
            ttpe:String,
            required:[true, "Event start time is required"],
        },
        endTime:{
            type:String,
            required:[true, "Event end time is required"],
        },
        venue:{
            type:String,
            required:[true, "Event venue is required"],
            trim: true,
        },
        requiresRegistration:{
            type:Boolean,
            default:false,
        },
        capacity:{
            type:Number,
            default:null,
        },
        registrationdeadline:{
            type:Number,
            default:0,
        },
        status:{
            type:String,
            enum:["UPCOMING","ONGOING","COMPLETED","CANCELLED"],
            default:"UPCOMING",
        },
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true,
        },
        
    },
    {timestamps:true}

);

