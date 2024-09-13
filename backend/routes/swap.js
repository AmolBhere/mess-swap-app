import express from 'express';
import SwapRequest from '../models/SwapRequest.js';
import SwappedUsers from '../models/SwappedUsers.js'; // Import the new model

const router = express.Router();

export default (io) => {
  // Get queue of swap requests
  router.get('/queue', async (req, res) => {
    try {
      const fromMessA = await SwapRequest.find({ fromMess: 'A' }).sort('appliedAt').populate('userId');
      const fromMessB = await SwapRequest.find({ fromMess: 'B' }).sort('appliedAt').populate('userId');
      res.json({ fromMessA, fromMessB });
    } catch (error) {
      console.error('Error fetching queue data:', error);
      res.status(500).json({ message: 'Error fetching queue data', error: error.message });
    }
  });

  // Apply for a swap
  router.post('/apply', async (req, res) => {
    const { fromMess, toMess, userId } = req.body;

    try {
      // Check if the user is already swapped
      const isUserSwapped = await SwappedUsers.findOne({
        $or: [{ userId1: userId }, { userId2: userId }],
      });
      if (isUserSwapped) {
        return res.json({ message: 'You are already swapped with another user.' });
      }

      // Check if the user is already in the swap request queue
      const isUserInQueue = await SwapRequest.findOne({ userId });
      if (isUserInQueue) {
        return res.json({ message: 'You are already in the queue.' });
      }

      const newRequest = await SwapRequest.create({ userId, fromMess, toMess });

      // Emit an event to update all clients with the new queue
      io.emit('queueUpdated');

      // Find a match for the swap
      const match = await SwapRequest.findOne({
        fromMess: toMess,
        toMess: fromMess,
      }).sort('appliedAt').populate('userId');
      if (match) {
        // Delete both swap requests since they are matched
        await SwapRequest.findByIdAndDelete(match._id);
        await SwapRequest.findByIdAndDelete(newRequest._id);

        // Add both users to SwappedUsers collection
        await SwappedUsers.create({ userId1: userId, userId2: match.userId._id });

        // Emit an event to update all clients with the new queue
        io.emit('queueUpdated');

        // Respond with success and matched user info
        res.json({
          message: 'Swap successful!',
          match: {
            name: match.userId.name,
            email: match.userId.email,
          },
        });
      } else {
        res.json({ message: 'Added to the queue' });
      }
    } catch (error) {
      console.error('Error applying for swap:', error); // Log error to console
      res.status(500).json({ message: 'Error applying for swap', error: error.message });
    }
  });

  // Get the user with whom the current user is swapped
  router.get('/swapped-with/:userId', async (req, res) => {
    const { userId } = req.params;

    // Validate the userId to ensure it's defined and a valid ObjectId
    if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
      const swapEntry = await SwappedUsers.findOne({
        $or: [{ userId1: userId }, { userId2: userId }],
      }).populate('userId1 userId2');

      if (swapEntry) {
        const swappedWith = swapEntry.userId1._id.toString() === userId ? swapEntry.userId2 : swapEntry.userId1;
        res.json({ name: swappedWith.name, email: swappedWith.email });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error('Error fetching swapped user info:', error);
      res.status(500).json({ message: 'Error fetching swapped user info', error: error.message });
    }
  });

  return router;
};
