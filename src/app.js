const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const path = require('path');
const { engine } = require('express-handlebars');
const i18n = require('i18n');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const armoryRoutes = require('./routes/armory');
const accountRoutes = require('./routes/account');
const { authMiddleware, loggerMiddleware } = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3003;

// Trust proxy for rate limiting and security (behind Cloudflare/IIS)
app.set('trust proxy', 1);

// i18n Configuration
i18n.configure({
    locales: ['en', 'mn'],
    directory: path.join(__dirname, '..', 'locales'),
    defaultLocale: process.env.DEFAULT_LOCALE || 'mn',
    cookie: 'locale',
    queryParameter: 'lang',
    autoReload: true,
    updateFiles: false,
    objectNotation: true,
    api: {
        '__': '__',
        '__n': '__n'
    }
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"]
        }
    }
}));

// Custom key generator for rate limiting (handles Cloudflare/proxy IPs)
const getClientIP = (req) => {
    // Extract IP address, removing port if present
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    return ip.split(':').pop(); // Remove port number if present
};

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    keyGenerator: getClientIP
});
app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50, // Increased for testing
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: getClientIP
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Basic middleware
app.use(compression());
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(i18n.init);

// Custom language persistence middleware
app.use((req, res, next) => {
    // If language is specified in query parameter, set it and save to cookie
    if (req.query.lang && ['en', 'mn'].includes(req.query.lang)) {
        req.setLocale(req.query.lang);
        res.cookie('locale', req.query.lang, { 
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            httpOnly: false, // Allow client-side access for language switcher
            secure: false // Set to true in production with HTTPS
        });
    }
    // If no query parameter but cookie exists, use cookie
    else if (req.cookies.locale && ['en', 'mn'].includes(req.cookies.locale)) {
        req.setLocale(req.cookies.locale);
    }
    // Otherwise use default
    else {
        req.setLocale('mn');
    }
    next();
});

app.use(loggerMiddleware);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to false for development, should be true only with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(flash());

// View engine setup
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
        ne: (a, b) => a !== b,
        or: (a, b) => a || b,
        and: (a, b) => a && b,
        json: (context) => JSON.stringify(context),
        formatDate: (date) => new Date(date).toLocaleDateString(),
        formatLevel: (level) => `Level ${level}`,
        className: function(classId, options) {
            const __ = options.data.root.__;
            if (__ && typeof __ === 'function') {
                return __(`classes.${classId}`);
            }
            const locale = options.data.root.locale || 'mn';
            return i18n.__({ phrase: `classes.${classId}`, locale });
        },
        raceName: function(raceId, options) {
            const __ = options.data.root.__;
            if (__ && typeof __ === 'function') {
                return __(`races.${raceId}`);
            }
            const locale = options.data.root.locale || 'mn';
            return i18n.__({ phrase: `races.${raceId}`, locale });
        },
        __: function(key, options) {
            // Try to get the translation function from the template context
            const __ = options.data.root.__;
            if (__ && typeof __ === 'function') {
                if (typeof options.hash === 'object' && Object.keys(options.hash).length > 0) {
                    return __(key, options.hash);
                }
                return __(key);
            }
            // Fallback to direct i18n call
            const locale = options.data.root.locale || 'mn';
            if (typeof options.hash === 'object' && Object.keys(options.hash).length > 0) {
                return i18n.__({ phrase: key, locale }, options.hash);
            }
            return i18n.__({ phrase: key, locale });
        },
        math: (lvalue, operator, rvalue, operation) => {
            lvalue = parseFloat(lvalue);
            rvalue = parseFloat(rvalue);
            
            let result;
            switch (operator) {
                case "+": result = lvalue + rvalue; break;
                case "-": result = lvalue - rvalue; break;
                case "*": result = lvalue * rvalue; break;
                case "/": result = rvalue === 0 ? 0 : lvalue / rvalue; break;
                case "%": result = lvalue % rvalue; break;
                default: result = lvalue; break;
            }
            
            if (operation === "floor") return Math.floor(result);
            if (operation === "ceil") return Math.ceil(result);
            if (operation === "round") return Math.round(result);
            
            return result;
        },
        percentage: (value, max, decimals = 1) => {
            const percentage = (parseFloat(value) / parseFloat(max)) * 100;
            return decimals === 0 ? Math.round(percentage) : percentage.toFixed(decimals);
        },
        gt: (a, b) => a > b,
        lt: (a, b) => a < b,
        formatPlaytime: (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}m`;
        }
    }
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Global variables for templates
app.use((req, res, next) => {
    res.locals.siteName = process.env.SITE_NAME || 'XMETA WoW Server';
    res.locals.user = req.session.user || null;
    res.locals.messages = req.flash();
    res.locals.currentUrl = req.originalUrl;
    res.locals.locale = req.getLocale();
    res.locals.__ = res.__;
    next();
});

// Routes
app.use('/', armoryRoutes);
app.use('/auth', authRoutes);
app.use('/account', authMiddleware, accountRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        error: 'The page you are looking for does not exist.',
        statusCode: 404
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Server Error',
        error: process.env.NODE_ENV === 'production' ? 
            'Something went wrong on our end.' : err.message,
        statusCode: 500
    });
});

app.listen(PORT, () => {
    console.log(`Modern Armory server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Site: ${process.env.SITE_NAME}`);
});

module.exports = app;