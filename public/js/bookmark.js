// Function to toggle bookmark status
async function toggleBookmark(listingId, buttonElement) {
    try {
        const response = await fetch(`/api/v1/bookmarks/toggle/${listingId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Ensure cookies are sent with the request
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
            alert(data.message || 'Failed to toggle bookmark');
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        alert('An error occurred while updating bookmark');
    }
}

// Initialize bookmark buttons when the DOM is loaded
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
