import React from 'react';
import './App.css';
import logo from './logo.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Discord Bot Dashboard</h1>
        <p>
          Bot đang chạy ổn định ✅<br />
          Sửa file <code>src/App.tsx</code> nếu muốn thêm tính năng hiển thị.
        </p>
        <a
          className="App-link"
          href="https://discord.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mở Discord
        </a>
      </header>
    </div>
  );
}

export default App;
