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
const Cars_ = require("./Modals/Cars");
const app = express();
const path = require("path");
const Guardian = require("./Modals/Guardians");
const Orders_ = require("./Modals/Orders");
const cron = require("node-cron");

connectDB();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set up multer for handling file uploads ---------- FOR IMAGE UPLOAD

// Custom folder path for uploads (Desktop/Uploads)
const customFolderPath = path.join(__dirname, "Uploads");

// Set up multer for handling file uploads with custom folder path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, customFolderPath);
  },
  filename: (req, file, cb) => {
    // You can customize the filename if needed
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to parse JSON requests
app.use(bodyParser.json());
// Set up multer for handling file uploads ---------- FOR IMAGE UPLOAD

const users = [];
const books = [
  { id: 1, title: "Node.js Basics", author: "John Doe" },
  { id: 2, title: "Express.js Guide", author: "Jane Smith" },
];

var NamazData = [];

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
      // return res.status(409).json({ message: "Phone number already exist." });
      res
        .status(201)
        .json({ existingOTP, message: "OTP sent successfully", status: 200 });
      return;
    }

    const user = await UserModal.create({ phone });

    res
      .status(201)
      .json({ user, message: "OTP sent successfully", status: 200 });
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
      return res.status(200).json({
        userData: otpEntry,
        message: "OTP verification successful.",
        status: 200,
      });
    } else {
      return res
        .status(401)
        .json({ message: "Incorrect OTP, Verification failed." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/verify_alternate_otp", async (req, res) => {
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
    res.status(201).json({
      userData: user,
      message: "Details Updated Successfully",
      status: 200,
    });
  } else {
    res.status(401).json("Operation was failed");
  }
});

app.post("/add_Kid", upload.single("image"), async (req, res) => {
  const { userId, name, age, school, class_no, kid_Id } = req.body;
  // console.log("req.file", JSON.stringify(req.body));

  try {
    if (!name || !age || !school || !class_no || !kid_Id || !userId) {
      res.status(401).json({ message: "please add All details" });
    }

    // return;
    // const { originalname, buffer, mimetype } = req.file;

    // Save the image data to the database
    // const image_ = new Image({
    //   filename: originalname,
    //   contentType: mimetype,
    //   image: buffer,
    // });

    const kids = await KIDS.create({
      userId,
      name,
      age,
      school,
      class_no,
      kid_Id,
    });

    res
      .status(201)
      .json({ message: "Kid Add successfully", status: 200, kids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getAllKid_byId", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await KIDS.find({ userId: id });
  const userData = await user_.findById(id);
  // console.log(userData);
  if (kids) {
    res.status(201).json({
      Data: kids,
      userData: userData,
      message: "Successfully",
      status: 200,
    });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/getSingleKid", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await KIDS.find({ _id: id });

  console.log("_________", kids);

  if (kids?.length != 0) {
    res.status(201).json({
      Data: kids[0],
      status: 200,
    });
  } else if (kids?.length == 0) {
    res.status(404).json({ message: "Data Not Found", status: 404 });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.delete("/delete_kid", async (req, res) => {
  const { id } = req.query;

  const deletedKid = await KIDS.findByIdAndDelete(id);

  if (deletedKid) {
    res.status(201).json({
      data: deletedKid,
      message: "Kid Deleted Successfully",
      status: 200,
    });
  } else {
    res.status(401).json("invalid ID");
  }
});

app.post("/add_Car_image", upload.single("image"), async (req, res) => {
  const { userId, car_name, plate_number, car_color } = req.body;

  try {
    if (!car_name || !plate_number || !car_color || !userId) {
      res.status(401).json({ message: "please add All details" });
    }

    const { originalname, buffer, mimetype } = req.file;

    // Save the image data to the database
    const image_ = new Image({
      filename: originalname,
      contentType: mimetype,
      image: buffer,
    });

    const Cars = await Cars_.create({
      userId,
      car_name,
      plate_number,
      car_color,
      image_,
    });
    console.log("cdcdsc", Cars);

    res
      .status(201)
      .json({ data: Cars, message: "Car Add successfully", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/add_Car", upload.single("image"), async (req, res) => {
  const { userId, car_name, plate_number, car_color } = req.body;

  try {
    if (!car_name || !plate_number || !car_color || !userId) {
      res.status(401).json({ message: "please add All details" });
    }

    const Cars = await Cars_.create({
      userId,
      car_name,
      plate_number,
      car_color,
    });
    console.log("cdcdsc", Cars);

    res
      .status(201)
      .json({ data: Cars, message: "Car Add successfully", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getAll_Cars_byId", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await Cars_.find({ userId: id });
  // const userData = await user_.findById(kids[0]?.userId);

  // console.log(kids?.Data[0]);

  if (kids) {
    res.status(201).json({
      Data: kids,
      // userData: userData,
      message: "Successfully",
      status: 200,
      // id:kids[0]?.userId
    });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/getSingleCar", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await Cars_.find({ _id: id });

  console.log("_________", kids);

  if (kids?.length != 0) {
    res.status(201).json({
      Data: kids[0],
      status: 200,
    });
  } else if (kids?.length == 0) {
    res.status(404).json({ message: "Data Not Found", status: 404 });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.delete("/delete_Car", async (req, res) => {
  const { id } = req.query;

  const deletedKid = await Cars_.findByIdAndDelete(id);

  if (deletedKid) {
    res.status(201).json({
      data: deletedKid,
      message: "Kid Deleted Successfully",
      status: 200,
    });
  } else {
    res.status(401).json("invalid ID");
  }
});

app.post("/add_Guardian", upload.single("image"), async (req, res) => {
  const { userId, full_name, gender, phone_number, relation, alternate_phone } =
    req.body;

  try {
    if (
      !userId ||
      !full_name ||
      !gender ||
      !phone_number ||
      !relation ||
      !alternate_phone
    ) {
      res.status(401).json({ message: "please add All details" });
    }

    // const { originalname, buffer, mimetype } = req.file;

    // Save the image data to the database
    // const image_ = new Image({
    //   filename: originalname,
    //   contentType: mimetype,
    //   image: buffer,
    // });

    const guardians = await Guardian.create({
      userId,
      full_name,
      gender,
      phone_number,
      relation,
      alternate_phone,
      // image_,
    });
    console.log("cdcdsc", guardians);

    res.status(201).json({
      data: guardians,
      message: "Guardian Add successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/getAll_Guardian_byId", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await Guardian.find({ userId: id });
  // const userData = await user_.findById(kids[0]?.userId);

  // console.log(kids?.Data[0]);

  if (kids) {
    res.status(201).json({
      Data: kids,
      // userData: userData,
      message: "Successfully",
      status: 200,
      // id:kids[0]?.userId
    });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/getSingleGuardian", async (req, res) => {
  const { id } = req.query;
  // const id = "6576d6e8a6534c4da10064cb";
  console.log(id);

  const kids = await Guardian.find({ _id: id });

  console.log("_________", kids);

  if (kids?.length != 0) {
    res.status(201).json({
      Data: kids[0],
      status: 200,
    });
  } else if (kids?.length == 0) {
    res.status(404).json({ message: "Data Not Found", status: 404 });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.delete("/delete_Guardian", async (req, res) => {
  const { id } = req.query;

  const deletedKid = await Guardian.findByIdAndDelete(id);

  if (deletedKid) {
    res.status(201).json({
      data: deletedKid,
      message: "Kid Deleted Successfully",
      status: 200,
    });
  } else {
    res.status(401).json("invalid ID");
  }
});

app.post("/create_Order", async (req, res) => {
  try {
    const { user_id, kid_id, car_id, guardian_id, lat, lng, order_type } =
      req.body;

    const User = await UserModal.findById(user_id);
    const Kid = await KIDS.findById(kid_id);
    const Car = await Cars_.findById(car_id);
    const Guardian_ = await Guardian.findById(guardian_id);
    const order = await Orders_.create({
      user_id,
      kid_id,
      car_id,
      guardian_id,
      lat,
      lng,
      order_type,
    });

    res.status(201).json({
      data: {
        orderData: order,
        userData: User,
        guardianData: Guardian_,
        kidData: Kid,
        carData: Car,
      },
      message: "Order Created Successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/get_Order_by_Type", async (req, res) => {
  try {
    const { user_id, order_status } = req.body;

    const order = await Orders_.find({
      user_id: user_id,
      order_status: order_status,
    });

    // const KidArray = order.forEach((element) => {
    //   KIDS.find(element?.kid_id);
    // });
    // const Guardian_ = await Guardian.findById(order?.guardian_id);

    res.status(201).json({
      data: order,
      // kidData: KidArray,
      // guardianData: Guardian_,
      message: "Order Data",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get_Active_Order", async (req, res) => {
  try {
    const orders = await Orders_.find({ order_status: "ACTIVE" });

    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const kidDetails = await KIDS.findById(order?.kid_id);
        const guardianDetails = await Guardian.findById(order?.guardian_id);
        const carDetails = await Cars_.findById(order?.car_id);

        return {
          ...order._doc,
          kid: kidDetails,
          guardian: guardianDetails,
          car: carDetails,
        };
      })
    );

    res.status(201).json({
      data: ordersWithDetails,
      message: "All Active Orders",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/accept_reject_Order", async (req, res) => {
  try {
    const { user_id, order_id, order_status } = req.body;

    const order = await Orders_.findById(order_id);

    if (user_id) {
      order.carrier_id = user_id;
    }
    if (order_status) {
      order.order_status = order_status;
    }
    order.save();

    res.status(201).json({
      orderData: order,
      message: "Order Updated Successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/update_Order", async (req, res) => {
  try {
    const { user_id, order_id, order_tracking } = req.body;

    const order = await Orders_.findById(order_id);

    if (user_id) {
      order.carrier_id = user_id;
    }
    if (order_tracking) {
      order.order_tracking = order_tracking;
    }
    order.save();

    res.status(201).json({
      orderData: order,
      message: "Order Updated Successfully",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/get_Order", async (req, res) => {
  try {
    const { id } = req.query;

    const order = await Orders_.findById(id);

    const User = await UserModal.findById(order?.user_id);
    const Kid = await KIDS.findById(order?.kid_id);
    const Car = await Cars_.findById(order?.car_id);
    const Guardian_ = await Guardian.findById(order?.guardian_id);

    res.status(201).json({
      data: {
        orderData: order,
        userData: User,
        guardianData: Guardian_,
        kidData: Kid,
        carData: Car,
      },
      message: "Order Details",
      status: 200,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// CARRIER APP API"S STARTED ROM THIS LINE

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("cdcs", req.body.name);

    // return;

    if (!name || !email || !password) {
      res.status(401).json({ message: "please add All details", status: 400 });
    }

    const existingOTP = await user_.findOne({ email });

    if (existingOTP) {
      return res.status(409).json({ message: "Email already exist." });
    }

    const user = await user_.create({ name, email, password });
    console.log("cdcdsc", user);

    res
      .status(201)
      .json({ user, message: "resgiter successfully", status: 200 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send("enter all field");
  }
  const userLogin = await user_.findOne({ email: email });

  if (userLogin) {
    res
      .status(201)
      .json({ userLogin, message: "login successfully", status: 200 });
  } else {
    res.status(401).json("invalid credentials");
  }
});

app.get("/get_profile", async (req, res) => {
  const { id } = req.query;
  console.log(id);

  const userLogin = await user_.findById(id);

  if (userLogin) {
    res
      .status(201)
      .json({ userLogin, message: "data get successfully", status: 200 });
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
    res
      .status(201)
      .json({ user, message: "data get successfully", status: 200 });
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

// Set the server to listen on port 3000
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
