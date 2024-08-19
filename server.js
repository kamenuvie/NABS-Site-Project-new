// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const path = require('path'); // Module for working with file and directory paths
const bcrypt = require('bcryptjs'); // For password hashing
const flash = require('express-flash'); // For flash messages
const nodemailer = require('nodemailer'); // For sending emails
const cors = require('cors'); // For handling CORS
require('dotenv').config(); // For environment variables


// Initialize Express app
const app = express();

// Use CORS middleware
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://localhost/school_website')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Nodemailer setup (change this configuration based on your email provider)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Define Mongoose schema and model for User
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Define Mongoose schema and model for Admission (example)
const admissionSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    nationality: String,
    email: String,
    phone: Number,
    address: String,
    parentName: String,
    parentEmail: String,
    formerSchool: String,
    healthInformation: String,
    registrationFee: String,
    entranceExamDate: String,
    entranceExamTime: String,
    entranceExamVenue: String
});
const Admission = mongoose.model('Admission', admissionSchema);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON bodies as well
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Use express-flash for flash messages

// Passport local strategy for authentication
passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({ username })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                })
                .catch(err => done(err));
        })
        .catch(err => done(err));
}));

// Passport session management
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((_id, done) => {
    User.findById(_id)
        .then(user => {
            done(null, user);
        })
        .catch(err => done(err));
});

// Middleware function to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' }); // Send JSON response for unauthorized access
};

// Middleware function to check if user has specific role
const hasRole = (role) => {
    return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
            return next();
        }
        res.status(403).json({ message: 'Forbidden' }); // Send JSON response for forbidden access
    };
};

// Routes

// Homepage route
app.get('/', (req, res) => {
    res.render('index'); // Render views/index.ejs
});

// Login routes
app.get('/login', (req, res) => {
    res.render('login'); // Render views/login.ejs
});

app.post('/login', passport.authenticate('local'), (req, res) => {
    res.status(200).json({ message: 'Login successful' }); // Respond with JSON for API usage
});

// Registration routes
app.get('/register', (req, res) => {
    res.render('register'); // Render views/register.ejs
});

app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    // Validate inputs
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    // Hash password before saving to database
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password.' });
        }
        // Create new User document
        const newUser = new User({ username, email, password: hashedPassword });
        // Save to MongoDB
        newUser.save()
            .then(user => {
                res.status(201).json({ message: `Welcome ${username}, registered successfully.` });
            })
            .catch(err => {
                console.error('Error registering user:', err);
                res.status(500).json({ message: 'Error registering user.' });
            });
    });
});

// Profile routes
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.user }); // Render views/profile.ejs and pass current user data
});

app.post('/profile/update', isAuthenticated, (req, res) => {
    const { username, email } = req.body;
    User.findByIdAndUpdate(req.user._id, { username, email }, { new: true })
        .then(user => {
            res.status(200).json({ message: 'Profile updated successfully' });
        })
        .catch(err => {
            console.error('Error updating profile:', err);
            res.status(500).json({ message: 'Error updating profile.' });
        });
});

app.post('/profile/password', isAuthenticated, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    User.findById(req.user._id)
        .then(user => {
            bcrypt.compare(currentPassword, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                            if (err) {
                                return res.status(500).json({ message: 'Error hashing new password.' });
                            }
                            user.password = hashedPassword;
                            user.save()
                                .then(() => {
                                    res.status(200).json({ message: 'Password changed successfully' });
                                })
                                .catch(err => {
                                    console.error('Error saving new password:', err);
                                    res.status(500).json({ message: 'Error saving new password.' });
                                });
                        });
                    } else {
                        res.status(400).json({ message: 'Current password is incorrect.' });
                    }
                })
                .catch(err => {
                    console.error('Error comparing passwords:', err);
                    res.status(500).json({ message: 'Error comparing passwords.' });
                });
        })
        .catch(err => {
            console.error('User not found:', err);
            res.status(404).json({ message: 'User not found.' });
        });
});

// Logout route
app.get('/logout', (req, res) => {
    req.logout();
    res.status(200).json({ message: 'Logged out successfully' });
});

// Example POST route handler for admission
app.post('/admission', (req, res) => {
    // Handle admission form submission here
    // Example: Save admission data to database
    const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        nationality,
        email,
        phone,
        address,
        parentName,
        parentEmail,
        formerSchool,
        healthInformation,
        registrationFee,
        entranceExamDate,
        entranceExamTime,
        entranceExamVenue
    } = req.body;

    // Validate inputs
    if (!firstName || !lastName || !dateOfBirth || !gender || !nationality || !email || !phone || !address || !parentName
        || !parentEmail || !formerSchool || !healthInformation || !registrationFee || !entranceExamDate || !entranceExamTime
        || !entranceExamVenue
    ) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

      // Example: Save admission data to MongoDB
      const newAdmission = new Admission({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        nationality,
        email,
        phone,
        address,
        parentName,
        parentEmail,
        formerSchool,
        healthInformation,
        registrationFee,
        entranceExamDate,
        entranceExamTime,
        entranceExamVenue
    });

    newAdmission.save()
        .then(admission => {
            res.status(201).json({ message: 'Admission submitted successfully' });
        })
        .catch(err => {
            console.error('Error submitting admission:', err);
            res.status(500).json({ message: 'Error submitting admission.' });
        });
});

// Set view engine and directory for views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs'); // Use EJS as template engine

// Handle 404 errors
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
