const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  try {
    const authHeader = req.headers.token;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          res.status(403).json("Token is not valid!");
          return;
        }
        req.user = user;

        next(); // מעביר את הנתונים של היוזר לפונקצייה הבאה
      });
    } else {
      return res.status(401).json("You are not authenticated!");
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};
module.exports = verify;
