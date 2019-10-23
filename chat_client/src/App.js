import React from 'react';
import MessageList from './MessageList';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Input from './Input';
import UserList from './UserList';
import LoginComponent from './LoginComponent'

function App() {
  const messages = [
    "No one has said anything yet"
  ]
  return (
    <div className="App">
      <div className="Login">
        <LoginComponent/>
      </div>
      <div className="Messages">
        <MessageList messages={messages}/>
      </div>
      <div className="Users">
        <UserList/>
      </div>
      <div className="Input">
        <Input/>
      </div>
    </div>
  );
}

export default App;
