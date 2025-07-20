const express = require("express");
const { check } = require("express-validator");
const employeeController = require("../controller/employeController");
const router = express.Router();

router.post("/create", employeeController.createEmployee);
router.get("/getemploye", employeeController.getAllEmployees);
module.exports = router;
