const express = require("express");
const { check } = require("express-validator");
const useController = require("../controller/userController");
const router = express.Router();

router.post("/register", useController.register);

router.post("/login", useController.login);

router.post("/forgot-password", useController.forgetpassword);

router.post("/resetpassword/:token/:id", useController.resetPassword);

module.exports = router;
