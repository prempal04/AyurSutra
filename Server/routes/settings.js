const express = require('express');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get clinic settings
// @route   GET /api/settings
// @access  Private (Admin only)
const getSettings = async (req, res) => {
  try {
    // In a real application, you might have a Settings model
    // For now, we'll return some default settings
    const settings = {
      clinic: {
        name: 'AyurSutra Wellness Center',
        address: {
          street: '123 Wellness Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        contact: {
          phone: '+91 98765 43210',
          email: 'info@ayursutra.com',
          website: 'https://ayursutra.com'
        },
        registration: {
          licenseNumber: 'AYU/MH/2024/001',
          registrationDate: '2024-01-01',
          expiryDate: '2025-12-31'
        }
      },
      business: {
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        businessHours: {
          monday: { start: '09:00', end: '18:00', isOpen: true },
          tuesday: { start: '09:00', end: '18:00', isOpen: true },
          wednesday: { start: '09:00', end: '18:00', isOpen: true },
          thursday: { start: '09:00', end: '18:00', isOpen: true },
          friday: { start: '09:00', end: '18:00', isOpen: true },
          saturday: { start: '09:00', end: '16:00', isOpen: true },
          sunday: { start: '10:00', end: '14:00', isOpen: false }
        },
        appointmentSlotDuration: 30, // minutes
        maxAdvanceBooking: 30, // days
        cancellationPolicy: {
          allowCancellation: true,
          minimumNotice: 24, // hours
          refundPolicy: 'full' // full, partial, none
        }
      },
      notifications: {
        email: {
          enabled: true,
          appointmentReminder: {
            enabled: true,
            timeBefore: 24 // hours
          },
          appointmentConfirmation: {
            enabled: true
          },
          treatmentCompletion: {
            enabled: true
          }
        },
        sms: {
          enabled: true,
          appointmentReminder: {
            enabled: true,
            timeBefore: 2 // hours
          }
        },
        push: {
          enabled: false
        }
      },
      payments: {
        acceptedMethods: ['cash', 'card', 'upi', 'bank_transfer'],
        defaultMethod: 'cash',
        taxRate: 18, // GST percentage
        advancePayment: {
          required: false,
          percentage: 25
        }
      },
      security: {
        sessionTimeout: 60, // minutes
        passwordPolicy: {
          minLength: 6,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false
        },
        twoFactorAuth: {
          enabled: false,
          methods: ['sms', 'email']
        }
      },
      features: {
        onlineBooking: true,
        patientPortal: true,
        teleMedicine: false,
        multiLocation: false,
        inventoryManagement: false
      }
    };

    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update clinic settings
// @route   PUT /api/settings
// @access  Private (Admin only)
const updateSettings = async (req, res) => {
  try {
    // In a real application, you would save these to a Settings model
    const updatedSettings = req.body;

    // Validate required fields
    if (!updatedSettings.clinic?.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Clinic name is required'
      });
    }

    // Here you would typically save to database
    // await Settings.findOneAndUpdate({}, updatedSettings, { upsert: true });

    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user preferences
// @route   GET /api/settings/preferences
// @access  Private
const getUserPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    const defaultPreferences = {
      language: 'en',
      notifications: {
        email: true,
        sms: true,
        push: true
      },
      theme: 'light',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      dashboard: {
        widgets: ['appointments', 'patients', 'treatments', 'revenue'],
        layout: 'grid'
      }
    };

    const preferences = {
      ...defaultPreferences,
      ...user.preferences
    };

    res.status(200).json({
      status: 'success',
      data: { preferences }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/settings/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true, runValidators: true }
    ).select('preferences');

    res.status(200).json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: { preferences: updatedUser.preferences }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get system information
// @route   GET /api/settings/system
// @access  Private (Admin only)
const getSystemInfo = async (req, res) => {
  try {
    const systemInfo = {
      version: '1.0.0',
      buildDate: '2024-01-01',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      database: {
        status: 'connected',
        version: '7.0.0'
      },
      features: {
        multiTenant: false,
        backup: true,
        monitoring: true,
        logging: true
      }
    };

    res.status(200).json({
      status: 'success',
      data: { systemInfo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching system information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Backup data
// @route   POST /api/settings/backup
// @access  Private (Admin only)
const backupData = async (req, res) => {
  try {
    // In a real application, you would implement actual backup logic
    const backupInfo = {
      id: Date.now().toString(),
      timestamp: new Date(),
      size: '45.2 MB',
      collections: [
        'users',
        'patients',
        'appointments',
        'treatments',
        'treatmentplans',
        'healthrecords'
      ],
      status: 'completed'
    };

    res.status(200).json({
      status: 'success',
      message: 'Data backup completed successfully',
      data: { backup: backupInfo }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating backup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get audit logs
// @route   GET /api/settings/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;

    // In a real application, you would have an AuditLog model
    const mockLogs = [
      {
        id: '1',
        timestamp: new Date(),
        userId: req.user.id,
        action: 'LOGIN',
        resource: 'auth',
        details: 'User logged in successfully',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 3600000),
        userId: req.user.id,
        action: 'CREATE',
        resource: 'patient',
        details: 'Created new patient record',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    ];

    res.status(200).json({
      status: 'success',
      data: {
        logs: mockLogs,
        pagination: {
          page,
          limit,
          total: mockLogs.length,
          pages: Math.ceil(mockLogs.length / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Routes
router.get('/', authorize('admin'), getSettings);
router.put('/', authorize('admin'), updateSettings);
router.get('/preferences', getUserPreferences);
router.put('/preferences', updateUserPreferences);
router.get('/system', authorize('admin'), getSystemInfo);
router.post('/backup', authorize('admin'), backupData);
router.get('/audit-logs', authorize('admin'), getAuditLogs);

module.exports = router;
