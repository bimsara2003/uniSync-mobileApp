// A separate route file for the "My Events" route.

const express = require("express");
const router = express.Router();
const{
    getMyRegisteredEvents,
} = require("../controllers/registrationController");
const {protect} = require("../middleware/authMiddleware");


router.get("/me/registrations",protect,getMyRegisteredEvents);

module.exports=router;
