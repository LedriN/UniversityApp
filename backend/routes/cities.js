const express = require('express');
const City = require('../models/City');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cities
// @desc    Get all Kosovo cities
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ nameAlbanian: 1 });
    res.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    res.status(500).json({ message: 'Server error while fetching cities' });
  }
});

// @route   POST /api/cities/seed
// @desc    Seed Kosovo cities data (admin only)
// @access  Private
router.post('/seed', auth, async (req, res) => {
  try {
    // Check if cities already exist
    const existingCities = await City.countDocuments();
    if (existingCities > 0) {
      return res.status(400).json({ message: 'Cities already seeded' });
    }

         const kosovoCities = [
       // Major Cities
       { name: 'Pristina', nameAlbanian: 'Prishtinë', region: 'Prishtinë', population: 198897 },
       { name: 'Prizren', nameAlbanian: 'Prizren', region: 'Prizren', population: 177781 },
       { name: 'Peja', nameAlbanian: 'Pejë', region: 'Pejë', population: 96050 },
       { name: 'Gjakova', nameAlbanian: 'Gjakovë', region: 'Gjakovë', population: 94556 },
       { name: 'Gjilan', nameAlbanian: 'Gjilan', region: 'Gjilan', population: 90015 },
       { name: 'Mitrovica', nameAlbanian: 'Mitrovicë', region: 'Mitrovicë', population: 84635 },
       { name: 'Ferizaj', nameAlbanian: 'Ferizaj', region: 'Ferizaj', population: 108610 },
       { name: 'Pec', nameAlbanian: 'Pejë', region: 'Pejë', population: 96050 },
       
       // Other Important Cities
       { name: 'Vushtrri', nameAlbanian: 'Vushtrri', region: 'Mitrovicë', population: 69870 },
       { name: 'Podujeva', nameAlbanian: 'Podujevë', region: 'Prishtinë', population: 88399 },
       { name: 'Lipjan', nameAlbanian: 'Lipjan', region: 'Prishtinë', population: 57574 },
       { name: 'Kamenica', nameAlbanian: 'Kamenicë', region: 'Gjilan', population: 36186 },
       { name: 'Viti', nameAlbanian: 'Viti', region: 'Gjilan', population: 46087 },
       { name: 'Decan', nameAlbanian: 'Deçan', region: 'Pejë', population: 38053 },
       { name: 'Istog', nameAlbanian: 'Istog', region: 'Pejë', population: 39004 },
       { name: 'Klina', nameAlbanian: 'Klinë', region: 'Pejë', population: 38596 },
       { name: 'Skenderaj', nameAlbanian: 'Skënderaj', region: 'Mitrovicë', population: 50978 },
       { name: 'Vucitrn', nameAlbanian: 'Vushtrri', region: 'Mitrovicë', population: 69870 },
       { name: 'Obilic', nameAlbanian: 'Obiliq', region: 'Prishtinë', population: 21864 },
       { name: 'Drenas', nameAlbanian: 'Drenas', region: 'Prishtinë', population: 58731 },
       { name: 'Shtime', nameAlbanian: 'Shtime', region: 'Ferizaj', population: 27084 },
       { name: 'Kacanik', nameAlbanian: 'Kaçanik', region: 'Ferizaj', population: 33593 },
       { name: 'Shtërpcë', nameAlbanian: 'Shtërpcë', region: 'Ferizaj', population: 6722 },
       { name: 'Dragash', nameAlbanian: 'Dragash', region: 'Prizren', population: 33927 },
       { name: 'Malisheva', nameAlbanian: 'Malishevë', region: 'Prizren', population: 54163 },
       { name: 'Rahovec', nameAlbanian: 'Rahovec', region: 'Prizren', population: 56198 },
       { name: 'Suhareka', nameAlbanian: 'Suharekë', region: 'Prizren', population: 59702 },
       { name: 'Novoberda', nameAlbanian: 'Novobërdë', region: 'Prishtinë', population: 6756 },
       { name: 'Ranillug', nameAlbanian: 'Ranillug', region: 'Gjilan', population: 3840 },
       { name: 'Partesh', nameAlbanian: 'Partesh', region: 'Gjilan', population: 1787 },
       { name: 'Kllokot', nameAlbanian: 'Kllokot', region: 'Gjilan', population: 2844 },
       { name: 'Graçanica', nameAlbanian: 'Graçanicë', region: 'Prishtinë', population: 10675 },
       { name: 'Fushe Kosove', nameAlbanian: 'Fushë Kosovë', region: 'Prishtinë', population: 34584 },
       { name: 'Hani i Elezit', nameAlbanian: 'Hani i Elezit', region: 'Ferizaj', population: 9403 },
       { name: 'Mamusha', nameAlbanian: 'Mamushë', region: 'Prizren', population: 5547 },
       { name: 'Zubin Potok', nameAlbanian: 'Zubin Potok', region: 'Mitrovicë', population: 15411 },
       { name: 'Zvecan', nameAlbanian: 'Zveçan', region: 'Mitrovicë', population: 16850 },
       { name: 'Leposavic', nameAlbanian: 'Leposaviq', region: 'Mitrovicë', population: 18702 },
       { name: 'North Mitrovica', nameAlbanian: 'Mitrovica e Veriut', region: 'Mitrovicë', population: 12000 }
     ];

    await City.insertMany(kosovoCities);
    res.json({ message: 'Kosovo cities seeded successfully', count: kosovoCities.length });
  } catch (error) {
    console.error('Seed cities error:', error);
    res.status(500).json({ message: 'Server error while seeding cities' });
  }
});

module.exports = router;
