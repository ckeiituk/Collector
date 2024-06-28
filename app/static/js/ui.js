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
    console.log('toggleUserSubscriptions called for user:', userId);

    const userRow = document.getElementById(`user-row-${userId}`);
    const existingDetailRow = document.getElementById(`details-row-${userId}`);

    if (existingDetailRow && existingDetailRow.style.display === 'table-row') {
        // Если строка с деталями уже существует и видима, просто скрываем её
        existingDetailRow.style.display = 'none';
        return;
    }

    // Если строка не существует или скрыта, отправляем запрос на получение подписок
    console.log(`Fetching subscriptions for user ${userId}`);
    fetch(`/user_subscriptions/${userId}`)
        .then(response => {
            console.log(`Received response for user ${userId}`, response);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(subscriptions => {
            console.log(`Subscriptions for user ${userId}:`, subscriptions);
            let detailRow;
            if (existingDetailRow) {
                // Если строка с деталями уже существует, используем её
                detailRow = existingDetailRow;
                detailRow.style.display = 'table-row';
            } else {
                // Если строки с деталями не существует, создаём новую
                detailRow = document.createElement('tr');
                detailRow.id = `details-row-${userId}`;
                detailRow.className = 'details-row';
                userRow.insertAdjacentElement('afterend', detailRow);
            }

            // Заполняем строку с деталями подписками
            detailRow.innerHTML = `
                <td colspan="8">
                    <ul>
                        ${renderUserSubscriptions(subscriptions)}
                    </ul>
                </td>
            `;
        })
        .catch(error => {
            console.error('Error fetching subscriptions:', error);
        });
}


function renderUserSubscriptions(subscriptions) {
    let subscriptionsHtml = '';
    subscriptions.forEach(subscription => {
        subscriptionsHtml += `
            <li id="userSubscription${subscription.id}">
                ${subscription.name} (${subscription.description})
                <form id="updateUserSubscriptionForm-${subscription.id}" onsubmit="updateUserSubscription(event, ${subscription.id})" style="display:inline;">
                    <input type="hidden" name="csrf_token" value="${subscription.csrf_token}">
                    <input type="number" name="amount" value="${subscription.amount}" step="0.01" required>
                    <input type="checkbox" name="is_manual" ${subscription.is_manual ? 'checked' : ''}> Manual
                    <button type="submit" class="action-button" data-tippy-content="Update">
                        <i class="fas fa-save"></i>
                    </button>
                </form>
                <button type="button" class="action-button" data-tippy-content="Detach" onclick="detachUserFromSubscription(${subscription.id}, ${subscription.subscription_id})">
                    <i class="fas fa-unlink"></i>
                </button>
                <button type="button" class="action-button" data-tippy-content="${subscription.is_paused ? 'Resume' : 'Pause'}" onclick="toggleUserSubscriptionPause(${subscription.id})">
                    <i class="fas fa-${subscription.is_paused ? 'play' : 'pause'}"></i>
                </button>
            </li>
        `;
    });
    return subscriptionsHtml;
}



function toggleDetails(id) {
    const details = document.getElementById(id);
    if (details.hasAttribute('open')) {
        details.removeAttribute('open');
    } else {
        details.setAttribute('open', 'open');
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




