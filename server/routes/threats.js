const express = require('express');
const { body, validationResult } = require('express-validator');
const Threat = require('../models/Threat');
const { analyzeLog } = require('../utils/threatAnalyzer');
const geoip = require('geoip-lite');

const router = express.Router();

// Get all threats with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      type,
      severity,
      status,
      sourceIp,
      search
    } = req.query;

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (sourceIp) query.sourceIp = new RegExp(sourceIp, 'i');

    // Search functionality
    if (search) {
      query.$or = [
        { threatId: new RegExp(search, 'i') },
        { sourceIp: new RegExp(search, 'i') },
        { 'analysis.description': new RegExp(search, 'i') }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'targetUser', select: 'firstName lastName email' },
        { path: 'investigation.assignedTo', select: 'firstName lastName email' }
      ]
    };

    const threats = await Threat.paginate(query, options);
    res.json(threats);
  } catch (error) {
    console.error('Get threats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threat statistics
router.get('/statistics', async (req, res) => {
  try {
    const { startDate, endDate, type, severity } = req.query;
    
    const filters = {};
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (type) filters.type = type;
    if (severity) filters.severity = severity;

    const statistics = await Threat.getStatistics(filters);
    res.json(statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get threats by time range
router.get('/time-range', async (req, res) => {
  try {
    const { startDate, endDate, ...filters } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const threats = await Threat.getThreatsByTimeRange(startDate, endDate, filters);
    res.json(threats);
  } catch (error) {
    console.error('Get threats by time range error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single threat by ID
router.get('/:id', async (req, res) => {
  try {
    const threat = await Threat.findById(req.params.id)
      .populate('targetUser', 'firstName lastName email')
      .populate('investigation.assignedTo', 'firstName lastName email')
      .populate('investigation.notes.author', 'firstName lastName')
      .populate('actions.executedBy', 'firstName lastName');

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    res.json(threat);
  } catch (error) {
    console.error('Get threat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new threat (for API logging)
router.post('/', [
  body('type').isIn([
    'brute_force', 'sql_injection', 'xss', 'suspicious_ip', 'geo_mismatch',
    'rate_limit_exceeded', 'unauthorized_access', 'data_exfiltration',
    'malware_detected', 'ddos_attack', 'phishing_attempt', 'other'
  ]),
  body('sourceIp').isIP(),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const {
      type,
      sourceIp,
      severity = 'medium',
      eventData,
      targetUser,
      targetEndpoint,
      targetApplication = 'main'
    } = req.body;

    // Get geolocation data
    const geo = geoip.lookup(sourceIp);
    const geolocation = geo ? {
      country: geo.country,
      city: geo.city,
      region: geo.region,
      latitude: geo.ll[0],
      longitude: geo.ll[1],
      timezone: geo.timezone
    } : {};

    // Analyze the threat
    const detectedThreats = analyzeLog({ type, sourceIp, body: eventData?.body }, []);
    
    // Create threat object
    const threatData = {
      type,
      severity,
      sourceIp,
      geolocation,
      eventData,
      targetUser,
      targetEndpoint,
      targetApplication,
      analysis: {
        confidence: detectedThreats.length > 0 ? 80 : 50,
        riskScore: detectedThreats.length > 0 ? 75 : 50,
        patterns: detectedThreats,
        description: `Detected ${detectedThreats.join(', ')} patterns`,
        recommendations: detectedThreats.map(t => `Investigate ${t} activity`)
      }
    };

    const threat = new Threat(threatData);
    await threat.save();

    // Emit real-time update via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new-threat', threat);
    }

    res.status(201).json(threat);
  } catch (error) {
    console.error('Create threat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update threat
router.put('/:id', [
  body('status').optional().isIn(['new', 'investigating', 'resolved', 'false_positive', 'ignored']),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input data', details: errors.array() });
    }

    const threat = await Threat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('targetUser', 'firstName lastName email');

    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    res.json(threat);
  } catch (error) {
    console.error('Update threat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete threat
router.delete('/:id', async (req, res) => {
  try {
    const threat = await Threat.findByIdAndDelete(req.params.id);
    
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    res.json({ message: 'Threat deleted successfully' });
  } catch (error) {
    console.error('Delete threat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add note to threat
router.post('/:id/notes', [
  body('content').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    await threat.addNote(req.body.content, req.user._id);
    
    const updatedThreat = await Threat.findById(req.params.id)
      .populate('investigation.notes.author', 'firstName lastName');

    res.json(updatedThreat);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign threat to user
router.put('/:id/assign', [
  body('userId').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    await threat.assignTo(req.body.userId);
    
    const updatedThreat = await Threat.findById(req.params.id)
      .populate('investigation.assignedTo', 'firstName lastName');

    res.json(updatedThreat);
  } catch (error) {
    console.error('Assign threat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update threat status
router.put('/:id/status', [
  body('status').isIn(['new', 'investigating', 'resolved', 'false_positive', 'ignored'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const threat = await Threat.findById(req.params.id);
    if (!threat) {
      return res.status(404).json({ error: 'Threat not found' });
    }

    await threat.updateStatus(req.body.status);
    
    const updatedThreat = await Threat.findById(req.params.id);
    res.json(updatedThreat);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 