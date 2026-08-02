require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const allRoutes = require("./routes/allRoutes");


const { connectDB, sequelize } = require("./config/database");
const { createDefaultAdmin } = require("./config/defaultAdmin");

const app = express();
app.use((req, res, next) => {
  console.log("Origin:", req.headers.origin);
  next();
});
app.use(cors({
origin: true,// origin:"['http://localhost:5173', 'https://press-overlord-retrieval.ngrok-free.dev']",
  credentials:true
}));
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Influencer Hub API Running",
  });
});
app.use(
  "/api/v1/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

app.use(
"/api/v1/",
allRoutes
);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  try {
    //  await sequelize.sync({ force: true });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    // process.exit(1); // Optional: Stop server if DB sync fails
  }
  
  await createDefaultAdmin();
  
  app.listen(PORT,"0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();