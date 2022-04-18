/**
 * author       :Anthony Osei Agyemang
 * date         :23/09/2021
 * description  :User Routes
 */

const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// GET User Details for Admin Panel
router.get(`/get/adminpanel/:id`, async (req, res) => {
  const userAdminDetails = await User.findById(req.params.id).select(
    "name email phone"
  );
  if (!userAdminDetails) {
    return res.status(500).json({ success: false });
  }
  res.send(userAdminDetails);
});

// GET User(Returns a List of Users)
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash"); // don't return the passwordHash
  if (!userList) return res.status(500).json({ success: false });

  res.send(userList);
});

// GET Single User(Returns a single by id)
router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash"); // don't return passwordHash
  if (!user) return res.status(500).json({ message: "The user with the given id was not found" });  
  res.status(200).send(user);
});

// POST User(Adds a new User) For Admin to Add User(s)(For Admin Use)
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    street: req.body.street,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save(); // save new user to the database
  if (!user) return res.status(400).send("The user cannot be created");
  
  res.send(user);
});


// PUT (Update User Password) Reset User Password
router.put(`/:id`, async(req, res)=>{
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.params.id) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  ).select('-passwordHash');

  if(!user) return res.status(400).send('The user password cannot be changed.');

  res.send({user, message:`The password was changed sucessfully.`}); // User password updated(Password Reset OK)
});

//POST (Login)
router.post(`/login`, async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.SECRET;
  if (!user) return res.status(400).send("The user not found");
  
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("Password is wrong!");
  }
});

// POST (Register) For New User Registration
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });

  user = await user.save(); // save new User to the database
  if (!user) return res.status(400).send("The user cannot be created!");

  res.send(user); // return the new User to client
});


// Count the number of Users (Customers) (Only for Admin Use)  
  router.get(`/get/count/`, async (req, res) => {
    let userCount = await User.countDocuments();
    
    if (userCount == 0 || userCount == null)
      return res.status(500).json({ success: false });

    res.send({ userCount: userCount });
  });



// DELETE for Removing Users(Only for Admin Use)
//router.delete(`/:id` ,  async(req , res)=>{
router.delete(`/:id`, (req, res) => {
  const user = User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "the user was not found" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

  
module.exports = router;