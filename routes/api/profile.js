const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const request = require("request");
const config = require("config");

// Middleware
const auth = require("../../middleware/auth");

// Models
const Profile = require("../../models/Profile");

// @route      GET api/profile/me
// @desc       Get current users profile
// @access     Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate("user", ["name", "avatar"]);

    // If no profile
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    // If is profile
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route      POST api/profile
// @desc       Create or update user profile
// @access     Private

router.post("/", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { bio, islandName, location, youtube, twitter, instagram, facebook, twitch } = req.body;
  const profileFields = {};
  profileFields.user = req.user.id;
  if (bio) profileFields.bio = bio;
  if (islandName) profileFields.islandName = islandName;
  if (location) profileFields.location = location;
  profileFields.social = {};
  if (youtube) profileFields.social.youtube = youtube;
  if (twitter) profileFields.social.twitter = twitter;
  if (facebook) profileFields.social.facebook = facebook;
  if (instagram) profileFields.social.instagram = instagram;
  if (twitch) profileFields.social.twitch = twitch;
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route      GET api/profile
// @desc       Get all profile
// @access     Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route      GET api/profile/user/user_id
// @desc       Get profile by user ID
// @access     Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile is not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile is not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route      PUT api/profile/experience
// @desc       Add profile experience
// @access     Private
// router.put(
//   "/experience",
//   [
//     auth,
//     [
//       check("title", "Title is required")
//         .not()
//         .isEmpty(),
//       check("company", "Company is required")
//         .not()
//         .isEmpty(),
//       check("from", "From date is required")
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     // Array destructuring
//     const {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description
//     } = req.body;

//     const newExp = {
//       title,
//       company,
//       location,
//       from,
//       to,
//       current,
//       description
//     };

//     try {
//       // Get user
//       const profile = await Profile.findOne({ user: req.user.id });

//       profile.experience.unshift(newExp);

//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

// @route      DELETE api/profile/experience/:exp_id
// @desc       Delete experience from profile
// @access     Public

// router.delete("/experience/:exp_id", auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.user.id });

//     // Get remove index
//     const removeIndex = profile.experience
//       .map(item => item.id)
//       .indexOf(req.params.exp_id);

//     profile.experience.splice(removeIndex, 1);

//     await profile.save();

//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// @route      PUT api/profile/education
// @desc       Add profile education
// @access     Private
// router.put(
//   "/education",
//   [
//     auth,
//     [
//       check("school", "School is required")
//         .not()
//         .isEmpty(),
//       check("degree", "Degree is required")
//         .not()
//         .isEmpty(),
//       check("fieldofstudy", "Field of study is required")
//         .not()
//         .isEmpty()
//     ]
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     // Array destructuring
//     const {
//       school,
//       degree,
//       fieldofstudy,
//       from,
//       to,
//       current,
//       description
//     } = req.body;

//     const newEdu = {
//       school,
//       degree,
//       fieldofstudy,
//       from,
//       to,
//       current,
//       description
//     };

//     try {
//       // Get user
//       const profile = await Profile.findOne({ user: req.user.id });

//       profile.education.unshift(newEdu);

//       await profile.save();
//       res.json(profile);
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

// // @route      DELETE api/profile/education/:edu_id
// // @desc       Delete education from profile
// // @access     Public

// router.delete("/education/:edu_id", auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({ user: req.user.id });

//     // Get remove index
//     const removeIndex = profile.education
//       .map(item => item.id)
//       .indexOf(req.params.edu_id);

//     profile.education.splice(removeIndex, 1);

//     await profile.save();

//     res.json(profile);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

// @route      GET api/profile/github/:username
// @desc       Get user repos from github
// @access     Public
// router.get("/github/:username", (req, res) => {
//   try {
//     const options = {
//       uri: `https://api.github.com/users/${
//         req.params.username
//       }/repos?per_page=5&sort=created:asc&client_id=${config.get(
//         "githubClientId"
//       )}&client_secret=${config.get("githubSecret")}`,
//       method: "GET",
//       headers: { "user-agent": "node.js" }
//     };
//     request(options, (error, response, body) => {
//       if (error) console.error(error);
//       if (response.statusCode !== 200) {
//         return res.status(404).json({ msg: "No Github profile found" });
//       }
//       res.json(JSON.parse(body));
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });
module.exports = router;