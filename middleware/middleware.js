
const jwt = require('jsonwebtoken');
const SECRET = 'IRPROJECTS';

const authenticateUser = (req, res, next) => {
    const token = req.cookies.token ; 
    console.log("token got in middleware: ",token)
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    try {

        const decoded = jwt.verify(token, SECRET);
        req.user = decoded;
        next(); 
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
};

module.exports = authenticateUser;
