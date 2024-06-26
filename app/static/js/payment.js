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
            showToast(data.message);
            updateLists(); // Update lists dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
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
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.message);
                }
                return data;
            });
        })
        .then(data => {
            showToast(data.message);
            updatePaymentList(); // Update the payment list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
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
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.message);
                }
                return data;
            });
        })
        .then(data => {
            showToast(data.message);
            updatePaymentList(); // Update the payment list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
// Function to edit a payment
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
            showToast(data.message);
            updatePaymentList(); // Update the payment list dynamically
        })
        .catch(error => {
            showToast('An error occurred: ' + error.message, true);
        });
}
