// Function to add a subscription
function addSubscription() {
    const form = document.getElementById('addSubscriptionForm');
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

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
            showToast(data.message);
            updateLists(); // Update the lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}

function updateUserSubscription(event, subscriptionId) {
    event.preventDefault();
    const form = document.getElementById(`updateUserSubscriptionForm-${subscriptionId}`);
    const formData = new FormData(form);

    fetch(`/update_user_subscription/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': formData.get('csrf_token')
        },
        body: JSON.stringify(Object.fromEntries(formData))
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating user subscription:', error);
    });
}

function detachUserFromSubscription(userSubscriptionId, subscriptionId) {
    fetch(`/detach_user_subscription/${userSubscriptionId}/${subscriptionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token() }}'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById(`userSubscription${userSubscriptionId}`).remove();
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error detaching user from subscription:', error);
    });
}

function toggleUserSubscriptionPause(userSubscriptionId) {
    fetch(`/toggle_user_subscription_pause`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token() }}'
        },
        body: JSON.stringify({ id: userSubscriptionId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert(data.message);
            const pauseButton = document.querySelector(`#userSubscription${userSubscriptionId} .action-button[data-tippy-content="${data.message.includes('paused') ? 'Resume' : 'Pause'}"]`);
            pauseButton.dataset.tippyContent = data.message.includes('paused') ? 'Resume' : 'Pause';
            pauseButton.querySelector('i').className = `fas fa-${data.message.includes('paused') ? 'play' : 'pause'}`;
        }
    })
    .catch(error => {
        console.error('Error toggling user subscription pause:', error);
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
            showToast(data.message);
            updateSubscriptionList(); // Update the subscription lists dynamically
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

    fetch('/subscriptions/attach_user_to_subscription', {
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