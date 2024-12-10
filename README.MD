Database Design - Student Planner can add different types of tasks to their calendar(social events, assignments, projects, exams, meetings). Students can categorize, set reminders and mark tasks as completed. They can assign priority levels to tasks and associate them with specific courses or personal activities.

Intended Database Tables 
Students(student_id, name, email)
Tasks(task_id, student_id name, task_name, task_type_id, due_date, type, reminder_time, priority)
Task_Types(task_id, name)


Primary Keys: Each table has a PK -- student_id, task_id, reminder_id, calendar_id, task_id
Foreign Keys: 
reminder_time in Tasks links to the Reminders table
student_id in Tasks to link to the Students table
task_id in Reminders and Calendar to link to the Tasks table
task_type_id in Tasks to link to the Task_Types Table