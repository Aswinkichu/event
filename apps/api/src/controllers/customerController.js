const customerService = require('../services/customerService');

const getCategories = async (req, res) => {
  try {
    const data = await customerService.getCategories(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOptionsByCategory = async (req, res) => {
  try {
    const data = await customerService.getOptionsByCategory(req.params.categoryId, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  const { categoryId, selectedOptions, eventDate } = req.body;
  try {
    const booking = await customerService.createBooking(
      req.user.id,
      categoryId,
      selectedOptions,
      eventDate
    );
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const data = await customerService.getMyBookings(req.user.id, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomOption = async (req, res) => {
  try {
    const data = { ...req.body, image: req.file };
    const option = await customerService.createCustomOption(data);
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = {
  getCategories,
  getOptionsByCategory,
  createBooking,
  getMyBookings,
  createCustomOption
};


