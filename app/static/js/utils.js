// Function to get CSRF token
function getCsrfToken() {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    return csrfMetaTag ? csrfMetaTag.getAttribute('content') : '';
}

// Function to update the user list
function updateUserList() {
    fetch('/get_users_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('users').innerHTML = data.users_html;
        })
        .catch(error => console.error('Error loading the user list:', error));
}

// Function to update the subscription lists
function updateSubscriptionList() {
    fetch('/subscriptions/get_subscriptions_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('one_time_subscriptions').innerHTML = data.one_time_subscriptions;
            document.getElementById('regular_subscriptions').innerHTML = data.regular_subscriptions;
        })
        .catch(error => console.error('Error loading the subscription lists:', error));
}

// Function to update the reminder list
function updateReminderList() {
    fetch('/reminders/get_reminders_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('reminders').innerHTML = data.reminders_html;
        })
        .catch(error => console.error('Error loading the reminder list:', error));
}

// Function to update the payment list
function updatePaymentList() {
    fetch('/payments/get_payments_partial')
        .then(response => response.json())
        .then(data => {
            document.getElementById('payments').innerHTML = data.payments_html;
        })
        .catch(error => console.error('Error loading the payment list:', error));
}

function updateLists() {
    updateReminderList()
    updatePaymentList()
    updateSubscriptionList()
    updateUserList()
}