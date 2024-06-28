// Function to get CSRF token
function getCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    return csrfMetaTag ? csrfMetaTag.getAttribute('content') : '';
}

function updateUserList() {
    const toggledUsers = saveUserToggleState();
    fetch('/get_users_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('users').innerHTML = data.users_html;
            restoreUserToggleState(toggledUsers);
        })
        .catch(error => {
            console.error('Error loading the user list:', error);
            showToast('Error loading the user list: ' + error.message, true);
        });
}

function saveUserToggleState() {
    const toggledUsers = {};
    document.querySelectorAll('.details-row').forEach(row => {
        const userId = row.id.replace('details-row-', '');
        toggledUsers[userId] = row.style.display !== 'none';
    });
    return toggledUsers;
}
function restoreUserToggleState(toggledUsers) {
    for (const [userId, isToggled] of Object.entries(toggledUsers)) {
        const row = document.getElementById(`details-row-${userId}`);
        if (row) {
            row.style.display = isToggled ? 'table-row' : 'none';
        }
    }
}


function saveSubscriptionToggleState() {
    const toggledSubscriptions = {};
    document.querySelectorAll('.subscription-users-row').forEach(row => {
        const subscriptionId = row.id.replace('subscription-users-', '');
        toggledSubscriptions[subscriptionId] = row.style.display !== 'none';
    });
    return toggledSubscriptions;
}

function restoreSubscriptionToggleState(toggledSubscriptions) {
    for (const [subscriptionId, isToggled] of Object.entries(toggledSubscriptions)) {
        const row = document.getElementById(`subscription-users-${subscriptionId}`);
        if (row) {
            row.style.display = isToggled ? 'table-row' : 'none';
        }
    }
}


function updateSubscriptionList() {
    const toggledSubscriptions = saveSubscriptionToggleState();
    fetch('/subscriptions/get_subscriptions_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('one_time_subscriptions').innerHTML = data.one_time_subscriptions;
            document.getElementById('regular_subscriptions').innerHTML = data.regular_subscriptions;
            restoreSubscriptionToggleState(toggledSubscriptions);
        })
        .catch(error => {
            console.error('Error loading the subscription lists:', error);
            showToast('Error loading the subscription lists: ' + error.message, true);
        });
}


// Function to update the reminder list
function updateReminderList(key = true) {
    let states;
    if (key) {
        states = saveDetailsState();
    }
    fetch('/reminders/get_reminders_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('reminders').innerHTML = data.reminders_html;
            if (key) {
                restoreDetailsState(states);
            }
        })
        .catch(error => {
            console.error('Error loading the reminder list:', error);
            showToast('Error loading the reminder list: ' + error.message, true);
        });
}

// Function to update the payment list
function updatePaymentList(key = true) {
    let states;
    if (key) {
        states = saveDetailsState();
    }
    fetch('/payments/get_payments_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('payments').innerHTML = data.payments_html;
            if (key) {
                restoreDetailsState(states);
            }
        })
        .catch(error => {
            console.error('Error loading the payment list:', error);
            showToast('Error loading the payment list: ' + error.message, true);
        });
}

// Function to update all lists
function updateLists() {
    const states = saveDetailsState();
    updateReminderList(false);
    updatePaymentList(false);
    updateSubscriptionList(false);
    updateUserList(false);
    restoreDetailsState(states);
}

// Function to save the state of <details> elements
function saveDetailsState() {
    const detailsElements = document.querySelectorAll('details');
    const states = {};
    detailsElements.forEach(details => {
        states[details.id] = details.open;
    });
    return states;
}

// Function to restore the state of <details> elements
function restoreDetailsState(states) {
    Object.keys(states).forEach(id => {
        const details = document.getElementById(id);
        if (details) {
            details.open = states[id];
        }
    });
}

// Function to show a toast notification
function showToast(message, isError = false) {
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        gravity: "top",
        position: "center",
        backgroundColor: isError ? "#e74c3c" : "#007bff",
        stopOnFocus: true,
    }).showToast();
}

document.addEventListener('DOMContentLoaded', function () {
    tippy('.action-button', {
        content(reference) {
            return reference.getAttribute('data-tippy-content');
        },
        placement: 'top', // Место отображения подсказки
        arrow: true,      // Отображение стрелки
        theme: 'light',   // Тема (есть несколько встроенных тем)
    });
});

document.addEventListener('DOMContentLoaded', function () {
    tippy('.sidebar-tab-button', {
        content(reference) {
            return reference.getAttribute('data-tippy-content');
        },
        placement: 'top', // Место отображения подсказки
        arrow: true,      // Отображение стрелки
        theme: 'light',   // Тема (есть несколько встроенных тем)
    });
});


