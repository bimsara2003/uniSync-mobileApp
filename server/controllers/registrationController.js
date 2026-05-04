const Registration = require('../models/registrationModel');
const Event =require('../models/eventModel');

exports.registerForEvent = async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if(!event.requiresRegistration){
            return res.status(400).json({
                message:"This event does not require registration. Just show up!", 
            });
        }

        if (event.status !== "UPCOMING") {
            return res.status(400).json({
                message: `Registration is closed. Event is ${event.status.toLowerCase()}`,
            });
        }

        if(new Date()>new Date(event.registrationDeadline)){
            return res.status(400).json({
                message:"Registration deadline has passed",
            });
        }

        if(event.registrationCount>=event.capacity){
            return res.status(400).json({
                message:"Sorry, this event is fully booked",
            });
        }

        const existingRegistration = await Registration.findOne({
            eventId: event._id,
            userId: req.user._id,
        });

        if(existingRegistration){

            if(existingRegistration.status==="CANCELLED"){
                existingRegistration.status="CONFIRMED";
                await existingRegistration.save();

                event.registrationCount+=1;
                await event.save();

                return res.status(200).json({
                    message:"Registration reactivated successfully",
                    registration: existingRegistration,
                });
            }

            return res.status(400).json({
                message:"You have already registered for this event",
            });
        }

        const registration = await Registration.create({
            eventId: event._id,
            userId: req.user._id,
        });

        event.registrationCount+=1;
        await event.save();

        res.status(201).json({
            message:"Registered successfully",
            registration,
        });
    }catch(error){
        console.error("Error registering for event:", error);
        res.status(500).json({message:"Server Error"});
    }
};

exports.cancelRegistration = async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        if (event.status !== "UPCOMING") {
            return res.status(400).json({
                message: `Cannot cancel registration. Event is ${event.status.toLowerCase()}`,
            });
        }

        const registration = await Registration.findOne({
            eventId: event._id,
            userId: req.user._id,
        });

        if(!registration){
            return res.status(404).json({
                message:"You are not registered for this event",
            });
        }

        if (registration.status === "CANCELLED") {
            return res.status(400).json({
                message: "Your registration is already cancelled",
            });
        }

        registration.status = "CANCELLED";
        await registration.save();

        event.registrationCount-=1;
        await event.save();

        res.status(200).json({
            message:"Registration canceled successfully",
            registration,
        });
    }catch(error){
        console.error("Error canceling registration:", error);
        res.status(500).json({message:"Server Error"});
    }
};

exports.getEventRegistrations = async (req, res) => {
    try{
        const event = await Event.findById(req.params.id);

        if(!event){
            return res.status(404).json({message:"Event not found"});
        }

        const isCreator = event.createdBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role.includes("ADMIN");

        if(!isCreator && !isAdmin){
            return res.status(403).json({
                message:"Not authorized to view registrations for this event",
            });
        }

        const registrations = await Registration.find({
            eventId: event._id,
            status:"CONFIRMED",
        }).populate("userId","firstName lastName email role");

        res.status(200).json({
            count: registrations.length,
            capacity: event.capacity,
            spotsRemaining: event.capacity - event.registrationCount,
            registrations,
        });
    } catch(error){
        console.error("Error fetching registrations:", error);
        res.status(500).json({message:"Server Error"});
    }
};

exports.getMyRegistrationStatus = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registration = await Registration.findOne({
      eventId: event._id,
      userId: req.user._id,
    });

    if (!registration) {
      return res.status(200).json({
        isRegistered: false,
        message: "You are not registered for this event",
      });
    }

    res.status(200).json({
      isRegistered: registration.status === "CONFIRMED",
      status: registration.status,
      registeredAt: registration.createdAt,
    });
  } catch (error) {
    console.error("Error fetching registration status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getMyRegisteredEvents = async (req, res) => {
  try {
    const registrations = await Registration.find({
      userId: req.user._id,
      status: "CONFIRMED",
    }).populate(
      "eventId",
      "title description category date startTime endTime venue status bannerImageUrl"
    );

    res.status(200).json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Error fetching registered events:", error);
    res.status(500).json({ message: "Server Error" });
  }
};