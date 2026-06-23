const authService = require('./service');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required',
      });
    }

    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const valid = await authService.verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    req.session.userId = user.id;
    res.json({ user: authService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
}

async function me(req, res) {
  res.json({ user: authService.sanitizeUser(req.user) });
}

module.exports = { login, logout, me };
