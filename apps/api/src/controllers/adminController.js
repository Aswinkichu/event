const adminService = require('../services/adminService');
const storageService = require('../services/storageService');

// Category Management
const createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = await storageService.uploadFile(req.file);
    }
    const category = await adminService.createCategory(data);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = await storageService.uploadFile(req.file);
    }
    const category = await adminService.updateCategory(req.params.id, data);
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await adminService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Option & Pricing Management
const createOption = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = await storageService.uploadFile(req.file);
    }
    // Handle price if sent as string from form-data
    if (data.price) data.price = parseFloat(data.price);
    if (data.isDefault) data.isDefault = data.isDefault === 'true' || data.isDefault === true;

    const option = await adminService.createOption(data);
    res.status(201).json(option);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOption = async (req, res) => {
  try {
    const option = await adminService.updateOption(req.params.id, req.body);
    res.json(option);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOption = async (req, res) => {
  try {
    await adminService.deleteOption(req.params.id);
    res.json({ message: 'Option deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Booking Management
const getAllBookings = async (req, res) => {
  try {
    const data = await adminService.getAllBookings(req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const booking = await adminService.updateBookingStatus(req.params.id, req.body.status);
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await adminService.getBookingById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createCategory, updateCategory, deleteCategory,
  createOption, updateOption, deleteOption,
  getAllBookings, updateBookingStatus, getBookingById
};

