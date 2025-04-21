import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.136:3001';

const CoffeeConfigList = () => {
  const [configs, setConfigs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      console.log('Fetching configurations...');
      const response = await axios.get(`${API_BASE_URL}/api/configs`);
      console.log('Received configurations:', response.data);
      setConfigs(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching configurations:', error);
      setError('Failed to load configurations. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/configs/${id}`);
      fetchConfigs();
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Saved Configurations
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {configs.length === 0 ? (
        <Typography sx={{ textAlign: 'center' }}>
          No configurations saved yet
        </Typography>
      ) : (
        <List>
          {configs.map((config) => (
            <ListItem
              key={config.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(config.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${config.brand} - ${config.blend}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Weight: {config.coffee_weight}g | Grind Size: {config.grind_size} | Grind Time: {config.grind_time}s | Water Temp: {config.water_temp}°C | Brew Time: {config.brew_time}s
                    </Typography>
                    {config.notes && (
                      <Typography component="div" variant="body2" color="text.secondary">
                        Notes: {config.notes}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default CoffeeConfigList; 