const jwt = require('jsonwebtoken');

module.exports = {
    auth: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            console.log(authHeader, 'authHeader');
            if (!authHeader) {
                return res.status(401).json({ message: "No token" });
            }
            // ✅ Extract token (remove "Bearer ")
            const token = authHeader.split(" ")[1];
            console.log(token, 'token');
            const decoded = jwt.verify(token, "secretKey");
            console.log(decoded, 'decoded');
            req.user = decoded;
            next();
        } catch (err) {
            console.log(err.message);
            res.status(401).json({ message: "Invalid token" });
        }
    }
}