# app/routes/reminder_routes.py

from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import db, Reminder

reminder_bp = Blueprint('reminder_bp', __name__)

@reminder_bp.route('/reminders')
def reminders():
    reminders = Reminder.query.order_by(Reminder.reminder_date.desc()).all()
    return render_template('reminders_table.html', reminders=reminders)

@reminder_bp.route('/add_reminder', methods=['POST'])
def add_reminder():
    user_id = request.form.get('user_id')
    reminder_date = request.form.get('reminder_date')
    status = request.form.get('status', 'pending')

    new_reminder = Reminder(user_id=user_id, reminder_date=reminder_date, status=status)
    db.session.add(new_reminder)
    db.session.commit()
    flash('Reminder added successfully!', 'success')
    return redirect(url_for('reminder_bp.reminders'))

@reminder_bp.route('/delete_reminder/<int:reminder_id>', methods=['POST'])
def delete_reminder(reminder_id):
    reminder = Reminder.query.get_or_404(reminder_id)
    db.session.delete(reminder)
    db.session.commit()
    flash('Reminder deleted successfully!', 'success')
    return redirect(url_for('reminder_bp.reminders'))
