import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import swapRoutes from './routes/swap.js';
import './config/passport.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://mess-swap-app-frontend.onrender.com', // Allow frontend
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware for CORS
app.use(
  cors({
    origin: 'https://mess-swap-app-frontend.onrender.com',
    credentials: true,
  })
);

// Middleware for parsing JSON requests
app.use(express.json());

// Session configuration with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret key for signing cookies
    resave: false,
    saveUninitialized: false, // Prevent creating sessions for unauthenticated users
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Your MongoDB URI
      collectionName: 'sessions', // Collection name for sessions
    }),
    cookie: {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 1000 * 60 * 60 * 24, // Session expires in 1 day
    },
  })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // When the user disconnects
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);
app.use('/swap', swapRoutes(io)); // Pass the io instance to the swap routes

// Start the server
server.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
