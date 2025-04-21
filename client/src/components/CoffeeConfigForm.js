import React, { useState, useEffect } from 'react';
import { Box, Typography, Autocomplete, Alert, Button, TextField } from '@mui/material';
import NumericInput from './fields/NumericInput';
import { validateRequired } from './validation/ValidationRules';

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
      const response = await fetch(`${API_BASE_URL}/api/configs`);
      const configs = await response.json();
      
      const uniqueBrands = [...new Set(configs.map(config => config.brand))];
      const uniqueBlends = [...new Set(configs.map(config => config.blend))];
      
      setSuggestions({
        brands: uniqueBrands,
        blends: uniqueBlends
      });
    } catch (error) {
      setSubmitError('Failed to load suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleNumericChange = (e, validation) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validation.message }));
    setSubmitError(null);
  };

  const handleAutocompleteChange = (field, value) => {
    const validation = validateRequired(value, field);
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validation.message }));
    setSubmitError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    try {
      const brandValidation = validateRequired(formData.brand, 'Brand');
      const blendValidation = validateRequired(formData.blend, 'Blend');
      
      if (!brandValidation.isValid || !blendValidation.isValid) {
        setErrors({
          brand: brandValidation.message,
          blend: blendValidation.message
        });
        return;
      }

      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/configs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      await response.json();
      await fetchSuggestions();
      
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
      
      if (onConfigSaved) {
        onConfigSaved();
      }
    } catch (error) {
      setSubmitError(error.message);
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
            error={!!errors.brand}
            helperText={errors.brand}
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
            error={!!errors.blend}
            helperText={errors.blend}
          />
        )}
      />
      <NumericInput
        label="Coffee Weight (g)"
        name="coffee_weight"
        value={formData.coffee_weight}
        onChange={handleNumericChange}
        error={errors.coffee_weight}
        step={0.1}
      />
      <NumericInput
        label="Grind Size"
        name="grind_size"
        value={formData.grind_size}
        onChange={handleNumericChange}
        error={errors.grind_size}
        step={0.1}
      />
      <NumericInput
        label="Grind Time (seconds)"
        name="grind_time"
        value={formData.grind_time}
        onChange={handleNumericChange}
        error={errors.grind_time}
      />
      <NumericInput
        label="Water Temperature (°C)"
        name="water_temp"
        value={formData.water_temp}
        onChange={handleNumericChange}
        error={errors.water_temp}
      />
      <NumericInput
        label="Brew Time (seconds)"
        name="brew_time"
        value={formData.brew_time}
        onChange={handleNumericChange}
        error={errors.brew_time}
      />
      <TextField
        fullWidth
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        margin="normal"
        multiline
        rows={4}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        disabled={isLoading}
      >
        Save Configuration
      </Button>
    </Box>
  );
};

export default CoffeeConfigForm; 