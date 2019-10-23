import React from 'react';
import logo from './logo.svg';
import './App.css';
import LoginComponent from './LoginComponent'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <LoginComponent/>
      </header>
    </div>
  );
}

export default App;
