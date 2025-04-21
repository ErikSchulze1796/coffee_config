export const validateNumber = (value, fieldName, min = 0, max = null) => {
  if (value === '') return true;
  const num = Number(value);
  if (isNaN(num) || num < min || (max !== null && num > max)) {
    return {
      isValid: false,
      message: max !== null ? `Must be between ${min} and ${max}` : 'Must be a non-negative number'
    };
  }
  return { isValid: true, message: '' };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }
  return { isValid: true, message: '' };
}; 