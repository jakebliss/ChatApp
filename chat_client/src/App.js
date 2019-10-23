import React from 'react';
import logo from './logo.svg';
import MessageList from './MessageList';
import './App.css';

function App() {
  const messages = [
    "jake says hello",
    "jake says goodbye"
  ]
  return (
    <div className="App">
      <header className="App-header">
       <MessageList messages = {messages}/>
      </header>
    </div>
  );
}

export default App;
