require("dotenv").config({ path: require("path").join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const seedPartners = require("./utils/seedPartners");

const app = express();

app.use(cors());
app.use(express.json());

connectDB().then(seedPartners);

app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/match", require("./routes/match"));
app.use("/api/partners", require("./routes/partners"));
app.use("/api/notifications", require("./routes/notifications"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
