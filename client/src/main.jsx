import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import UpdatePrompt from './components/pwa/UpdatePrompt.jsx';
import InstallHint from './components/pwa/InstallHint.jsx';
import './index.css';

// UpdatePrompt/InstallHint viven fuera del Router a propósito: ninguno
// de los dos depende de la ruta actual, y así se ven también en
// /login antes de que haya sesión.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <UpdatePrompt />
    <InstallHint />
  </React.StrictMode>
);