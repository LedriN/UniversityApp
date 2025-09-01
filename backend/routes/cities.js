const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Hardcoded Kosovo cities
const KOSOVO_CITIES = [
  // Major Cities
  { name: 'Prishtinë', region: 'Prishtinë' },
  { name: 'Prizren', region: 'Prizren' },
  { name: 'Pejë', region: 'Pejë' },
  { name: 'Gjakovë', region: 'Gjakovë' },
  { name: 'Gjilan', region: 'Gjilan' },
  { name: 'Mitrovicë', region: 'Mitrovicë' },
  { name: 'Ferizaj', region: 'Ferizaj' },
  
  // Other Important Cities
  { name: 'Vushtrri', region: 'Mitrovicë' },
  { name: 'Podujevë', region: 'Prishtinë' },
  { name: 'Lipjan', region: 'Prishtinë' },
  { name: 'Kamenicë', region: 'Gjilan' },
  { name: 'Viti', region: 'Gjilan' },
  { name: 'Deçan', region: 'Pejë' },
  { name: 'Istog', region: 'Pejë' },
  { name: 'Klinë', region: 'Pejë' },
  { name: 'Skënderaj', region: 'Mitrovicë' },
  { name: 'Obiliq', region: 'Prishtinë' },
  { name: 'Drenas', region: 'Prishtinë' },
  { name: 'Shtime', region: 'Ferizaj' },
  { name: 'Kaçanik', region: 'Ferizaj' },
  { name: 'Shtërpcë', region: 'Ferizaj' },
  { name: 'Dragash', region: 'Prizren' },
  { name: 'Malishevë', region: 'Prizren' },
  { name: 'Rahovec', region: 'Prizren' },
  { name: 'Suharekë', region: 'Prizren' },
  { name: 'Novobërdë', region: 'Prishtinë' },
  { name: 'Ranillug', region: 'Gjilan' },
  { name: 'Partesh', region: 'Gjilan' },
  { name: 'Kllokot', region: 'Gjilan' },
  { name: 'Graçanicë', region: 'Prishtinë' },
  { name: 'Fushë Kosovë', region: 'Prishtinë' },
  { name: 'Hani i Elezit', region: 'Ferizaj' },
  { name: 'Mamushë', region: 'Prizren' },
  { name: 'Zubin Potok', region: 'Mitrovicë' },
  { name: 'Zveçan', region: 'Mitrovicë' },
  { name: 'Leposaviq', region: 'Mitrovicë' },
  { name: 'Mitrovica e Veriut', region: 'Mitrovicë' }
];

// @route   GET /api/cities
// @desc    Get all Kosovo cities (hardcoded)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json(KOSOVO_CITIES);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error while fetching cities' });
  }
});

module.exports = router;
