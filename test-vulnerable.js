// 🚨 VULNERABLE TEST FILE
const express = require('express');
const app = express();

// 🚨 CRITICAL: Hardcoded API keys
const API_KEY = "sk-proj-1234567890abcdefghijklmnopqrstuvwxyz";
const DATABASE_PASSWORD = "super_secret_password_123!";

// 🚨 CRITICAL: SQL Injection vulnerability
app.post('/api/users', (req, res) => {
    const userData = req.body;
    const query = `INSERT INTO users (name, email, password) VALUES ('${userData.name}', '${userData.email}', '${userData.password}')`;
    res.json({ success: true });
});

// 🚨 CRITICAL: No authentication
app.get('/api/admin/users', (req, res) => {
    res.json({ users: getAllUsers() });
});

// 🚨 CRITICAL: Command injection
app.get('/api/system', (req, res) => {
    const command = req.query.cmd;
    const { exec } = require('child_process');
    exec(command, (error, stdout, stderr) => {
        res.json({ output: stdout, error: stderr });
    });
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

module.exports = app;
