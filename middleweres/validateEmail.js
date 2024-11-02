const validateEmail = async (req, res, next) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(req.body.email)) {
      return res.status(400).json({ok:false,message:"Please enter a real email"});
    }
  next();
};
module.exports = { validateEmail };
