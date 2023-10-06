const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { PrismaClient } = require("@prisma/client");
const { v4: uuidV4 } = require("uuid");

const prisma = new PrismaClient();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(404).json({ message: "Please fill all the details" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(403).json({ message: "User already exists" });
    }

    const uuid = uuidV4();

    const user = await prisma.user.create({
      data: {
        uuid,
        name,
        email,
      },
    });

    return res.status(200).json({ message: "Successful user sign-up.", user });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/create-post", async (req, res) => {
  try {
    const { data, userId } = req.body;
    const { title, content } = data;

    console.log({ title, content, userId });

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised" });
    }

    if (!title || !content) {
      return res.status(404).json({ message: "Please fill all the details" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        userId,
      },
    });

    return res.status(200).json({ message: "Successfully created.", post });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "Server Error" });
  }
});

app.delete("/api/delete-post", async (req, res) => {
  try {
    const postId = req.headers.postid;

    if (!postId) {
      return res.status(404).json({ message: "Post Id not found" });
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return res.json({ message: "Successfull post deletion." });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/get-posts", async (req, res) => {
  try {
    const userId = req.headers.userid;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised" });
    }

    const posts = await prisma.post.findMany({
      where: {
        userId,
      },
    });

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(500).json({ error: "Server Error" });
  }
});

app.listen(8000, () => {
  console.log("Server started on port 8000.");
});
