const mongoose = require('mongoose');

let Admission;
try {
  Admission = mongoose.model('Admission');
} catch (error) {
  // Model doesn't exist; define it
  const admissionSchema = new mongoose.Schema({
    firstNname: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ['Male', 'Female', 'Other']
    },
    address: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    previousSchool: {
      type: String,
      required: true
    },
    gradeApplyingFor: {
      type: String,
      required: true
    },
    guardianName: {
      type: String,
      required: true
    },
    guardianPhoneNumber: {
      type: String,
      required: true
    },
    guardianEmail: {
      type: String,
      required: true
    },
    additionalNotes: {
      type: String
    }
  }, {
    timestamps: true
  });
  
  Admission = mongoose.model('Admission', admissionSchema);
}

module.exports = Admission;
