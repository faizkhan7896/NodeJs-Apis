// Import the Express module
// Create an instance of the Express application
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");

const { connectDB } = require("./db");
const user_ = require("./Modals/userModal");
const contact = require("./Modals/contact");
const { default: mongoose } = require("mongoose");
const Image = require("./Modals/images");
const app = express();

connectDB();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up multer for handling file uploads ---------- FOR IMAGE UPLOAD
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse JSON requests
app.use(bodyParser.json());
// Set up multer for handling file uploads ---------- FOR IMAGE UPLOAD

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
app.get("/login_local_db", (req, res) => {
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
app.get("/signup_local_db", (req, res) => {
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

app.post("/update_profile", async (req, res) => {
  const { name, email, password } = req.body;
  const userId = req.body.id; // Assuming you pass the userId for the user you want to update

  if (!userId || (!name && !email && !password)) {
    res.status(400).json({
      message:
        "Invalid request. Please provide userId and at least one field to update.",
    });
    return;
  }

  const user = await user_.findById(userId);

  if (name) {
    user.name = name;
  }

  if (email) {
    user.email = email;
  }

  if (password) {
    user.password = password;
  }

  user.save();

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // token: generateToken(userLogin._id),
    });
  } else {
    res.status(401).json("Operation was failed");
  }
});

app.delete("/delete_account", async (req, res) => {
  const { id } = req.query;

  const deletedUser = await user_.findByIdAndDelete(id);

  if (deletedUser) {
    res.status(201).json(deletedUser);
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.post("/contact_us", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Please provide name, email, and message." });
  }

  const contact_ = await contact.create({ name, email, message });
  console.log("cdcdsc", contact_);

  res.status(201).json({
    name: contact_.name,
    email: contact_.email,
    email: contact_.message,
  });
});

app.post("/upload_image", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an image." });
  }

  // Access the uploaded image data
  const { originalname, buffer, mimetype } = req.file;

  // Save the image data to the database
  const newImage = new Image({
    filename: originalname,
    contentType: mimetype,
    image: buffer,
  });

  await newImage.save();

  res
    .status(200)
    .json({ message: "Image uploaded successfully", image: newImage });
});

app.get('/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    // Find the image by ID
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    // Set the appropriate content type and send the image data
    res.set('Content-Type', image.contentType);
    res.send(image.image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Set the server to listen on port 3000
const port = 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
