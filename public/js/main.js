/**
 * Modern Gaming Armory - Interactive Dark Theme
 * Enhanced with gaming-style effects and interactions
 */

// Initialize when DOM is loaded - optimized for performance
document.addEventListener('DOMContentLoaded', function() {
    initializeEssentialFeatures();
    
    // Defer non-critical animations
    requestIdleCallback(() => {
        initializeOptionalEffects();
    });
});

/**
 * Initialize essential features only
 */
function initializeEssentialFeatures() {
    // Add loading states to forms with gaming style
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<div class="loading-gaming"><div></div><div></div></div> Processing...';
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-loading');
                
                // Re-enable after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                }, 5000);
            }
        });
    });

    // Add smooth scrolling to anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Basic class colors and tooltips
    initializeClassColors();
    initializeTooltips();
}

/**
 * Initialize optional effects with performance in mind
 */
function initializeOptionalEffects() {
    // Only add effects if not on mobile or if device can handle it
    if (window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initializeSimpleEffects();
    }
    
    // Add page visibility performance optimization
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            pauseAnimations();
        } else {
            resumeAnimations();
        }
    });
}

/**
 * Initialize simple effects for better performance
 */
function initializeSimpleEffects() {
    // Add subtle hover effects only
    addHoverEffects();
    
    // Add level badge effects for max level characters (simplified)
    enhanceLevelBadges();
}

/**
 * Pause animations for performance
 */
function pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
    const animations = document.querySelectorAll('[style*="animation"]');
    animations.forEach(el => el.style.animationPlayState = 'paused');
}

/**
 * Resume animations
 */
function resumeAnimations() {
    document.body.style.animationPlayState = 'running';
    const animations = document.querySelectorAll('[style*="animation"]');
    animations.forEach(el => el.style.animationPlayState = 'running');
/**
 * Enhance level badges with simple special effects
 */
function enhanceLevelBadges() {
    const levelBadges = document.querySelectorAll('.badge.bg-primary');
    levelBadges.forEach(badge => {
        const text = badge.textContent.trim();
        const level = parseInt(text);
        if (level === 80) {
            badge.classList.add('level-badge-80');
        }
    });
}

/**
 * Add simple hover effects
 */
function addHoverEffects() {
    // Add subtle hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Initialize Bootstrap tooltips with gaming style
 */
function initializeTooltips() {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (tooltipTriggerList.length > 0 && typeof bootstrap !== 'undefined') {
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => 
            new bootstrap.Tooltip(tooltipTriggerEl, {
                customClass: 'gaming-tooltip'
            })
        );
    }
}

/**
 * Simple alert handling - removed complex animations for performance
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        // Simple auto-dismiss after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.opacity = '0';
                alert.style.transition = 'opacity 0.3s ease';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }
        }, 5000);
    });
}

/**
 * Simple search functionality - removed effects for performance
 */
function initializeSearch() {
    const searchForm = document.querySelector('form[action="/search"]');
    const searchInput = document.querySelector('input[name="q"]');
    
    if (searchForm && searchInput) {
        // Prevent empty searches
        searchForm.addEventListener('submit', function(e) {
            if (searchInput.value.trim().length < 2) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }
}

/**
 * Initialize class colors - simplified for performance
 */
function initializeClassColors() {
    const classColors = {
        1: '#C79C6E',  // Warrior
        2: '#F58CBA',  // Paladin
        3: '#ABD473',  // Hunter
        4: '#FFF569',  // Rogue
        5: '#FFFFFF',  // Priest
        6: '#C41F3B',  // Death Knight
        7: '#0070DE',  // Shaman
        8: '#69CCF0',  // Mage  
        9: '#9482C9',  // Warlock
        11: '#FF7D0A'  // Druid
    };

    const classElements = document.querySelectorAll('[data-class]');
    classElements.forEach(element => {
        const classId = parseInt(element.dataset.class);
        if (classColors[classId]) {
            element.style.color = classColors[classId];
            element.style.fontWeight = 'bold';
        }
    });

    window.ModernArmory = window.ModernArmory || {};
    window.ModernArmory.classColors = classColors;
}

// Removed all complex particle effects and animations for better performance

// Fallback for older browsers that don't support requestIdleCallback
if (!window.requestIdleCallback) {
    window.requestIdleCallback = function(callback) {
        return setTimeout(callback, 1);
    };
}

/**
 * Utility functions
 */
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}