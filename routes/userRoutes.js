const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const { jwtAuthMiddleware, generateToken } = require("./../jwt");

//post rout to add a person
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; //Assuming the request body contains the user data

    // Check if there is already an admin user
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Validate Aadhar Card Number must have exactly 12 digit
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number must be exactly 12 digits" });
    }

    // Check if a user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      return res.status(400).json({error: "User with the same Aadhar Card Number already exists",});
    }

    //creat a new user document using the mongoose model
    const newUser = new User(data);

    //save the user document to the database
    const response = await newUser.save();
    console.log("data saved");

    const payload = {
      id: response.id
    }
    console.log(JSON.stringify(payload));

    //generate a JWT token for the new person
    const token = generateToken(payload);
    console.log("Token is: ", token);

    //send the token back to the client

    res.status(200).json({ response: response, token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//login Route
router.post("/login", async (req, res) => {
  try {
    //Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    //find the person by username
    const user = await Person.findOne({ aadharCardNumber: aadharCardNumber });

    //if user does not match or does not exists
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //generate token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);

    //return token as response to the client
    res.status(200).json({ token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Profile Route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//update
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    //if password does not match
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    //update the password
    user.password = newPassword;
    await user.save();

    console.log("data updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
