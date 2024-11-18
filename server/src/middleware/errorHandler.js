const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Bad Request - Invalid JSON' });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    // Default error
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal Server Error' 
            : err.message
    });
};

module.exports = errorHandler; 