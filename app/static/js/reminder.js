// reminder.js

// Function to set today's date

// Initialize today's date for reminder form on page load
function setTodayDate(elementId) {
    const input = document.getElementById(elementId);
    if (input) {
        input.value = new Date().toISOString().split('T')[0];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTodayDate('reminder_date');
});

// Function to delete a reminder
function deleteReminder(reminderId) {
    fetch(`/reminders/delete_reminder/${reminderId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => response.json().then(data => {
            console.log('Server response:', data);
            if (!response.ok) {
                throw new Error(data.message);
            }
            return data;
        }))
        .then(data => {
            alert(data.message);
            location.reload(); // Перезагрузка страницы после успешного выполнения
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Function to create a reminder
function createReminder(paymentId) {
    fetch(`/payments/create_reminder/${paymentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => {
            return response.text().then(text => {
                console.log('Server response:', text);
                if (!response.ok) {
                    throw new Error(text);
                }
                return JSON.parse(text);
            });
        })
        .then(data => {
            alert(data.message);
            location.reload(); // Перезагрузка страницы после успешного выполнения
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

function editReminder(formId, reminderId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID ${formId} not found.`);
        return;
    }

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/reminders/edit_reminder/${reminderId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}