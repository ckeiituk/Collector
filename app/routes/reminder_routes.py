from datetime import datetime
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask import Blueprint, render_template, request, jsonify
from app.models import db, Reminder

reminder_bp = Blueprint('reminder_bp', __name__)
csrf = CSRFProtect()

@reminder_bp.route('/reminders')
def reminders():
    reminders = Reminder.query.order_by(Reminder.reminder_date.desc(), Reminder.id.desc()).all()
    return render_template('partials/reminders.html', reminders=reminders)

@reminder_bp.route('/get_reminders_partial', methods=['GET'])
def get_reminders_partial():
    reminders = Reminder.query.order_by(Reminder.reminder_date.desc(), Reminder.id.desc()).all()
    reminders_html = render_template('partials/reminders.html', reminders=reminders)
    return jsonify({'reminders_html': reminders_html})

@reminder_bp.route('/add_reminder', methods=['POST'])
def add_reminder():
    if request.is_json:
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
    return jsonify({'message': 'Invalid content type. Expected JSON.'}), 415

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

@reminder_bp.route('/get_reminder_form/<int:reminder_id>', methods=['GET'])
def get_reminder_form(reminder_id):
    reminder = Reminder.query.get_or_404(reminder_id)
    return render_template('forms/edit_reminder.html', reminder=reminder, csrf_token=generate_csrf())

@reminder_bp.route('/edit_reminder/<int:reminder_id>', methods=['POST'])
def edit_reminder(reminder_id):
    reminder = Reminder.query.get_or_404(reminder_id)
    if request.is_json:
        data = request.get_json()

        try:
            reminder.reminder_date = data.get('reminder_date', reminder.reminder_date)
            reminder.status = data.get('status', reminder.status)

            db.session.commit()

            return jsonify({'message': 'Reminder updated successfully!'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500
    return jsonify({'message': 'Invalid content type. Expected JSON.'}), 415
