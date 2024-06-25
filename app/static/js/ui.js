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



// Function to toggle details in user subscriptions
function toggleDetails(id) {
    const details = document.getElementById(id);
    if (details.hasAttribute('open')) {
        details.removeAttribute('open');
    } else {
        details.setAttribute('open', 'open');
    }
}





// Function to edit subscription























