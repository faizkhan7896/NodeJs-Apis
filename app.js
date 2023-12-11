// Import the Express module
// Create an instance of the Express application
const express = require("express");
const { connectDB } = require("./db");
const user_ = require("./Modals/userModal");
const app = express();

connectDB();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const users = [];
const books = [
  { id: 1, title: "Node.js Basics", author: "John Doe" },
  { id: 2, title: "Express.js Guide", author: "Jane Smith" },
];

// Define a route that responds with "Hello, World!" when accessed
app.get("/HelloApi", (req, res) => {
  res.send("Hello, World!");
});

// Login route using a GET request (for educational purposes only)
app.get("/login", (req, res) => {
  const { username, password } = req.query;

  // Check if the provided username and password match any user in the database
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    res.status(200).json({ message: "Login successful", user: user });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Signup route using a GET request (for educational purposes only)
app.get("/signup", (req, res) => {
  const { username, password } = req.query;

  // Check if the username already exists
  const userExists = users.some((u) => u.username === username);

  if (userExists) {
    res.status(400).json({ message: "Username already exists" });
  } else {
    // Create a new user and add it to the database
    const newUser = { username, password };
    users.push(newUser);

    res.status(201).json({ message: "Signup successful", user: newUser });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("cdcs", req.body.name);

  // return;

  if (!name || !email || !password) {
    res.status(401).json({ message: "please add All details" });
  }

  const user = await user_.create({ name, email, password });
  console.log("cdcdsc", user);

  res.status(201).json({
    name: user.name,
    email: user.email,
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send("enter all field");
  }
  const userLogin = await user_.findOne({ email: email });

  if (userLogin) {
    res.status(201).json({
      _id: userLogin._id,
      name: userLogin.name,
      email: userLogin.email,
      // token: generateToken(userLogin._id),
    });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/get_profile", async (req, res) => {
  const { id } = req.query;
  
  const userLogin = await user_.findById(id);

  if (userLogin) {
    res.status(201).json({
      _id: userLogin._id,
      name: userLogin.name,
      email: userLogin.email,
      // token: generateToken(userLogin._id),
    });
  } else {
    res.status(401).json("invalid credentials");
  }
});

// Set the server to listen on port 3000
const port = 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
