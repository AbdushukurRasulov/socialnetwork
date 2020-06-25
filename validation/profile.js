const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfile(data) {
  let errors = {}

  let {handle, status, skills} = data;

  handle = !isEmpty(handle) ? handle : '';
  status = !isEmpty(status) ? status : '';
  skills = !isEmpty(skills) ? skills : '';
  
  if (!Validator.isLength(handle, { min: 2, max: 40 })) {
    errors.handle = 'Handle needs to between 2 and 4 characters';
  };
  
  if (Validator.isEmpty(handle)) {
    errors.handle = 'Handle field is required'
  }

  if (Validator.isEmpty(status)) {
    errors.status = 'Status field is required'
  }

  if (Validator.isEmpty(skills)) {
    errors.skills = 'Skills field is required'
  }

  if (!isEmpty(data.webiste)) {
    if (!Validator.isURL(data.webiste)) {
      errors.webiste = 'Not a valid URL'
    }
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(data.youtube)) {
      errors.youtube = 'Not a valid URL'
    }
  }

  if (!isEmpty(data.telegram)) {
    if (!Validator.isURL(data.telegram)) {
      errors.telegram = 'Not a valid URL'
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(data.linkedin)) {
      errors.linkedin = 'Not a valid URL'
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(data.instagram)) {
      errors.instagram = 'Not a valid URL'
    }
  }

  return {
    errors,
    isValid: isEmpty(errors) 
  }
}