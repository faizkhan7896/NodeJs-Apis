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
const Post = require("./Modals/Post");
const Chat = require("./Modals/Chat");
const UserModal = require("./Modals/Users");
const KIDS = require("./Modals/Kids");
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
  console.log(id);

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

app.get("/images/:id", async (req, res) => {
  const imageId = req.params.id;

  try {
    // Find the image by ID
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    // Set the appropriate content type and send the image data
    res.set("Content-Type", image.contentType);
    res.send(image.image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/add_post", async (req, res) => {
  const { id, title, content } = req.query;
  console.log(id);
  // return

  if (!id || !title || !content) {
    return res
      .status(400)
      .json({ message: "Please provide id, title, and content." });
  }

  try {
    // Check if the user exists (replace 'User' with your actual user model)
    const userExists = await user_.findById(id);

    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    // Create a new post
    const newPost = new Post({
      id,
      title,
      content,
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json({ message: "Post added successfully", post: newPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getSingle_Post", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const All_UserPost = await Post.findById(id);
  console.log(All_UserPost);

  if (All_UserPost) {
    res.status(201).json(All_UserPost);
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/getUser_AllPost", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const All_UserPost = await Post.find({ id: id });
  const userData = await user_.findById(id);
  // console.log(userData);

  if (All_UserPost) {
    res.status(201).json({ Data: All_UserPost, userData: userData });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/send_message", async (req, res) => {
  const { sender, receiver, content } = req.query;
  console.log(req.query);
  // return
  try {
    // Check if sender and receiver users exist
    const senderUser = await user_.findById(sender);
    const receiverUser = await user_.findById(receiver);

    // console.log(senderUser);

    if (!senderUser || !receiverUser) {
      return res
        .status(404)
        .json({ message: "Sender or receiver user not found." });
    }

    // Create a new message
    const newMessage = new Chat({
      sender,
      receiver,
      content,
    });

    // Save the message to the database

    await newMessage.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", sentMessage: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// API endpoint to get chat messages for a specific pair of users
app.get("/get_chat/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  // console.log(req.params);

  try {
    // Retrieve chat messages from the database
    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 });

    const senderUser = messages.forEach((v) => {
      user_.findById(senderId);
    });

    res.status(200).json({ data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/send_otp", async (req, res) => {
  const { phone } = req.body;

  console.log(phone);

  try {
    // Check if the phone number already exists in the database
    const existingOTP = await UserModal.findOne({ phone });

    if (existingOTP) {
      return res.status(409).json({ message: "Phone number already exist." });
    }

    // Generate a new OTP (you may use a more secure OTP generation method)

    const user = await UserModal.create({ phone });

    // const newOTPValue = Math.floor(100000 + Math.random() * 900000).toString();

    // // Save the new OTP to the database
    // const newOTP = new OTP({
    //   phone,
    //   otp: newOTPValue,
    // });

    // await newOTP.save();

    res.status(201).json({ message: "OTP sent successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/verify_otp", async (req, res) => {
  const { phone, enteredOTP } = req.body;

  try {
    // Find the OTP entry for the provided phone number
    const otpEntry = await UserModal.findOne({ phone });

    if (!otpEntry) {
      return res
        .status(404)
        .json({ message: "OTP entry not found for this phone number." });
    }

    // Check if the entered OTP matches the stored OTP
    if (enteredOTP === otpEntry.otp) {
      // You can implement additional logic here for successful OTP verification
      // For simplicity, we'll just return a success message in this example
      return res.status(200).json({ message: "OTP verification successful." });
    } else {
      return res
        .status(401)
        .json({ message: "Incorrect OTP. Verification failed." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/update_details", async (req, res) => {
  const { userId, guardianName, alternatePhone, IdNumber } = req.body;

  // console.log(userId, guardianName, alternatePhone, IdNumber);

  if (!userId || (!guardianName && !alternatePhone && !IdNumber)) {
    res.status(400).json({
      message: "Invalid request. Please provide all details.",
    });
    return;
  }

  const user = await UserModal.findById(userId);

  if (guardianName) {
    user.guardianName = guardianName;
  }

  if (alternatePhone) {
    user.alternatePhone = alternatePhone;
  }

  if (IdNumber) {
    user.IdNumber = IdNumber;
  }

  user.save();

  if (user) {
    res
      .status(201)
      .json({ message: "Details Updated Successfully", userData: user });
  } else {
    res.status(401).json("Operation was failed");
  }
});

app.post("/add_Kid", async (req, res) => {
  const {userId, name, age, school, class_no, kid_Id } = req.body;

  try {
    if (!name || !age || !school || !class_no || !kid_Id || !userId) {
      res.status(401).json({ message: "please add All details" });
    }

    const kids = await KIDS.create({ userId, name, age, school, class_no, kid_Id });
    console.log("cdcdsc", kids);

    res.status(201).json({ message: "Kid Add successfully", kids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Set the server to listen on port 3000
const port = 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
