import React from 'react';

const LoginPage = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="login-page">
      <h1>Mess Swap App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
};

export default LoginPage;
