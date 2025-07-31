const express = require("express");
const dotenv = require("dotenv");
const { notFound, errorHandler } = require("./Middlewares/errormiddlewares");
const connectDB = require("./Config/db");
const cors = require("cors");
const userRoutes = require("./Routes/userRoutes");
const receiptRoutes = require("./Routes/ReceiptRoutes");
const particularRoutes = require("./Routes/ParticularRoutes");

dotenv.config();

const app = express();

dotenv.config({ path: "./.env" });
connectDB();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://galfar-scm.onrender.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use("/users", userRoutes);
app.use("/receipts", receiptRoutes);
app.use("/particulars", particularRoutes);

app.get("/", (req, res) => res.send("API is running"));

app.use(notFound, errorHandler);

app.listen(5000, console.log("server started on port 5000"));
