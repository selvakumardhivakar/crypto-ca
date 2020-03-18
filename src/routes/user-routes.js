const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middlewares/auth");

const router = new express.Router();
router.get("/", auth, async (req, res) => {
  res.send(req.user);
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const newUser = new User(req.body);
  try {
    await newUser.save();
    const token = await newUser.generateAuthToken();
    res.status(201).send({ newUser, token });
  } catch (e) {
    res.status(400).send(e);
    console.log(e.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    // console.log(user);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Email or password may be wrong!" });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    console.log(req.user);

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

const avatar = multer({
  //dest property is removed to store the file in User model not in filesystem.
  // dest: "avatars",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, callback) {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("Please upload an image!"));
    }
    callback(undefined, true);
  }
});

router.post(
  "/me/avatar",
  auth,
  avatar.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize({
          width: 250,
          height: 250
        })
        .png()
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.send();
    } catch (e) {
      res.status(400).send(e);
      console.log(e);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
