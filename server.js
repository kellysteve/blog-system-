const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// In-memory storage (in production, use a database)
let blogs = [];
let users = [
  {
    id: 1,
    username: 'password', // As requested
    password: '$2a$10$rOzZcB0ba0Wp0Yvq5nZfE.FfQJ7n6b8Xq7kZz5rY9cKv1m2n3b4C' // Hashed "username"
  }
];

// Helper functions for file storage
const saveBlogsToFile = () => {
  fs.writeFileSync('blogs.json', JSON.stringify(blogs, null, 2));
};

const loadBlogsFromFile = () => {
  try {
    const data = fs.readFileSync('blogs.json', 'utf8');
    blogs = JSON.parse(data);
  } catch (error) {
    blogs = [];
  }
};

// Load blogs on server start
loadBlogsFromFile();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if the credentials match the requested ones
  if (username === 'password' && password === 'username') {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get all blogs
app.get('/api/blogs', (req, res) => {
  res.json({ success: true, blogs });
});

// Create a new blog (admin only)
app.post('/api/blogs', authenticateToken, (req, res) => {
  const { title, content } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required' });
  }
  
  const newBlog = {
    id: Date.now(),
    title,
    content,
    date: new Date().toISOString()
  };
  
  blogs.push(newBlog);
  saveBlogsToFile();
  
  res.json({ success: true, blog: newBlog });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
