const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const redisClient = require('../config/redis');

const usuarioController = {
  async registro(req, res) {
    try {
      const { email, password, nombre } = req.body;
      
      // Verificar si el usuario ya existe
      const usuarioExistente = await Usuario.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
      
      const usuario = await Usuario.crear(email, password, nombre);
      res.status(201).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error en el registro' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const usuario = await Usuario.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      const passwordValida = await bcrypt.compare(password, usuario.password);
      if (!passwordValida) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }
      
      const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Guardar token en Redis
      await redisClient.setEx(`user_${usuario.id}`, 86400, token);
      
      res.json({
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Error en el login' });
    }
  },

  async logout(req, res) {
    try {
      // Agregar token a lista negra
      await redisClient.setEx(`bl_${req.token}`, 86400, 'true');
      res.json({ mensaje: 'Sesión cerrada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error en el logout' });
    }
  },

  async perfil(req, res) {
    try {
      const usuario = await Usuario.buscarPorId(req.user.id);
      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el perfil' });
    }
  }
};

module.exports = usuarioController;