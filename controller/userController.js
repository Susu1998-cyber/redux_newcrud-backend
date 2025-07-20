const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

// @desc Register User
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user._id, username: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

exports.forgetpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP_EMAIL,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Reset Password",
      text: `http://localhost:3000/resetpassword/${token}/${user._id}`,
      // html: `<h1>Reset Your Password</h1>
      //   <p>Click on the following link to reset your password:</p>
      //   <a href="http://localhost:3000/reset-password/${token}">http://localhost:3000/reset-password/${token}</a>
      //   <p>The link will expire in 10 minutes.</p>
      //   <p>If you didn't request a password reset, please ignore this email.</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }
      res.status(200).send({ message: "Email sent" });
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { token, id } = req.params;
  if (!newPassword) {
    return res.status(400).send({ message: "New password is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Invalid token" });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          return res.status(500).send({ message: err.message });
        }
        bcrypt.hash(newPassword, salt, async (err, hash) => {
          if (err) {
            return res.status(500).send({ message: err.message });
          }
          const user = await User.findByIdAndUpdate(
            id,
            { password: hash },
            { new: true }
          );
          if (!user) {
            return res.status(404).send({ message: "User not found" });
          }
          res.status(200).send({ message: "Password updated successfully" });
        });
      });
    }
  });
};
