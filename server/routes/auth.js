const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validate = require("../middleware/validate");
const { signupSchema, loginSchema } = require("../validation/authValidation");
const { protect } = require("../middleware/authMiddleware");

// Signup
router.post("/signup", validate(signupSchema), async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.status(201).json({ token, user: { id: user._id, name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post("/login", validate(loginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { id: user._id, name: user.name, email } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/username', protect, async (req, res) => {
    try {
        console.log(req.user)
        const user = await User.findById(req.user).select('name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ username: user.name });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
})

module.exports = router;
