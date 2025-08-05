const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'modern-armory' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Authentication middleware
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        req.flash('error', 'Please log in to access this page');
        return res.redirect('/auth/login');
    }
    next();
};

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (!req.session.user || req.session.user.gmlevel < 3) {
        req.flash('error', 'Access denied');
        return res.redirect('/');
    }
    next();
};

// Logging middleware
const loggerMiddleware = (req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        user: (req.session && req.session.user) ? req.session.user.username : 'anonymous'
    });
    next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error(err.message, { 
        stack: err.stack, 
        url: req.url, 
        method: req.method,
        ip: req.ip 
    });

    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).render('error', {
        title: 'Error',
        error: process.env.NODE_ENV === 'production' ? 
            'Something went wrong' : err.message,
        statusCode: err.status || 500
    });
};

// Validation middleware
const validateInput = (rules) => {
    return (req, res, next) => {
        
        const errors = [];
        
        for (const field in rules) {
            const value = req.body[field];
            const rule = rules[field];
            
            // Required check
            if (rule.required && (!value || value.trim() === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Skip other validations if field is not required and empty
            if (!rule.required && (!value || value.trim() === '')) {
                continue;
            }
            
            // Min length check
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${field} must be at least ${rule.minLength} characters long`);
            }
            
            // Max length check
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${field} must be no more than ${rule.maxLength} characters long`);
            }
            
            // Pattern check
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
            
            // Custom validation
            if (rule.custom && !rule.custom(value)) {
                errors.push(rule.customMessage || `${field} is invalid`);
            }
        }
        
        if (errors.length > 0) {
            req.flash('error', errors.join('. '));
            // For auth routes, redirect back to the current page instead of home
            const referrer = req.get('Referrer') || req.originalUrl || '/';
            return res.redirect(referrer);
        }
        
        next();
    };
};

// CSRF protection middleware (simple implementation)
const csrfProtection = (req, res, next) => {
    
    if (req.method === 'GET') {
        // Generate token for GET requests
        const token = require('crypto').randomBytes(32).toString('hex');
        req.session.csrfToken = token;
        res.locals.csrfToken = token;
        return next();
    }
    
    // Validate token for POST requests
    const sessionToken = req.session.csrfToken;
    const requestToken = req.body._csrf || req.headers['x-csrf-token'];
    
    if (!sessionToken || !requestToken || sessionToken !== requestToken) {
        logger.warn('CSRF token mismatch', { 
            ip: req.ip, 
            url: req.url,
            sessionToken: !!sessionToken,
            requestToken: !!requestToken
        });
        
        req.flash('error', 'Invalid request. Please try again.');
        // For auth routes, redirect back to the current page instead of home
        const referrer = req.get('Referrer') || req.originalUrl || '/';
        return res.redirect(referrer);
    }
    
    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    loggerMiddleware,
    errorHandler,
    validateInput,
    csrfProtection,
    logger
};