import React from 'react';
import { TextField } from '@mui/material';
import { validateNumber } from '../validation/ValidationRules';

const NumericInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  min = 0, 
  max = null,
  step = 1
}) => {
  const handleChange = (e) => {
    const { value } = e.target;
    const validation = validateNumber(value, name, min, max);
    onChange(e, validation);
  };

  return (
    <TextField
      fullWidth
      label={label}
      name={name}
      value={value}
      onChange={handleChange}
      margin="normal"
      type="number"
      error={!!error}
      helperText={error}
      inputProps={{ min, step }}
    />
  );
};

export default NumericInput; 