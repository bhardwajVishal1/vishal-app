import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router = express.Router();

router.post("/register", async (req,res)=>{
  const { name,email,password } = req.body;
  try{
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.json({ message: "Registered", user:{name:user.name,email:user.email,points:user.points}});
  }catch(e){ res.status(400).json({ error:e.message }); }
});

router.post("/login", async (req,res)=>{
  const { email, password } = req.body;
  try{
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error:"Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ error:"Invalid credentials" });
    const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET || "devsecret");
    res.json({ message:"Logged in", token, user:{name:user.name,email:user.email,points:user.points}});
  }catch(e){ res.status(500).json({ error:e.message }); }
});

router.post("/addPoints", async (req,res)=>{
  const { email, points } = req.body;
  try{
    const user = await User.findOneAndUpdate({ email }, { $inc: { points: points } }, { new: true });
    res.json({ message:"Points updated", user:{name:user.name,email:user.email,points:user.points} });
  }catch(e){ res.status(500).json({ error:e.message }); }
});

router.get("/leaderboard", async (req,res)=>{
  try{
    const users = await User.find().sort({ points:-1 }).limit(20);
    res.json(users.map(u=>({name:u.name,points:u.points,email:u.email})));
  }catch(e){ res.status(500).json({ error:e.message }); }
});

export default router;
