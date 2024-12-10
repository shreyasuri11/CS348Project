import React, { useState, useEffect } from "react";

function TaskForm() {
  const [taskData, setTaskData] = useState({
    task_name: "",
    task_type_id: "", // Changed to task_type_id
    due_date: "",
    priority_level: "low",
    reminder_time: "",
  });

  const [tasks, setTasks] = useState([]); // To store tasks from the backend
  const [taskTypes, setTaskTypes] = useState([]); // To store task types from the backend
  const [editMode, setEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Fetch tasks and task types from the backend when the component mounts
  useEffect(() => {
    fetch("/api/tasks")
      .then((response) => response.json())
      .then((data) => {console.log(data); setTasks(data);});
    
    fetch("/api/task_types") //DYNAMICALLY GETTING TASK TYPES FROM DB
      .then((response) => response.json())
      .then((data) => {console.log(data); setTaskTypes(data);});
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData({
      ...taskData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `/api/tasks/${editingTaskId}` : "/api/tasks";

    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (editMode) {
          setTasks(tasks.map((task) => (task.id === editingTaskId ? data : task)));
        } else {
          setTasks([...tasks, data]);
        }
        resetForm();
      });
  };

  const handleEdit = (task) => {
    setTaskData({
      task_name: task.task_name,
      task_type_id: task.task_type_id, // Correctly set task_type_id
      due_date: task.due_date,
      priority_level: task.priority_level,
      reminder_time: task.reminder_time ? task.reminder_time.slice(0, 5) : "", // Format time for input
    });
    setEditingTaskId(task.id);
    setEditMode(true);
  };

  const handleDelete = (taskId) => {
    fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    }).then(() => {
      setTasks(tasks.filter((task) => task.id !== taskId));
    });
  };

  const resetForm = () => {
    setTaskData({
      task_name: "",
      task_type_id: "", // Reset to empty
      due_date: "",
      priority_level: "low",
      reminder_time: "",
    });
    setEditMode(false);
    setEditingTaskId(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="task_name"
          placeholder="Task Name"
          value={taskData.task_name}
          onChange={handleInputChange}
          required
        />
        <select
          name="task_type_id" // Updated to task_type_id
          value={taskData.task_type_id}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Task Type</option>
          {taskTypes.map((type) => (
            <option key={type.id} value={type.id}> 
              {type.name.charAt(0).toUpperCase() + type.name.slice(1)} 
            </option>
          ))}
        </select>
        <input
          type="date"
          name="due_date"
          value={taskData.due_date}
          onChange={handleInputChange}
          required
        />
        <select
          name="priority_level"
          value={taskData.priority_level}
          onChange={handleInputChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="time"
          name="reminder_time"
          placeholder="Reminder Time"
          value={taskData.reminder_time}
          onChange={handleInputChange}
        />
        <button type="submit">{editMode ? "Edit Task" : "Add Task"}</button>
        {editMode && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      <h3>Tasks</h3>
      <ul>
        {tasks.map((task) => (
          <li key={task.id ? task.id: -1}>
            <span>{task.task_name ? task.task_name : "No Name"} - {task.task_type} - {task.due_date}</span>
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskForm;
