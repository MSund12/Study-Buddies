import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const newUser = new User ({
            username: req.body.username,
            password: req.body.password
        });

        const user = await newUser.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});
export default router;