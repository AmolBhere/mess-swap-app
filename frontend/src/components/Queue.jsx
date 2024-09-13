import React from 'react';

const Queue = ({ title, users }) => (
  <div className="queue">
    <h3>{title}</h3>
    {users.map((user, index) => (
      <div key={index} className="queue-item">
        <p>{user.userId.name}</p>
        <p>{new Date(user.appliedAt).toLocaleString()}</p>
      </div>
    ))}
  </div>
);

export default Queue;
