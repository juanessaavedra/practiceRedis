const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error();
    }

    // Verificar si el token está en la lista negra
    const tokenBloqueado = await redisClient.get(`bl_${token}`);
    if (tokenBloqueado) {
      throw new Error('Token invalidado');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Por favor autentíquese.' });
  }
};

module.exports = auth;