const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');

// Admission form route
router.get('/', (req, res) => {
    res.render('admission'); // Assuming you have a view file named 'admission' to render the form
});

// Handle admission form submission
router.post('/', (req, res) => {
    const { fullName, dateOfBirth, gender, address, phoneNumber, email, previousSchool, gradeApplyingFor, guardianName, guardianPhoneNumber, guardianEmail, additionalNotes } = req.body;

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

    newAdmission.save((err) => {
        if (err) {
            console.error('Error submitting admission form:', err);
            return res.status(500).send('Error submitting admission form.');
        }
        res.send('Admission form submitted successfully!');
    });
});

// View all admission applications
router.get('/applications', (req, res) => {
    Admission.find({}, (err, applications) => {
        if (err) {
            console.error('Error fetching admission applications:', err);
            return res.status(500).send('Error fetching admission applications.');
        }
        res.json(applications);
    });
});

module.exports = router;
