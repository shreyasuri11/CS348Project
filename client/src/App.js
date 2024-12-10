import './App.css';
import React, {useState, useEffect, useInsertionEffect} from 'react';
import TaskForm from './Components/Tasks';
import Reports from './Components/Reports';
function App() {

  const [data, setData] = useState({})

  useInsertionEffect(() => {
    fetch("/test").then(
        res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])
  return (
    <div>
      <Reports />
      <TaskForm/>
      
    </div>
  );
}

export default App;
