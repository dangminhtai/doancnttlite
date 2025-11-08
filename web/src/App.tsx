import React, { useEffect, useState } from 'react';
import './App.css';

interface Command {
  _id: string;
  name: string;
  updatedAt: string;
}

function App() {
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    fetch('/api/commands')
      .then(res => res.json())
      .then(data => setCommands(data))
      .catch(err => console.error('Lỗi fetch:', err));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Danh sách Command trong DB</h1>
        {commands.length > 0 ? (
          <ul>
            {commands.map(cmd => (
              <li key={cmd._id}>
                <strong>{cmd.name}</strong> — cập nhật lúc {new Date(cmd.updatedAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có dữ liệu hoặc đang tải...</p>
        )}
      </header>
    </div>
  );
}

export default App;
