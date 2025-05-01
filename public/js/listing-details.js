document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    const orderSuccessModal = document.getElementById('orderSuccessModal');
    const closeSuccessModalBtn = document.getElementById('closeSuccessModal');
    
    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collect form data
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
                    // Display order ID in modal
                    document.getElementById('displayOrderId').textContent = result.data.order._id;
                    
                    // Set PayPal payment link
                    const paypalLink = document.getElementById('paypalLink');
                    paypalLink.href = result.data.paypalLink;
                    
                    // Show success modal
                    orderSuccessModal.style.display = 'flex';
                } else {
                    alert('Error creating order: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while placing your order. Please try again.');
            }
        });
    }
    
    // Close modal functionality
    if (closeSuccessModalBtn) {
        closeSuccessModalBtn.addEventListener('click', function() {
            orderSuccessModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === orderSuccessModal) {
            orderSuccessModal.style.display = 'none';
        }
    });
});
