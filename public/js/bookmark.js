/**
 * @fileoverview Client-side bookmark functionality for Thriftify
 * Manages the toggling of bookmarks for product listings and updates UI accordingly
 */

/**
 * Toggles the bookmark status of a listing via API call and updates UI
 * 
 * @param {string} listingId - The ID of the listing to bookmark/unbookmark
 * @param {HTMLElement} buttonElement - The button element that was clicked
 * @returns {Promise<void>} - Promise that resolves when the bookmark is toggled
 */
async function toggleBookmark(listingId, buttonElement) {
    try {
        // Call the bookmark toggle API endpoint
        const response = await fetch(`/api/v1/bookmarks/toggle/${listingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Ensure cookies are sent for authentication
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update button appearance based on bookmark status
            if (data.isBookmarked) {
                buttonElement.classList.add('bookmarked');
                buttonElement.innerHTML = '<i class="fas fa-bookmark"></i>';
            } else {
                buttonElement.classList.remove('bookmarked');
                buttonElement.innerHTML = '<i class="far fa-bookmark"></i>';
            }
        } else {
            // Use a more production-friendly notification approach
            showNotification(data.message || 'Failed to toggle bookmark', 'error');
        }
    } catch (error) {
        // Use a more production-friendly error handling approach
        showNotification('An error occurred while updating bookmark', 'error');
    }
}

/**
 * Displays a notification to the user
 * 
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, etc.)
 */
function showNotification(message, type) {
    // This is a placeholder for your notification system
    // Replace with your actual notification implementation
    if (type === 'error' && window.errorHandler) {
        window.errorHandler.report(message);
    }
    
    // Fallback to alert only in development
    if (process.env.NODE_ENV !== 'production') {
        alert(message);
    }
}

/**
 * Initialize bookmark functionality when the DOM is loaded
 * Attaches click event listeners to all bookmark buttons on the page
 */
document.addEventListener('DOMContentLoaded', function() {
    const bookmarkButtons = document.querySelectorAll('.bookmark-button');
    
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const listingId = this.dataset.listingId;
            toggleBookmark(listingId, this);
        });
    });
});
