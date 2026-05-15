import express from "express";
import { prisma } from './lib/prisma.js';
import { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req :Request, res : Response) => {
  res.send("ALUMNET Backend Running");
});

app.post("/create-user", async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Shifat",
        email: "shifat@example.com",
      },
    });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error creating user",
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json(users);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error fetching users",
    });
  }
});

app.listen(process.env.PORT || 3123, () => {
  console.log("Server running on port " + (process.env.PORT || 3123));
});