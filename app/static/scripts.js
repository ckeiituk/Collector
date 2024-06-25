// Function to switch between main content tabs
function openTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    // Remove the active class from all tab buttons
    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the current tab content and add active class to the clicked button
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.classList.add("active");
}



function openAttachUserForm(entity, id) {
    let url;
    if (entity === 'subscription') {
        url = `/subscriptions/get_attach_user_form/${id}`;
    }

    // Check if url is defined
    if (!url) {
        console.error('URL is not defined');
        return;
    }

    // Check if the element exists
    const attachUserElement = document.getElementById('attach_user_to_subscription');
    if (!attachUserElement) {
        console.error('Element with ID attach_user_to_subscription not found');
        return;
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            attachUserElement.innerHTML = html;
            openSidebarTab(null, 'attach_user_to_subscription');
        })
        .catch(error => console.error('Error loading the form:', error));
}


function loadEditForm(type, id) {
    let url;
    switch (type) {
        case 'user':
            url = `/get_user_form/${id}`;
            break;
        case 'subscription':
            url = `/subscriptions/get_subscription_form/${id}`;
            break;
        case 'reminder':
            url = `/reminders/get_reminder_form/${id}`;
            break;
        case 'payment':
            url = `/payments/get_payment_form/${id}`;
            break;
        default:
            return;
    }

    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('edit_user').innerHTML = html;
            openSidebarTab(null, 'edit_user');
        })
        .catch(error => console.error(`Error loading ${type} edit form:`, error));
}

function openSidebarTab(event, tabName) {
    // Hide all sidebar tab contents
    const sidebarTabContents = document.getElementsByClassName("sidebar-tab-content");
    for (let i = 0; i < sidebarTabContents.length; i++) {
        sidebarTabContents[i].style.display = "none";
    }

    // Remove the active class from all sidebar tab buttons
    const sidebarTabButtons = document.getElementsByClassName("sidebar-tab-button");
    for (let i = 0; i < sidebarTabButtons.length; i++) {
        sidebarTabButtons[i].classList.remove("active");
    }

    // Show the current sidebar tab content and add active class to the clicked button
    document.getElementById(tabName).style.display = "block";
    if (event) {
        event.currentTarget.classList.add("active");
    }
}

// Initialize the first tab to be visible on page load
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.tab-button').click();
    document.querySelector('.sidebar-tab-button').click();
});

// Function to set today's date
function setTodayDate(elementId) {
    document.getElementById(elementId).value = new Date().toISOString().split('T')[0];
}

// Function to toggle details in user subscriptions
function toggleDetails(id) {
    const details = document.getElementById(id);
    if (details.hasAttribute('open')) {
        details.removeAttribute('open');
    } else {
        details.setAttribute('open', 'open');
    }
}

// Function to attach user to subscription
function attachUserToSubscription(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    // Ensure required fields are present
    if (!jsonData['user_id'] || !jsonData['subscription_id'] || !jsonData['next_due_date'] || !jsonData['amount']) {
        alert('All fields are required.');
        return;
    }

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
            location.reload(); // Reload the page after successful completion
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Function to detach user from subscription
function detachUserFromSubscription(userSubscriptionId, subscriptionId) {
    fetch(`/subscriptions/detach_user_subscription/${userSubscriptionId}/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
                location.reload(); // Reload the page on success
            } else {
                alert('Failed to detach user from subscription');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Function to edit subscription
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

function editPayment(formId, paymentId) {
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

    fetch(`/payments/edit_payment/${paymentId}`, {
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

function editUser(userId) {
    const form = document.getElementById(`editUserForm-${userId}`);
    if (!form) {
        console.error(`Form with ID editUserForm-${userId} not found.`);
        return;
    }

    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch(`/edit_user/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    console.error("Received non-JSON response:", text);
                    throw new Error("Server responded with non-JSON data.");
                });
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





// Function to toggle subscription pause
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

// Function to delete subscription
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

// Function to add a subscription
function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    // Ensure required fields are not empty
    if (!jsonData['name'] || !jsonData['description'] || !jsonData['monthly_amount'] || !jsonData['period']) {
        alert('All fields are required.');
        return;
    }

    console.log("Sending JSON data:", JSON.stringify(jsonData));

    fetch('/subscriptions/add_subscription', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',  // Set the Content-Type to application/json
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(jsonData)  // Convert the data to JSON string
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            location.reload(); // Reload the page on success
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Function to add a user
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

// Function to create a payment
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

// Function to delete a payment
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

// Function to update payment status
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

// Function to get CSRF token
function getCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    return csrfMetaTag ? csrfMetaTag.getAttribute('content') : '';
}

// Initialize today's date for reminder form on page load
document.addEventListener('DOMContentLoaded', () => {
    setTodayDate('reminder_date');
});
