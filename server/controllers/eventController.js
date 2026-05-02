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


exports.updateEvent=async(req,res)=>{
    try {
        const event=await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        const isCreator=event.createdBy.toString()===req.user._id.toString();
        const isAdmin=req.user.role.includes("ADMIN");

        if(!isCreator&&!isAdmin){
            return res.status(403).json({
                message:"Not authorized to update this event"
            });
        }

        if(["CANCELLED","COMPLETED"].includes(event.status)){
            return res.status(400).json({
                message:'Cannot update a ${event.status.toLowerCase()} event',
            });
        }

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
            registrationDeadline,
            status,
        } = req.body;

        if(title) event.title=title;
        if(description) event.description=description;
        if(category) event.category=category;
        if(date) event.date=date;
        if(startTime) event.startTime=startTime;
        if(endTime) event.endTime=endTime;
        if(venue) event.venue=venue;
        if(status) event.status=status;

        if(requiresRegistration!==undefined) {
            event.requiresRegistration=requiresRegistration;
        }
        if(capacity!==undefined) event.capacity=capacity;
        if(registrationDeadline!==undefined){ 
            event.registrationDeadline=registrationDeadline;   
        }
        
    
        await event.save();

        res.status(200).json({
            message: "Event updated successfully",
            event,
        });
    } catch (error) {
        if (error.message.includes("required") || 
            error.message.includes("deadline")) {
            return res.status(400).json({ message: error.message });
        }
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Server Error" });
  }
};


exports.deleteEvent=async(req,res)=>{
    try {
        const event=await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }
        const isCreator=event.createdBy.toString()===req.user._id.toString();
        const isAdmin=req.user.role.includes("ADMIN");

        if(!isCreator&&!isAdmin){
            return res.status(403).json({   
                message:"Not authorized to delete this event"
            });
        }

        await event.deleteOne();

        res.status(200).json({message:"Event deleted successfully"});
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({message:"Server Error"});
    }
};



exports.updateEventStatus=async(req,res)=>{
    try {
        const event=await Event.findById(req.params.id);
        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        const isCreator=event.createdBy.toString()===req.user._id.toString();
        const isAdmin=req.user.role.includes("ADMIN");

        if(!isCreator&&!isAdmin){
            return res.status(403).json({
                message:"Not authorized to update this event status",
            });
        }

        const {status}=req.body;

        const validStatuses=["UPCOMING","ONGOING","COMPLETED","CANCELLED"];
        if(!validStatuses.includes(status)){
            return res.status(400).json({message:"Invalid status value"});
        }

        event.status=status;
        await event.save();

        res.status(200).json({
            message:"Event status updated successfully",
            status:event.status,
        });
    } catch (error) {
        console.error("Error updating event status:",error);
        res.status(500).json({message:"Server Error"});
    }
    
};