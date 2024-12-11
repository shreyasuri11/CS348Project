from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text, Index
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
db = SQLAlchemy(app)

# Task model with indexes
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_name = db.Column(db.String(100), nullable=False)
    task_type_id = db.Column(db.Integer, db.ForeignKey('task_type.id'), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    priority_level = db.Column(db.String(10), nullable=False)
    reminder_time = db.Column(db.Time)

    # Define indexes
    __table_args__ = (
        Index('idx_tasks_due_date', 'due_date'),  # Index on due_date
        Index('idx_tasks_task_type_id', 'task_type_id'),  # Index on task_type_id
    )

    def to_dict(self):
        return {
            "id": self.id,
            "task_name": self.task_name,
            "task_type": TaskType.query.get(self.task_type_id).name,  # Fetch the task type name
            "due_date": self.due_date.strftime("%Y-%m-%d"),
            "priority_level": self.priority_level,
            "reminder_time": self.reminder_time.strftime("%H:%M") if self.reminder_time else None,
        }

# TaskType model with indexes
class TaskType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=True)

    # Define an index on the name column
    __table_args__ = (
        Index('idx_task_types_name', 'name'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }

with app.app_context():
    db.create_all()

    # Add  task types if they don't already exist
    # Add more in future
    if not TaskType.query.first():
        predefined_task_types = [
            "social event",
            "assignment",
            "project",
            "exam",
            "meeting",
        ]
        for type_name in predefined_task_types:
            task_type = TaskType(name=type_name)
            db.session.add(task_type)
        db.session.commit()

# PULL DATA FROM TASK TYPES
@app.route('/api/task_types', methods=['GET'])
def get_task_types():
    task_types = TaskType.query.all()
    return jsonify([task_type.to_dict() for task_type in task_types])
# EXISTING TASKS
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    return jsonify([task.to_dict() for task in tasks])

# ADD TASKS
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    try:
        new_task = Task(
            task_name=data['task_name'],
            task_type_id=data['task_type_id'],
            due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
            priority_level=data['priority_level'],
            reminder_time=datetime.strptime(data['reminder_time'], '%H:%M').time() if data.get('reminder_time') else None
        )
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error adding task", "error": str(e)}), 500

# EDIT TASKS
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    data = request.json
    try:
        task.task_name = data['task_name']
        task.task_type_id = data['task_type_id']
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        task.priority_level = data['priority_level']
        task.reminder_time = datetime.strptime(data['reminder_time'], '%H:%M').time() if data.get('reminder_time') else None
        db.session.commit()
        return jsonify(task.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating task", "error": str(e)}), 500

# DELETE TASKS
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"message": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task deleted"})

# GENERATE REPORT 
@app.route('/api/report', methods=['GET'])
def get_report():
    task_type_id = request.args.get('task_type', None)
    start_date = request.args.get('start_date', None)
    end_date = request.args.get('end_date', None)

    query = """
        SELECT task.task_name, task_type.name as task_type, task.due_date, task.priority_level, task.reminder_time
        FROM task
        JOIN task_type ON task.task_type_id = task_type.id
        WHERE 1=1
    """

    filters = {}
    if task_type_id:
        query += " AND task.task_type_id = :task_type_id"
        filters['task_type_id'] = task_type_id
    if start_date and end_date:
        query += " AND task.due_date BETWEEN :start_date AND :end_date"
        filters['start_date'] = start_date
        filters['end_date'] = end_date

    query = text(query)
    result = db.session.execute(query, filters)

    tasks = [dict(row._mapping) for row in result]
    return jsonify(tasks)

if __name__ == '__main__':
    app.run(debug=True)
