import express from 'express';
import passport from 'passport';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// OAuth callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
}), (req, res) => {
  // After successful login, send user info as a query parameter to the frontend
  const user = req.user; // Get the authenticated user info
  const redirectUrl = `http://localhost:5173/main?user=${encodeURIComponent(JSON.stringify(user))}`;
  res.redirect(redirectUrl);
});

// Get current user info
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

export default router;
