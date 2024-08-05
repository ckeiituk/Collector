// Function to switch between sidebar tabs
function openSidebarTab(event, tabId) {
    console.log(`Opening sidebar tab: ${tabId}`);
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("sidebar-tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("sidebar-tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabId).style.display = "block";
    if (event) {
        event.currentTarget.className += " active";
    }
}


// Function to open the form for attaching a user to a subscription
function openAttachUserForm(entity, id) {
    let url;
    if (entity === 'subscription') {
        url = `${BASE_URL}/subscriptions/get_attach_user_form/${id}`;
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
            url = `${BASE_URL}/get_user_form/${id}`;
            break;
        case 'subscription':
            url = `${BASE_URL}/subscriptions/get_subscription_form/${id}`;
            break;
        case 'reminder':
            url = `${BASE_URL}/reminders/get_reminder_form/${id}`;
            break;
        case 'payment':
            url = `${BASE_URL}/payments/get_payment_form/${id}`;
            break;
        case 'user_subscription':
            url = `${BASE_URL}/subscriptions/get_user_subscription_form/${id}`;
            break;
        default:
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
