# app/routes/reminder_routes.py

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_wtf.csrf import CSRFProtect
from app.models import db, Reminder

reminder_bp = Blueprint('reminder_bp', __name__)
csrf = CSRFProtect()
@reminder_bp.route('/reminders')
def reminders():
    # Update this line to order by ID in descending order
    return render_template('partials/reminders.html', reminders=reminders)

@reminder_bp.route('/add_reminder', methods=['POST'])
def add_reminder():
    data = request.get_json()
    user_id = data.get('user_id')
    reminder_date = data.get('reminder_date')
    status = data.get('status', 'pending')

    if not all([user_id, reminder_date, status]):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        new_reminder = Reminder(user_id=user_id, reminder_date=reminder_date, status=status)
        db.session.add(new_reminder)
        db.session.commit()
        return jsonify({'message': 'Reminder added successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@reminder_bp.route('/delete_reminder/<int:reminder_id>', methods=['POST'])
def delete_reminder(reminder_id):
    reminder = Reminder.query.get_or_404(reminder_id)
    try:
        db.session.delete(reminder)
        db.session.commit()
        return jsonify({'message': 'Reminder deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
