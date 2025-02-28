import React, { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [todos, setTodos] = useState(() => {
    return JSON.parse(localStorage.getItem("todos")) || [];
  });
  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!text.trim() || !dueDate.trim()) return;

    const newTodo = {
      id: Date.now(),
      text,
      dueDate,
      completed: false,
      completedTime: null
    };

    setTodos([...todos, newTodo]);
    setText("");
    setDueDate("");
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id 
        ? { ...todo, completed: !todo.completed, completedTime: !todo.completed ? new Date().toLocaleString() : null }
        : todo
    ));
  };

  const markAllAsDone = (date) => {
    setTodos(todos.map(todo =>
      new Date(todo.dueDate).toLocaleDateString() === date
        ? { ...todo, completed: true, completedTime: new Date().toLocaleString() }
        : todo
    ));
  };

  const startEditing = (id, currentText) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: editText } : todo
    ));
    setEditingId(null);
    setEditText("");
  };

  const now = Date.now();

  const sortedTodos = [...todos].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const upcomingTasks = sortedTodos.filter(todo => {
    if (todo.completed) return false;
    const dueTime = new Date(todo.dueDate).getTime();
    return dueTime - now <= 12 * 60 * 60 * 1000;
  });

  const groupByDate = () => {
    return sortedTodos.reduce((groups, todo) => {
      const dueDay = new Date(todo.dueDate).toLocaleDateString();
      if (!groups[dueDay]) {
        groups[dueDay] = [];
      }
      groups[dueDay].push(todo);
      return groups;
    }, {});
  };

  const groupedTasks = groupByDate();

  return (
    <div>
      {upcomingTasks.length > 0 && (
        <div className="upcoming-tasks">
          <h2>⏳ Upcoming Tasks</h2>
          {upcomingTasks.map(todo => (
            <div key={todo.id} className="upcoming-task">
              <strong className={new Date(todo.dueDate).getTime() < now ? "overdue" : ""}>
                {todo.text}
              </strong>
              <div>Due: {new Date(todo.dueDate).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}

      <div className="container">
        <h1>To-Do List ✅</h1>

        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a task..."
          />
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <button className="add-button" onClick={addTodo}>Add</button>
        </div>

        {Object.keys(groupedTasks).map(date => (
          <div key={date} className="task-group">
            <h3>{date}</h3>
            <button className="mark-all-button" onClick={() => markAllAsDone(date)}>Mark All as Done</button>
            <ul className="todo-list">
              {groupedTasks[date].map(todo => (
                <li 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? "completed" : ""} ${new Date(todo.dueDate).getTime() < now ? "overdue" : ""}`}
                >
                  <div>
                    {editingId === todo.id ? (
                      <>
                        <input 
                          type="text" 
                          className="edit-input"
                          value={editText} 
                          onChange={(e) => setEditText(e.target.value)} 
                        />
                        <button className="save-button" onClick={() => saveEdit(todo.id)}>💾 Save</button>
                      </>
                    ) : (
                      <>
                        <span onClick={() => toggleComplete(todo.id)}>
                          {todo.text}
                        </span>
                        <div className="due-date">Due: {new Date(todo.dueDate).toLocaleString()}</div>
                        {todo.completedTime && (
                          <div className="completed-time">Completed: {todo.completedTime}</div>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <button className="complete-button" onClick={() => toggleComplete(todo.id)}>✔</button>
                    <button className="delete-button" onClick={() => deleteTodo(todo.id)}>❌</button>
                  </div>
                  {!editingId && (
                    <span className="edit-text" onClick={() => startEditing(todo.id, todo.text)}>Edit</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;