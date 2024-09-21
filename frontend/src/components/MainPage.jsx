import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Queue from './Queue';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

const MainPage = () => {
  const [user, setUser] = useState({});
  const [fromMess, setFromMess] = useState('A');
  const [toMess, setToMess] = useState('B');
  const [queue, setQueue] = useState({ fromMessA: [], fromMessB: [] });
  const [swapMessage, setSwapMessage] = useState('');
  const [swappedWith, setSwappedWith] = useState(null); // New state for swapped user

  useEffect(() => {
    // Fetch queue and user info on mount
    fetch('http://localhost:5000/swap/queue')
      .then((res) => res.json())
      .then((data) => setQueue(data));

    fetch('http://localhost:5000/auth/user', { credentials: 'include' })
      .then((res) => res.json())
      .then((userData) => {
        setUser(userData);

        // Fetch swapped user info only if user ID is valid
        if (userData._id && userData._id.match(/^[0-9a-fA-F]{24}$/)) {
          fetch(`http://localhost:5000/swap/swapped-with/${userData._id}`)
            .then((res) => res.json())
            .then((swappedData) => {
              if (swappedData) {
                setSwappedWith(swappedData); // Set swapped info if available
              }
            });
        }
      });

    // Listen for queue updates from the server
    socket.on('queueUpdated', () => {
      fetch('http://localhost:5000/swap/queue')
        .then((res) => res.json())
        .then((data) => setQueue(data));
    });

    return () => {
      socket.off('queueUpdated');
    };
  }, []);

  const applyForSwap = () => {
    console.log('User ID:', user._id); // Debugging log to check user ID
    if (!user._id || !user._id.match(/^[0-9a-fA-F]{24}$/)) {
      setSwapMessage('Invalid user ID.');
      return;
    }

    fetch('http://localhost:5000/swap/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user._id, fromMess, toMess }),
    })
      .then((res) => res.json())
      .then((data) => {
        setSwapMessage(data.message);
        // Refresh the swapped info after applying
        fetch(`http://localhost:5000/swap/swapped-with/${user._id}`)
          .then((res) => res.json())
          .then((swappedData) => {
            if (swappedData) {
              setSwappedWith(swappedData); // Set swapped info if available
            }
          });
      })
      .catch((err) => console.error('Error applying for swap:', err));
  };

  return (
    <div className="main-page">
      <div className="sidebar">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        {swappedWith ? ( // Show swapped user info if available
          <>
            <h4>You are Successfully Swapped With</h4>
            <h3>{swappedWith.name}</h3>
            <p>{swappedWith.email}</p>
          </>
        ) : (
          <>
            <div className="dropdowns">
            <select value={fromMess} onChange={(e) => setFromMess(e.target.value)}>

              <option value="A">From Mess A</option>
              <option value="B">From Mess B</option>
            </select>
            <select value={toMess} onChange={(e) => setToMess(e.target.value)}>
              <option value="A">To Mess A</option>
              <option value="B">To Mess B</option>
            </select>
            </div>
            <button onClick={applyForSwap}>Apply for Mess Swap</button>
            {swapMessage && <h2>{swapMessage}</h2>}
          </>
        )}
      </div>
      <div className="queues">
        <Queue title="From Mess A" users={queue.fromMessA} />
        <Queue title="From Mess B" users={queue.fromMessB} />
      </div>
    </div>
  );
};

export default MainPage;
