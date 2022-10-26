const passport = require("passport");
const validator = require("validator");
const User = require("../models/User");
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")

exports.getLogin = (req, res) => {
  console.log(req)
  if (req.user) {
    return res.redirect("/profile");
  }
};

exports.postLogin = (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });

  passport.authenticate("local", (err, user, info) => {
    console.log(user)
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/profile");
    });
  })(req, res, next);
};

exports.logout = (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err){
      console.log("Error : Failed to destroy the session during logout.", err);
    }
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect("/profile");
  }
};

exports.registerUser = asyncHandler( async (req, res) => {
  const {name, email, password } = req.body
  if(!name || !email || !password){
      res.status(400)
      throw new Error("Fix your shit")
  }

  const userExists = await User.findOne({email})
  if(userExists){
      res.status(400)
      throw new Error('User already exists')
  }

  //Hash
  const salt = await bcrypt.genSalt(12)
  const hashedPassword = await bcrypt.hash(password, salt)

  //Create User 
  const user = await User.create({
      name, 
      email,
      password: hashedPassword
  })
  if(user){
      res.status(201).json({
          _id: user._id,
          name: user.name, 
          email: user.email,
          token: generateToken(user._id)
      })
  }else{
      res.status(400)
      throw new error("Invalid User data")
  }
  return user
})
exports.getMe =  asyncHandler(async (req, res) => {
  const user  = {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name
  }
  res.status(200).json(user)
})
const generateToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
  })
}