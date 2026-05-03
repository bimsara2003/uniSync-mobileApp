const express = require('express');
const router=express.Router({mergeParams:true});
const{
    registerForEvent,
    cancelRegistration,
    getEventRegistrations,
    getMyregistrationStatus,
    getMyRegisteredEvents,
} = require("../controllers/registrationController");
const {protect} = require("../middleware/authMiddleware");

router.post("/",protect,registerForEvent);

router.delete("/",protect,cancelRegistration);

router.get("/",protect,getEventRegistrations);

router.get("/me",protect,getMyregistrationStatus);


module.exports=router;

