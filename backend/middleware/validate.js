// Sanitize a string: trim whitespace and strip HTML/script tags
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .trim()
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')  // remove script tags
    .replace(/<[^>]+>/g, '')                               // strip all HTML tags
    .replace(/[<>]/g, '');                                 // remove stray < >
};

// Recursively sanitize all string values in an object
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// Joi validation + sanitization middleware
export const validate = (schema) => (req, res, next) => {
  // 1. Sanitize input first
  req.body = sanitizeObject(req.body);

  // 2. Validate with Joi
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,    // return all errors at once
    stripUnknown: true,   // remove unknown fields
  });

  if (error) {
    const messages = error.details.map(d => d.message.replace(/['"]/g, ''));
    return res.status(400).json({
      success: false,
      message: messages[0],          // first error for simplicity
      errors: messages,              // all errors for frontend
    });
  }

  req.validatedData = value;
  next();
};
