// Modern Armory JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize form enhancements
    initializeFormEnhancements();
    
    // Initialize auto-refresh for online players
    initializeAutoRefresh();
    
    // Initialize animations
    initializeAnimations();
});

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Search functionality
function initializeSearch() {
    const searchForms = document.querySelectorAll('form[action="/search"]');
    
    searchForms.forEach(form => {
        const input = form.querySelector('input[name="q"]');
        if (input) {
            // Add search suggestions (if you want to implement this later)
            input.addEventListener('input', debounce(function(e) {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    // Could implement live search suggestions here
                }
            }, 300));
        }
    });
}

// Form enhancements
function initializeFormEnhancements() {
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Form validation feedback
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
    
    // Real-time password confirmation
    const confirmPasswordInputs = document.querySelectorAll('input[name="confirmPassword"]');
    confirmPasswordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const password = document.querySelector('input[name="password"]').value;
            const confirmPassword = this.value;
            
            if (password !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
                this.classList.add('is-invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });
    });
}

// Auto-refresh functionality for online players
function initializeAutoRefresh() {
    const onlineCountElements = document.querySelectorAll('.online-count');
    
    if (onlineCountElements.length > 0) {
        // Refresh online count every 30 seconds
        setInterval(async function() {
            try {
                const response = await fetch('/api/online-count');
                if (response.ok) {
                    const data = await response.json();
                    onlineCountElements.forEach(element => {
                        element.textContent = data.count;
                    });
                }
            } catch (error) {
                console.log('Failed to update online count:', error);
            }
        }, 30000);
    }
}

// Animations
function initializeAnimations() {
    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll('.card, .list-group-item');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Format playtime
function formatPlaytime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard!', 'success');
    }).catch(function() {
        showToast('Failed to copy to clipboard', 'error');
    });
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle me-2"></i>
        ${message}
        <button type="button" class="btn-close ms-2" aria-label="Close"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
    
    // Manual close
    toast.querySelector('.btn-close').addEventListener('click', () => {
        toast.remove();
    });
}

// Character class colors
const classColors = {
    1: '#c79c6e',  // Warrior
    2: '#f58cba',  // Paladin
    3: '#abd473',  // Hunter
    4: '#fff569',  // Rogue
    5: '#ffffff',  // Priest
    6: '#c41f3b',  // Death Knight
    7: '#0070de',  // Shaman
    8: '#69ccf0',  // Mage
    9: '#9482c9',  // Warlock
    11: '#ff7d0a'  // Druid
};

// Apply class colors
function applyClassColors() {
    const classElements = document.querySelectorAll('[data-class]');
    classElements.forEach(element => {
        const classId = parseInt(element.dataset.class);
        if (classColors[classId]) {
            element.style.color = classColors[classId];
        }
    });
}

// Initialize class colors on page load
document.addEventListener('DOMContentLoaded', applyClassColors);

// Search enhancements
function enhanceSearch() {
    const searchInput = document.querySelector('input[name="q"]');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim();
        
        if (query.length >= 2) {
            searchTimeout = setTimeout(() => {
                // Could implement live search here
                performLiveSearch(query);
            }, 500);
        }
    });
}

async function performLiveSearch(query) {
    // This would be implemented if you want live search functionality
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const results = await response.json();
            displaySearchSuggestions(results);
        }
    } catch (error) {
        console.log('Live search failed:', error);
    }
}

function displaySearchSuggestions(results) {
    // Implementation for search suggestions dropdown
    // This would create a dropdown with search results
}

// Loading states
function setLoadingState(element, loading = true) {
    if (loading) {
        element.disabled = true;
        const originalText = element.textContent;
        element.dataset.originalText = originalText;
        element.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Loading...';
    } else {
        element.disabled = false;
        element.textContent = element.dataset.originalText || 'Submit';
    }
}

// Export functions for use in other scripts
window.ModernArmory = {
    formatPlaytime,
    copyToClipboard,
    showToast,
    setLoadingState,
    classColors
};