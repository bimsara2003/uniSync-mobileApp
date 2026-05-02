const Event=require("../models/eventModel");

exports.createEvent=async(req,res)=>{
    try {
        const {
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            venue,
            requiresRegistration,
            capacity,
            registrationDeadline
        } = req.body;

        const newEvent = await Event.create({
            title,
            description,
            category,
            date,
            startTime,
            endTime,
            venue,
            requiresRegistration,
            capacity,
            registrationDeadline,
            createdBy: req.user._id,
        });

        res.status(201).json({
            message:"Event created successfully",
            event,
        });
    } catch (error) {
        if (error.message.includes("required")||
            error.message.includes("deadline")){
                return res.status(400).json({message:error.message});
            }
        console.error("Error creating event:", error);
        res.status(500).json({message:"Server Error"});
    }
};

exports.getEvents=async(req,res)=>{
    try {
        const {status,category}=req.query;

        const filter={};
        if(status) filter.status=status.toUpperCase();
        if(category) filter.category=category.toUpperCase();

        const events=await Event.find(filter)
            .populate("createdBy","firstName lastName email role")
            .sort({date:1});
        
        res.status(200).json({
            count:events.length,
            events,
        });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({message:"Server Error"});
    }
};

exports.getEventById=async(req,res)=>{
    try {
        const event=await Event.findById(req.params.id).populate(
            "ceratedBy",
            "firstName lastName email role"
        );
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }
        res.status(200).json(event);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({message:"Server Error"});
    }
};