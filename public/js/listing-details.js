/**
 * @fileoverview Order processing and UI management for product listing details page
 * Handles form submission, displays order confirmation, and manages the success modal
 */

/**
 * Initializes all event listeners and UI interactions when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmission);
    }
    
    // Initialize modal close functionality
    initializeModalControls(orderSuccessModal, closeSuccessModalBtn);
});

/**
 * Handles the order form submission process
 * 
 * @param {Event} e - The form submission event
 * @returns {Promise<void>} - Promise that resolves when the order is processed
 */
async function handleOrderSubmission(e) {
    e.preventDefault();
    
    // Collect form data from all required fields
    const formData = {
        listingId: document.getElementById('listingId').value,
        name: document.getElementById('fullName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        pincode: document.getElementById('pincode').value,
        phone: document.getElementById('phone').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
    
    try {
        // Send order data to server
        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            displayOrderSuccess(result.data);
        } else {
            showNotification('Error creating order: ' + result.message, 'error');
        }
    } catch (error) {
        showNotification('An error occurred while placing your order. Please try again.', 'error');
    }
}

/**
 * Displays the order success modal with order details
 * 
 * @param {Object} data - The order data received from the server
 * @param {Object} data.order - The created order object
 * @param {string} data.paypalLink - Link for PayPal payment if applicable
 */
function displayOrderSuccess(data) {
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    document.getElementById('displayOrderId').textContent = data.order._id;
    
    // Set PayPal payment link
    const paypalLink = document.getElementById('paypalLink');
    paypalLink.href = data.paypalLink;
    
    // Show success modal
    orderSuccessModal.style.display = 'flex';
}

/**
 * Sets up event listeners for controlling the modal dialog
 * 
 * @param {HTMLElement} modal - The modal element to control
 * @param {HTMLElement} closeButton - The button that closes the modal
 */
function initializeModalControls(modal, closeButton) {
    if (!modal || !closeButton) return;
    
    // Close modal when the close button is clicked
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

/**
 * Shows a notification to the user
 * 
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (error, success, etc.)
 */
function showNotification(message, type) {
    // This is a placeholder for a production notification system
    // Replace with your actual notification implementation
    
    // Fallback to alert only in development
    if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
        alert(message);
    } else {
        // In production, use a more user-friendly notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}
