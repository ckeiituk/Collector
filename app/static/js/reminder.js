// Function to set today's date
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
            showToast(data.message);
            updateReminderList(); // Update the reminder list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
// Function to edit a reminder
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
            showToast(data.message);
            updateReminderList(); // Update the reminder list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
// Function to create a reminder
function createReminder(paymentId) {
    fetch(`/payments/create_reminder/${paymentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({})
    })
        .then(response => {
            return response.json().then(data => {
                console.log('Server response:', data);
                if (!response.ok) {
                    throw new Error(data.message);
                }
                return data;
            });
        })
        .then(data => {
            showToast(data.message);
            updateLists(); // Update the lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
// Function to add a reminder
function addReminder() {
    const form = document.getElementById('addReminderForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch('/reminders/add_reminder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(jsonData)
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            showToast(data.message);
            updateReminderList(); // Update the reminder list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
