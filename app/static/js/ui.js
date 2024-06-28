// Function to switch between sidebar tabs
function openSidebarTab(event, tabName) {
    // Hide all sidebar tab contents
    const sidebarTabContents = document.getElementsByClassName("sidebar-tab-content");
    for (const content of sidebarTabContents) {
        content.style.display = "none";
    }

    // Remove the active class from all sidebar tab buttons
    const sidebarTabButtons = document.getElementsByClassName("sidebar-tab-button");
    for (const button of sidebarTabButtons) {
        button.classList.remove("active");
    }

    // Show the selected sidebar tab content
    const selectedSidebarTabContent = document.getElementById(tabName);
    if (selectedSidebarTabContent) {
        selectedSidebarTabContent.style.display = "block";
    }

    // Add the active class to the clicked sidebar tab button
    event.currentTarget.classList.add("active");
}

// Function to open the form for attaching a user to a subscription
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

// Function to load the edit form for different types of entities
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

function openTab(event, tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName("tab-content");
    for (const content of tabContents) {
        content.style.display = "none";
    }

    // Remove the active class from all tab buttons
    const tabButtons = document.getElementsByClassName("tab-button");
    for (const button of tabButtons) {
        button.classList.remove("active");
    }

    // Show the selected tab content
    const selectedTabContent = document.getElementById(tabName);
    if (selectedTabContent) {
        selectedTabContent.style.display = "block";
    }

    // Add the active class to the clicked tab button
    event.currentTarget.classList.add("active");
}

// Initialize the first tab to be visible on page load
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('.tab-button').click();
    document.querySelector('.sidebar-tab-button').click();
});

function toggleUserSubscriptions(userId) {
    const userRow = document.getElementById(`details-row-${userId}`);
    if (userRow.style.display === "none") {
        userRow.style.display = "table-row";
    } else {
        userRow.style.display = "none";
    }
}


function toggleSubscriptionUsers(subscriptionId) {
    const userRow = document.getElementById(`subscription-users-${subscriptionId}`);
    if (userRow.style.display === "none") {
        userRow.style.display = "table-row";
    } else {
        userRow.style.display = "none";
    }
}




