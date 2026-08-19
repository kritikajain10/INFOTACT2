const cors = require("cors");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

const app = express();
app.use(cors());

app.use(express.json());

const documentRoutes = require("./routes/documentRoutes");

app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});