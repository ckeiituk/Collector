function attachUserToSubscription() {
    const form = document.getElementById('attachSubscriptionForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch('/subscriptions/attach_user_to_subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(jsonData)
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

function detachUserFromSubscription(userSubscriptionId, subscriptionId) {
    fetch(`/subscriptions/detach_user_subscription/${userSubscriptionId}/${subscriptionId}`, {
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

function editSubscription(formId, subscriptionId) {
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

    fetch(`/subscriptions/edit_subscription/${subscriptionId}`, {
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

function toggleSubscriptionPause(subscriptionId) {
    fetch('/subscriptions/toggle_subscription_pause', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ id: subscriptionId })
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

function deleteSubscription(subscriptionId) {
    fetch(`/subscriptions/delete_subscription/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}
function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    // Проверка обязательных полей
    if (!jsonData['name'] || !jsonData['description'] || !jsonData['monthly_amount'] || !jsonData['period']) {
        alert('All fields are required.');
        return;
    }

    console.log("Sending JSON data:", JSON.stringify(jsonData));

    fetch('/subscriptions/add_subscription', {
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
            alert(data.message);
            location.reload(); // Перезагрузка страницы после успешного выполнения
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

function addUser() {
    const form = document.getElementById('addUserForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    console.log("Sending JSON data:", JSON.stringify(jsonData));

    fetch('/add_user', {
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
            alert(data.message);
            location.reload(); // Перезагрузка страницы после успешного выполнения
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}


function createPayment() {
    const form = document.getElementById('addPaymentForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch('/payments/add_payment', {
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
            alert(data.message);
            location.reload(); // Перезагрузка страницы после успешного выполнения
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

function deletePayment(paymentId) {
    fetch(`/payments/delete_payment/${paymentId}`, {
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

function updatePaymentStatus(paymentId) {
    fetch(`/payments/update_payment_status/${paymentId}`, {
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


document.addEventListener('DOMContentLoaded', (event) => {
    setTodayDate('reminder_date');
});

function setTodayDate(elementId) {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById(elementId).value = today;
}

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

function getCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    return csrfMetaTag ? csrfMetaTag.getAttribute('content') : '';
}


function getCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    return csrfMetaTag ? csrfMetaTag.getAttribute('content') : '';
}
