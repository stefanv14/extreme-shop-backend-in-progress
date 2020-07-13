import express from "express";
import User from "../models/userModel";
import { getToken, isAuth } from "../util";
const router = express.Router();

router.post("/signin", async (req, res) => {
  console.log(req.body);
  const signinUser = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (signinUser) {
    res.send({
      _id: signinUser.id,
      firstName: signinUser.firstName,
      email: signinUser.email,
      isAdmin: signinUser.isAdmin,
      password: signinUser.password,
      token: getToken(signinUser),
    });
  } else {
    res.status(401).send({ msg: "Invalid email for password" });
  }
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      JMBG: req.body.JMBG,
      password: req.body.password,
    });

    const newUser = await user.save();
    if (newUser) {
      res.send({
        _id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        JMBG: newUser.JMBG,
        isAdmin: newUser.isAdmin,
        token: getToken(newUser),
      });
    }
  } catch (error) {
    res.status(401).send({ msg: "Invalid User data." });
  }
});

router.get("/createadmin", async (req, res) => {
  try {
    const user = new User({
      name: "Stefan",
      email: "vasilijevic032@gmail.com",
      password: "1234",
      isAdmin: true,
    });
    const newUser = await user.save();
    res.send(newUser);
  } catch (error) {
    res.send(error.message);
  }
});

router.put("/:id", isAuth, async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (user) {
    user.firstName = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;
    const updatedUser = await user.save();
    res.send({
      _id: updatedUser.id,
      name: updatedUser.firstName,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      password: updatedUser.password,
      token: getToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});

export default router;
