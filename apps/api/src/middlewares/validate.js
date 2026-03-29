const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Replace req data with validated data only if they exist in the schema
    if (validatedData.body !== undefined) req.body = validatedData.body;
    if (validatedData.query !== undefined) req.query = validatedData.query;
    if (validatedData.params !== undefined) req.params = validatedData.params;
    
    next();
  } catch (error) {
    if (error.issues) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(400).json({
      message: error.message || 'Validation failed'
    });
  }
};

module.exports = validate;
