import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainPage from './components/MainPage';

const App = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/main" element={<MainPage />} />
  </Routes>
);

export default App;
