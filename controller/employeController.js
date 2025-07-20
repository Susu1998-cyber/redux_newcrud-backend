const Employee = require('../model/EmployeeModal');
const { validationResult } = require('express-validator');

exports.createEmployee = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
    
        const { name, email, phone, address, position } = req.body;
    
        let employee = new Employee({ name, email, phone, address, position });
        await employee.save();
    
        res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find();
        res.status(200).json({ employees });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}