const mongoose = require("mongoose");
const dbConfig =
  "mongodb+srv://alfaiz:sx30iiXywyb7ZiCR@cluster.5ap6v7o.mongodb.net/FirstNode_Project?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    mongoose.connect(dbConfig);
    console.log('success');
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectDB };
