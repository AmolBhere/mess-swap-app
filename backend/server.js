import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import swapRoutes from './routes/swap.js';
import SwappedUsers from './models/SwappedUsers.js';
import './config/passport.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Socket.IO connection
io.on('connection', (socket) => {
  // console.log('A user connected');

  // When the user disconnects
  socket.on('disconnect', () => {
    // console.log('A user disconnected');
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/swap', swapRoutes(io)); // Pass the io instance to the swap routes

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running on http://localhost:5000');
});
