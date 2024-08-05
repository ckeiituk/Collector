// Function to add a subscription
function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch(`${BASE_URL}/subscriptions/add_subscription`, {
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
            updateLists(); // Update the lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

// Function to toggle subscription pause
function toggleSubscriptionPause(subscriptionId) {
    fetch(`${BASE_URL}/subscriptions/toggle_subscription_pause`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({ id: subscriptionId })
    })
        .then(response => response.json())
        .then(data => {
            showToast(data.message);
            updateUserList();
            updateSubscriptionList(); // Update the subscription lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

// Function to delete subscription
function deleteSubscription(subscriptionId) {
    fetch(`${BASE_URL}/subscriptions/delete_subscription/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            showToast(data.message);
            updateSubscriptionList(); // Update the subscription lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

// Function to edit a subscription
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

    fetch(`${BASE_URL}/subscriptions/edit_subscription/${subscriptionId}`, {
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
            updateSubscriptionList(); // Update the subscription lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

// Function to detach user from subscription
function detachUserFromSubscription(userSubscriptionId, subscriptionId) {
    fetch(`${BASE_URL}/subscriptions/detach_user_subscription/${userSubscriptionId}/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showToast(data.message);
                updateUserList();
                updateSubscriptionList(); // Update the subscription lists dynamically
            } else {
                showToast('Failed to detach user from subscription', true);
            }
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

// Function to attach user to subscription
function attachUserToSubscription(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        if (key === 'is_paused') {
            jsonData[key] = value === 'on';
        } else {
            jsonData[key] = value;
        }
    });

    fetch(`${BASE_URL}/subscriptions/attach_user_to_subscription`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json().then(data => {
        if (!response.ok) {
            throw new Error(data.message);
        }
        return data;
    }))
    .then(data => {
        showToast(data.message);
        updateUserList();
        updateSubscriptionList();
    })
    .catch(error => {
        showToast('An error occurred: ' + error.message, true);
    });
}

// static/js/subscription.js
async function editUserSubscription(userSubscriptionId) {
    const form = document.getElementById(`editUserSubscriptionForm-${userSubscriptionId}`);
    const data = new FormData(form);
    const jsonData = {};

    data.forEach((value, key) => {
        jsonData[key] = value;
    });

    try {
        const response = await fetch(`${BASE_URL}/subscriptions/update_user_subscription/${userSubscriptionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message);
        }

        const result = await response.json();
        showToast(result.message);
        updateUserList(); // Update the user list dynamically
        updateSubscriptionList(); // Update the subscription list dynamically
    } catch (error) {
        console.error('Error:', error);
        showToast('Failed to update user subscription: ' + error.message, true);
    }
}




