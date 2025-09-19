const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        // Check if err.issues exists (Zod)
        if (err.issues) {
            const errors = err.issues.map(e => ({ field: e.path[0], message: e.message }));
            return res.status(400).json({ errors });
        }
        // Fallback for other errors
        return res.status(400).json({ message: err.message });
    }
};

module.exports = validate;
