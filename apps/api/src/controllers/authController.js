const authService = require('../services/authService');
const storageService = require('../services/storageService');

const register = async (req, res) => {
  const { name, email, password, phone, countryCode, secondaryPhone } = req.body;
  try {
    let photo = null;
    if (req.file) {
      photo = await storageService.uploadFile(req.file);
    }
    const user = await authService.register({
      name, email, password, phone, countryCode, secondaryPhone, photo
    });
    res.status(201).json(user);
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

const refresh = async (req, res) => {
  const { token } = req.body;
  try {
    const result = await authService.refresh(token);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  const { token } = req.body;
  try {
    await authService.logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    // If token doesn't exist, ignore and return success anyway
    res.json({ message: 'Logged out successfully' });
  }
};

module.exports = { register, login, refresh, logout };
