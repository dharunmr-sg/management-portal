import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './database/database.js'; // Imports and initializes SQLite
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Load environment variables from .env
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  // Ensure the database connection is alive
  try {
    // A simple query to verify the db is responsive
    db.prepare('SELECT 1').get();
    
    res.json({
      success: true,
      message: "Express server and SQLite database are running"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
