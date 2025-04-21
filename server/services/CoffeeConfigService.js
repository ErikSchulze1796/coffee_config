class CoffeeConfigService {
  constructor(repository) {
    this.repository = repository;
  }

  async getAllConfigs() {
    try {
      return await this.repository.findAll();
    } catch (error) {
      throw new Error('Failed to fetch configurations');
    }
  }

  async saveConfig(config) {
    try {
      if (!config.brand || !config.blend) {
        throw new Error('Brand and blend are required');
      }
      return await this.repository.save(config);
    } catch (error) {
      throw new Error('Failed to save configuration');
    }
  }

  async deleteConfig(id) {
    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new Error('Failed to delete configuration');
    }
  }
}

module.exports = CoffeeConfigService; 