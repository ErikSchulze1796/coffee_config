import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Autocomplete, Alert } from '@mui/material';
import axios from 'axios';

// Determine API base URL based on the current origin
const API_BASE_URL = window.location.origin.includes('localhost') 
  ? 'http://localhost:3001' 
  : 'http://192.168.0.136:3001';

// Add global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', { 
    msg, 
    url, 
    lineNo, 
    columnNo, 
    error,
    origin: window.location.origin,
    apiUrl: API_BASE_URL
  });
  return false;
};

// Add Firefox-specific error handler
if (navigator.userAgent.includes('Firefox') || navigator.userAgent.includes('FxiOS')) {
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Firefox error:', {
      message: msg,
      url: url,
      lineNo: lineNo,
      columnNo: columnNo,
      error: error,
      stack: error?.stack,
      userAgent: navigator.userAgent
    });
    return false;
  };
}

const CoffeeConfigForm = ({ onConfigSaved }) => {
  const [formData, setFormData] = useState({
    brand: '',
    blend: '',
    coffee_weight: '',
    grind_size: '',
    grind_time: '',
    water_temp: '',
    brew_time: '',
    notes: ''
  });

  const [suggestions, setSuggestions] = useState({
    brands: [],
    blends: []
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching suggestions...');
      const response = await axios.get(`${API_BASE_URL}/api/configs`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      console.log('Suggestions response:', response.data);
      const configs = response.data;
      
      const uniqueBrands = [...new Set(configs.map(config => config.brand))];
      const uniqueBlends = [...new Set(configs.map(config => config.blend))];
      
      setSuggestions({
        brands: uniqueBrands,
        blends: uniqueBlends
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });
      setSubmitError('Failed to load suggestions. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const validateNumber = (value, fieldName, min = 0, max = null) => {
    if (value === '') return true;
    const num = Number(value);
    if (isNaN(num) || num < min || (max !== null && num > max)) {
      setErrors(prev => ({ 
        ...prev, 
        [fieldName]: max !== null ? `Must be between ${min} and ${max}` : 'Must be a non-negative number' 
      }));
      return false;
    }
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
    return true;
  };

  const handleChange = (e) => {
    try {
      const { name, value } = e.target;
      console.log('Input change:', { name, value });
      setFormData(prev => ({ ...prev, [name]: value }));
      setSubmitError(null);
      
      if (['coffee_weight', 'grind_size', 'grind_time', 'water_temp', 'brew_time'].includes(name)) {
        validateNumber(value, name);
      }
    } catch (error) {
      console.error('Error in handleChange:', error);
      setSubmitError('An error occurred while processing your input.');
    }
  };

  const handleAutocompleteChange = (field, value) => {
    try {
      console.log('Autocomplete change:', { field, value });
      setFormData(prev => ({ ...prev, [field]: value }));
      setSubmitError(null);
    } catch (error) {
      console.error('Error in handleAutocompleteChange:', error);
      setSubmitError('An error occurred while selecting a value.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      const isValid = [
        validateNumber(formData.coffee_weight, 'coffee_weight'),
        validateNumber(formData.grind_size, 'grind_size'),
        validateNumber(formData.grind_time, 'grind_time'),
        validateNumber(formData.water_temp, 'water_temp'),
        validateNumber(formData.brew_time, 'brew_time')
      ].every(result => result);

      if (!isValid) {
        return;
      }

      setIsLoading(true);
      console.log('Submitting form data:', formData);
      
      // Enhanced fetch options for Firefox iOS
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'omit', // Disable credentials for Firefox iOS
        mode: 'cors'
      };

      const response = await fetch(`${API_BASE_URL}/api/configs`, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to save configuration');
      }

      console.log('Submit response:', data);
      
      // Reset form only after successful submission
      setFormData({
        brand: '',
        blend: '',
        coffee_weight: '',
        grind_size: '',
        grind_time: '',
        water_temp: '',
        brew_time: '',
        notes: ''
      });
      setErrors({});
      
      // Refresh suggestions
      await fetchSuggestions();
      
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
      setSubmitError(error.message || 'Error saving configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add Coffee Configuration
      </Typography>
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}
      {isLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading...
        </Alert>
      )}
      <Autocomplete
        freeSolo
        options={suggestions.brands}
        value={formData.brand}
        onChange={(event, newValue) => handleAutocompleteChange('brand', newValue)}
        onInputChange={(event, newInputValue) => handleAutocompleteChange('brand', newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label="Brand"
            margin="normal"
            required
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={suggestions.blends}
        value={formData.blend}
        onChange={(event, newValue) => handleAutocompleteChange('blend', newValue)}
        onInputChange={(event, newInputValue) => handleAutocompleteChange('blend', newInputValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label="Blend"
            margin="normal"
            required
          />
        )}
      />
      <TextField
        fullWidth
        label="Coffee Weight (g)"
        name="coffee_weight"
        value={formData.coffee_weight}
        onChange={handleChange}
        margin="normal"
        type="number"
        error={!!errors.coffee_weight}
        helperText={errors.coffee_weight}
        inputProps={{ min: 0, step: 0.1 }}
      />
      <TextField
        fullWidth
        label="Grind Size"
        name="grind_size"
        value={formData.grind_size}
        onChange={handleChange}
        margin="normal"
        type="number"
        error={!!errors.grind_size}
        helperText={errors.grind_size}
        inputProps={{ min: 0, step: 0.1 }}
      />
      <TextField
        fullWidth
        label="Grind Time (seconds)"
        name="grind_time"
        value={formData.grind_time}
        onChange={handleChange}
        margin="normal"
        type="number"
        error={!!errors.grind_time}
        helperText={errors.grind_time}
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Water Temperature (°C)"
        name="water_temp"
        value={formData.water_temp}
        onChange={handleChange}
        margin="normal"
        type="number"
        error={!!errors.water_temp}
        helperText={errors.water_temp}
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Brew Time (seconds)"
        name="brew_time"
        value={formData.brew_time}
        onChange={handleChange}
        margin="normal"
        type="number"
        error={!!errors.brew_time}
        helperText={errors.brew_time}
        inputProps={{ min: 0 }}
      />
      <TextField
        fullWidth
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
      >
        Save Configuration
      </Button>
    </Box>
  );
};

export default CoffeeConfigForm; 