// Function to update user subscription
function updateUserSubscription(event, userSubscriptionId) {
    event.preventDefault(); // Prevent form from submitting normally

    const form = document.getElementById(`updateUserSubscriptionForm-${userSubscriptionId}`);
    const formData = new FormData(form);
    const jsonData = {};

    formData.forEach((value, key) => {
        jsonData[key] = value;
    });

    fetch(`/update_user_subscription/${userSubscriptionId}`, {
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
            updateUserList(); // Update the user list dynamically
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
            updateUserList(); // Update the user list dynamically
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
            updateUserList(); // Update the user list dynamically
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Function to delete a user
function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    fetch(`/delete_user/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message) });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);
            updateUserList(); // Update the user list dynamically
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        });
}

// Utility function to get CSRF token from meta tag
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
