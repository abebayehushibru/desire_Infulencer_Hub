require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const allRoutes = require("./routes/allRoutes");


const { connectDB, sequelize } = require("./config/database");
const { createDefaultAdmin } = require("./config/defaultAdmin");

const app = express();

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}));
app.use(helmet());
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
"/api/v1/",
allRoutes
);

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    // process.exit(1); // Optional: Stop server if DB sync fails
  }
  
  await createDefaultAdmin();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();