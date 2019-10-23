import React from 'react';
import logo from './logo.svg';
import MessageList from './MessageList';
import './App.css';
import LoginComponent from './LoginComponent'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const messages = [
    "jake says hello",
    "jake says goodbye"
  ]
  return (
    <div className="App">
      <header className="App-header">
      </header>
    </div>
  );
}

export default App;
