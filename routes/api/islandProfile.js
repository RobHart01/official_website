const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");
const fileUpload = require("express-fileupload");

// Middleware
// router.use(fileUpload());
const auth = require("../../middleware/auth");

// Models
const IslandProfile = require("../../models/islandprofile");

// @route      GET api/profile/me
// @desc       Get current users islandProfile
// @access     Private
router.get("/me", auth, async (req, res) => {
  try {
    const islandProfile = await IslandProfile
      .findOne({
        user: req.user.id
      })
      .populate("user", ["name", "avatar"]);

    // If no island Profile
    if (!islandProfile) {
      return res
        .status(400)
        .json({ msg: "There is no island Profile for this user" });
    }
    // If is island Profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route      POST api/islandProfile
// @desc       Create or update user island profile
// @access     Private

router.post("/", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty() && req.files===null) {
    return res.status(400).json({ errors: errors.array() });
  }

  const file = req.files.file;
  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

  const { text, name, file } = req.body;
  const islandProfileFields = {};
  islandProfileFields.user = req.user.id;
  if (text) islandProfileFields.text = text;
  if (name) islandProfileFields.name = name;
  if (file) islandProfileFields.file = file;

  try {
    let islandProfile = IslandProfile.findOne({ user: req.user.id });
    if (islandProfile) {
      islandProfile = IslandProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: islandProfileFields },
        { new: true }
      );
      return res.json({ fileName: file.name, filePath: `/uploads/${file.name}` }, islandProfile);
    } else {
      res.send("No profile exists atm")
    }
    islandProfile = new IslandProfile(islandProfileFields);
    islandProfile.save();
    res.json(islandProfile).send("success");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  };
  }
  )})

// @route      GET api/islandProfile/user/user_id
// @desc       Get profile by user ID
// @access     Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const islandProfile = await islandProfile
      .findOne({
        user: req.params.user_id
      })
      .populate("user", ["name", "avatar"]);

    if (!islandProfile)
      return res.status(400).json({ msg: "island Profile is not found" });

    res.json(islandProfile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile is not found" });
    }
    res.status(500).send("Server Error");
  }
});

module.exports = router;
