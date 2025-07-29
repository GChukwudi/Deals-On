const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!password || !validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  if (!price || price <= 0) {
    return res.status(400).json({ error: 'Valid price is required' });
  }

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: 'Valid stock quantity is required' });
  }

  next();
};

const validateCartItem = (req, res, next) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !Number.isInteger(Number(product_id))) {
    return res.status(400).json({ error: 'Valid product ID is required' });
  }

  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateCartItem
};