const Admission = require('../models/Admission');

// Create new admission
const createAdmission = async (req, res) => {
  const { fullName, dateOfBirth, gender, address, phoneNumber, email, previousSchool, gradeApplyingFor, guardianName, guardianPhoneNumber, guardianEmail, additionalNotes } = req.body;

  try {
    const newAdmission = new Admission({
      fullName,
      dateOfBirth,
      gender,
      address,
      phoneNumber,
      email,
      previousSchool,
      gradeApplyingFor,
      guardianName,
      guardianPhoneNumber,
      guardianEmail,
      additionalNotes
    });

    const savedAdmission = await newAdmission.save();
    res.status(201).json(savedAdmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all admissions
const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find();
    res.status(200).json(admissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAdmission,
  getAdmissions
};
