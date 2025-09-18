const User = require('../models/User');
const Patient = require('../models/Patient');
const Treatment = require('../models/Treatment');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Treatment.deleteMany({});

    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ayursutra.com',
      password: 'admin123',
      phone: '9876543210',
      role: 'admin',
      isVerified: true,
      isActive: true
    });

    // Create doctor users (using create to trigger password hashing)
    const doctor1 = await User.create({
      firstName: 'Dr. Rajesh',
      lastName: 'Sharma',
      email: 'rajesh@ayursutra.com',
      password: 'doctor123',
      phone: '9876543211',
      role: 'doctor',
      isVerified: true,
      isActive: true
    });

    const doctor2 = await User.create({
      firstName: 'Dr. Priya',
      lastName: 'Patel',
      email: 'priya@ayursutra.com',
      password: 'doctor123',
      phone: '9876543212',
      role: 'doctor',
      isVerified: true,
      isActive: true
    });

    const doctor3 = await User.create({
      firstName: 'Dr. Amit',
      lastName: 'Singh',
      email: 'amit@ayursutra.com',
      password: 'doctor123',
      phone: '9876543213',
      role: 'doctor',
      isVerified: true,
      isActive: true
    });

    const doctors = [doctor1, doctor2, doctor3];

    // Create patient users (using create to trigger password hashing)
    const patient1 = await User.create({
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul@example.com',
      password: 'patient123',
      phone: '9876543220',
      role: 'patient',
      isVerified: true,
      isActive: true
    });

    const patient2 = await User.create({
      firstName: 'Priya',
      lastName: 'Singh',
      email: 'priya@example.com',
      password: 'patient123',
      phone: '9876543221',
      role: 'patient',
      isVerified: true,
      isActive: true
    });

    const patient3 = await User.create({
      firstName: 'Amit',
      lastName: 'Gupta',
      email: 'amit@example.com',
      password: 'patient123',
      phone: '9876543222',
      role: 'patient',
      isVerified: true,
      isActive: true
    });

    const patient4 = await User.create({
      firstName: 'Sunita',
      lastName: 'Devi',
      email: 'sunita@example.com',
      password: 'patient123',
      phone: '9876543223',
      role: 'patient',
      isVerified: true,
      isActive: true
    });

    const patient5 = await User.create({
      firstName: 'Vikram',
      lastName: 'Yadav',
      email: 'vikram@example.com',
      password: 'patient123',
      phone: '9876543224',
      role: 'patient',
      isVerified: true,
      isActive: true
    });

    const patientUsers = [patient1, patient2, patient3, patient4, patient5];

    // Create patient profiles one by one to trigger pre-save hooks
    const patients = [];
    const patientData = [
      {
        user: patientUsers[0]._id,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        bloodGroup: 'O+',
        address: {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        prakriti: {
          vata: 45,
          pitta: 35,
          kapha: 20,
          dominantDosha: 'vata'
        },
        vikriti: {
          vata: 60,
          pitta: 25,
          kapha: 15,
          imbalance: 'Vata aggravation'
        },
        medicalHistory: [
          {
            condition: 'Hypertension',
            diagnosedDate: new Date('2020-01-01'),
            status: 'active'
          }
        ]
      },
      {
        user: patientUsers[1]._id,
        dateOfBirth: new Date('1985-08-22'),
        gender: 'female',
        bloodGroup: 'A+',
        address: {
          street: '456 Garden Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        },
        prakriti: {
          vata: 25,
          pitta: 50,
          kapha: 25,
          dominantDosha: 'pitta'
        },
        vikriti: {
          vata: 20,
          pitta: 65,
          kapha: 15,
          imbalance: 'Pitta excess'
        }
      },
      {
        user: patientUsers[2]._id,
        dateOfBirth: new Date('1992-12-10'),
        gender: 'male',
        bloodGroup: 'B+',
        address: {
          street: '789 Park Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        prakriti: {
          vata: 20,
          pitta: 25,
          kapha: 55,
          dominantDosha: 'kapha'
        },
        vikriti: {
          vata: 15,
          pitta: 20,
          kapha: 65,
          imbalance: 'Kapha excess'
        }
      },
      {
        user: patientUsers[3]._id,
        dateOfBirth: new Date('1978-03-18'),
        gender: 'female',
        bloodGroup: 'AB+',
        address: {
          street: '321 Temple Street',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India'
        },
        prakriti: {
          vata: 40,
          pitta: 40,
          kapha: 20,
          dominantDosha: 'vata-pitta'
        }
      },
      {
        user: patientUsers[4]._id,
        dateOfBirth: new Date('1995-07-25'),
        gender: 'male',
        bloodGroup: 'O-',
        address: {
          street: '654 River View',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India'
        },
        prakriti: {
          vata: 30,
          pitta: 30,
          kapha: 40,
          dominantDosha: 'kapha'
        }
      }
    ];

    // Create patients one by one to trigger pre-save hooks
    for (let i = 0; i < patientData.length; i++) {
      const data = { ...patientData[i], patientId: `PAT${(i + 1).toString().padStart(6, '0')}` };
      const patient = new Patient(data);
      await patient.save();
      patients.push(patient);
    }

    // Create treatments
    const treatments = await Treatment.insertMany([
      {
        name: 'Abhyanga',
        sanskritName: 'अभ्यंग',
        category: 'shamana',
        subCategory: 'external_applications',
        description: 'Full body oil massage with warm herbal oils to balance doshas and improve circulation.',
        duration: {
          session: 60,
          totalSessions: 7,
          frequency: 'daily',
          totalDuration: 7
        },
        indications: ['Joint pain', 'Stress', 'Insomnia', 'Dry skin'],
        contraindications: ['Fever', 'Acute illness', 'Skin infections'],
        benefits: ['Improves circulation', 'Reduces stress', 'Nourishes skin', 'Balances Vata'],
        pricing: {
          perSession: 2500,
          packagePrice: 15000
        },
        targetDosha: ['vata'],
        createdBy: doctors[0]._id
      },
      {
        name: 'Shirodhara',
        sanskritName: 'शिरोधारा',
        category: 'shamana',
        subCategory: 'external_applications',
        description: 'Continuous pouring of warm oil on the forehead to calm the mind and nervous system.',
        duration: {
          session: 45,
          totalSessions: 5,
          frequency: 'daily',
          totalDuration: 5
        },
        indications: ['Stress', 'Anxiety', 'Insomnia', 'Headaches'],
        contraindications: ['Head injuries', 'Severe mental illness'],
        benefits: ['Calms mind', 'Improves sleep', 'Reduces anxiety', 'Balances nervous system'],
        pricing: {
          perSession: 3500,
          packagePrice: 16000
        },
        targetDosha: ['vata', 'pitta'],
        createdBy: doctors[0]._id
      },
      {
        name: 'Panchakarma',
        sanskritName: 'पञ्चकर्म',
        category: 'shodhana',
        subCategory: 'virechana',
        description: 'Comprehensive detoxification and purification treatment for complete rejuvenation.',
        duration: {
          session: 120,
          totalSessions: 21,
          frequency: 'daily',
          totalDuration: 21
        },
        indications: ['Chronic diseases', 'Toxin accumulation', 'Digestive disorders'],
        contraindications: ['Pregnancy', 'Severe weakness', 'Acute infections'],
        benefits: ['Complete detoxification', 'Rejuvenation', 'Improved immunity'],
        pricing: {
          perSession: 8000,
          packagePrice: 150000
        },
        targetDosha: ['vata', 'pitta', 'kapha'],
        createdBy: doctors[1]._id
      },
      {
        name: 'Udvartana',
        sanskritName: 'उद्वर्तन',
        category: 'shamana',
        subCategory: 'external_applications',
        description: 'Herbal powder massage to reduce excess fat and improve skin texture.',
        duration: {
          session: 45,
          totalSessions: 14,
          frequency: 'daily',
          totalDuration: 14
        },
        indications: ['Obesity', 'Cellulite', 'Poor circulation', 'Kapha disorders'],
        contraindications: ['Pregnancy', 'Sensitive skin', 'Open wounds'],
        benefits: ['Weight reduction', 'Improves skin texture', 'Reduces cellulite'],
        pricing: {
          perSession: 2800,
          packagePrice: 35000
        },
        targetDosha: ['kapha'],
        createdBy: doctors[1]._id
      },
      {
        name: 'Nasya',
        sanskritName: 'नस्य',
        category: 'shodhana',
        subCategory: 'nasya',
        description: 'Nasal administration of medicated oils for head and neck disorders.',
        duration: {
          session: 30,
          totalSessions: 7,
          frequency: 'daily',
          totalDuration: 7
        },
        indications: ['Sinusitis', 'Headaches', 'Nasal congestion', 'Mental clarity'],
        contraindications: ['Nasal injuries', 'Severe cold', 'Pregnancy'],
        benefits: ['Clears sinuses', 'Improves mental clarity', 'Treats head disorders'],
        pricing: {
          perSession: 1500,
          packagePrice: 9000
        },
        targetDosha: ['vata', 'kapha'],
        createdBy: doctors[2]._id
      },
      {
        name: 'Kativasti',
        sanskritName: 'कटिवस्ति',
        category: 'shamana',
        subCategory: 'external_applications',
        description: 'Oil pooling therapy for lower back to treat spinal disorders.',
        duration: {
          session: 45,
          totalSessions: 7,
          frequency: 'daily',
          totalDuration: 7
        },
        indications: ['Lower back pain', 'Sciatica', 'Disc problems', 'Spinal stiffness'],
        contraindications: ['Skin infections', 'Open wounds', 'Fever'],
        benefits: ['Relieves back pain', 'Improves spinal flexibility', 'Strengthens back muscles'],
        pricing: {
          perSession: 2200,
          packagePrice: 14000
        },
        targetDosha: ['vata'],
        createdBy: doctors[2]._id
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`👤 Created ${1} admin user`);
    console.log(`👨‍⚕️ Created ${doctors.length} doctors`);
    console.log(`👥 Created ${patientUsers.length} patient users`);
    console.log(`🏥 Created ${patients.length} patient profiles`);
    console.log(`💊 Created ${treatments.length} treatments`);

    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@ayursutra.com / admin123');
    console.log('Doctor: rajesh@ayursutra.com / doctor123');
    console.log('Patient: rahul@example.com / patient123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Only run if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('📦 Connected to MongoDB');
      return seedData();
    })
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
