const express = require('express');
const router = express.Router();

class CoffeeConfigController {
  constructor(service) {
    this.service = service;
  }

  async getAllConfigs(req, res) {
    try {
      const configs = await this.service.getAllConfigs();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveConfig(req, res) {
    try {
      const id = await this.service.saveConfig(req.body);
      res.status(201).json({ id });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteConfig(req, res) {
    try {
      await this.service.deleteConfig(req.params.id);
      res.json({ message: 'Config deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = (service) => {
  const controller = new CoffeeConfigController(service);
  
  router.get('/', controller.getAllConfigs.bind(controller));
  router.post('/', controller.saveConfig.bind(controller));
  router.delete('/:id', controller.deleteConfig.bind(controller));
  
  return router;
}; 