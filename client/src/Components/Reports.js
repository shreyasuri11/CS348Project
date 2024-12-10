import React, { useState, useEffect } from "react";

export default function Reports() {
    const [taskType, setTaskType] = useState(""); // To store the task type
    const [startDate, setStartDate] = useState(""); // To store the start date
    const [endDate, setEndDate] = useState(""); // To store the end date
    const [reportData, setReportData] = useState([]); // To store the report results
    const [error, setError] = useState(""); // To store any error messages
    const [taskTypes, setTaskTypes] = useState([]); // To store task types from the backend

    // Fetch task types from the backend when the component mounts
    useEffect(() => {
        fetch("/api/task_types") // Fetch task types dynamically
            .then((response) => response.json())
            .then((data) => setTaskTypes(data))
            .catch((error) => console.error("Error fetching task types:", error));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
    
        // Validate date inputs
        if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
            setError("Please enter a valid date range.");
            return;
        }
    
        // Build the query parameters
        const query = new URLSearchParams();
        if (taskType) query.append("task_type", taskType);
        if (startDate) query.append("start_date", startDate);
        if (endDate) query.append("end_date", endDate);
    
        // Fetch report data
        fetch(`/api/report?${query.toString()}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch report data");
                }
                return response.json();
            })
            .then((data) => {
                setReportData(data);
                setError(""); // Clear previous errors
            })
            .catch((err) => {
                setError(err.message);
                setReportData([]); // Clear previous report data if there's an error
            });
    };
    
    return (
        <div>
            <h1>Generate Report</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Task Type: </label>
                    <select
    value={taskType}
    onChange={(e) => setTaskType(e.target.value)}
>
    <option value="">Select Task Type</option>
    {taskTypes.map((type) => (
        <option key={type.id} value={type.id}>
            {type.name} {/* Accessing name */}
        </option>
    ))}
</select>

                </div>
                <div>
                    <label>Start Date: </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label>End Date: </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <button type="submit">Generate Report</button>
            </form>

            {/* Display error message if any */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Display report data */}
            {reportData.length > 0 && (
                <div>
                    <h2>Report Results</h2>
                    <ul>
                        {reportData.map((task) => (
                            <li key={task.id}> {/* Assuming task.id is available */}
                                <strong>{task.task_name}</strong> ({task.task_type}) - Due: {task.due_date}, Priority: {task.priority_level}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
