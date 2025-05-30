import express from "express";
import { User } from "../models/user.js";
import { Note } from "../models/note.js";

export const userRouter = express.Router();

userRouter.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

userRouter.get("/users", async (req, res) => {
  const filter = req.query.username
    ? { username: req.query.username.toString() }
    : {};

  try {
    const users = await User.find(filter);

    if (users.length !== 0) {
      res.send(users);
    } else {
      res.status(404).send();
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

userRouter.patch("/users", async (req, res) => {
  if (!req.query.username) {
    res.status(400).send({
      error: "A username must be provided",
    });
  } else {
    const allowedUpdates = ["name", "username", "email", "age"];
    const actualUpdates = Object.keys(req.body);
    const isValidUpdate = actualUpdates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidUpdate) {
      res.status(400).send({
        error: "Update is not permitted",
      });
    } else {
      try {
        const user = await User.findOneAndUpdate(
          {
            username: req.query.username.toString(),
          },
          req.body,
          {
            new: true,
            runValidators: true,
          },
        );

        if (user) {
          res.send(user);
        } else {
          res.status(404).send();
        }
      } catch (error) {
        res.status(500).send(error);
      }
    }
  }
});

userRouter.delete("/users", async (req, res) => {
  if (!req.query.username) {
    res.status(400).send({
      error: "A username must be provided",
    });
  } else {
    try {
      const user = await User.findOne({
        username: req.query.username.toString(),
      });

      if (!user) {
        res.status(404).send();
      } else {
        const result = await Note.deleteMany({ owner: user._id });

        if (!result.acknowledged) {
          res.status(500).send();
        } else {
          await User.findByIdAndDelete(user._id);
          res.send(user);
        }
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
});
