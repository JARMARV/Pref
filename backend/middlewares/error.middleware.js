// Error handler middleware - must have 4 parameters for Express to recognize it
const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
    });

    let statusCode = 500;
    let message = 'Internal Server Error';

    // JWT/Authentication Errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid or malformed token. Please log in again.';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired. Please log in again.';
    } 
    
    // PostgreSQL Errors
    else if (err.code === '23505') {
        // Unique constraint violation
        const field = err.detail?.match(/Key \((.*?)\)=/)?.[1] || 'field';
        statusCode = 409;
        message = `A record with this ${field} already exists.`;
    } else if (err.code === '23503') {
        // Foreign key constraint violation
        statusCode = 400;
        message = 'Referenced record does not exist. Check your input.';
    } else if (err.code === '23502') {
        // Not null constraint violation
        const field = err.column || 'field';
        statusCode = 400;
        message = `The field '${field}' cannot be empty.`;
    } else if (err.code === '22P02') {
        // Invalid text representation (wrong data type)
        statusCode = 400;
        message = 'Invalid data format provided. Please check your input.';
    } else if (err.code === '42P01') {
        // Table does not exist
        statusCode = 500;
        message = 'Database error: Table not found. Contact support.';
    } else if (err.code === '42703') {
        // Column does not exist
        statusCode = 500;
        message = 'Database error: Column not found. Contact support.';
    }
    
    // Syntax/Query Errors
    else if (err.name === 'SyntaxError') {
        statusCode = 400;
        message = 'Invalid request format. Check your input.';
    }
    
    // Timeout Errors
    else if (err.code === 'ECONNREFUSED') {
        statusCode = 503;
        message = 'Database connection failed. Please try again later.';
    } else if (err.code === 'ETIMEDOUT') {
        statusCode = 504;
        message = 'Request timeout. The operation took too long.';
    }
    
    // Validation-like Errors
    else if (err.message?.includes('missing') || err.message?.includes('required')) {
        statusCode = 400;
        message = err.message;
    }
    
    // Generic bad request
    else if (err.statusCode === 400) {
        statusCode = 400;
        message = err.message;
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { 
            details: err.message 
        })
    });
};

export default errorMiddleware;