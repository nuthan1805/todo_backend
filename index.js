const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
 
const app = express();
const port = 3000;
 
const supabaseUrl = 'https://xhegtiebgfqoinzdhsvr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZWd0aWViZ2Zxb2luemRoc3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2NjU3OTIsImV4cCI6MjAzMTI0MTc5Mn0.P0IvuDsM8Wp0VGW8Oe2W97alkm7pwnJHdrfTJlcfZCE';
const supabase = createClient(supabaseUrl, supabaseKey);
 
app.use(cors());
app.use(bodyParser.json());
app.options('*', cors());
 
// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const { data: emailData, error: emailError } = await supabase
            .from('todousers')
            .select('email')
            .eq('email', email);
 
        if (emailError) throw emailError;
        if (emailData.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
 
        const { data: usernameData, error: usernameError } = await supabase
            .from('todousers')
            .select('username')
            .eq('username', username);
 
        if (usernameError) throw usernameError;
        if (usernameData.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
 
        const { error: insertError } = await supabase
            .from('todousers')
            .insert([{ username, email, password: hashedPassword, login_status: 0 }]);
 
        if (insertError) {
            throw insertError;
        }
 
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
 
// Login a user
app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
      const { data, error } = await supabase
          .from('todousers')
          .select('*')
          .or(`email.eq.${identifier},username.eq.${identifier}`);
 
      if (error) throw error;
      if (data.length === 0) {
          return res.status(400).json({ message: 'Invalid email/username or password' });
      }
 
      const user = data[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
 
      if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid email/username or password' });
      }
 
      res.status(200).json({ message: 'Login successful',data, username: user.identifier });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
 
 
// GET all todos
app.get('/api/todos', async (req, res) => {
    const { username } = req.query;
    try {
        const { data, error } = await supabase
            .from('todos')
            .select('*')
            .eq('created_by', username);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// POST new todo
app.post('/api/todos', async (req, res) => {
    const { title, due_date, priority, category_id, created_by } = req.body;
    try {
        const { data, error } = await supabase
            .from('todos')
            .insert([{ title, due_date, priority, category_id, created_by }])
            .single();
        if (error) throw error;
        res.status(201).json({ success: true, data, message: 'Todo created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// UPDATE a todo
app.put('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, due_date, priority, category_id, completed } = req.body;
        const { data, error } = await supabase
            .from('todos')
            .update({ title, due_date, priority, category_id, completed })
            .eq('id', id)
            .single();
        if (error) throw error;
        res.status(200).json({ success: true, data, message: 'Todo updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// DELETE a todo
app.delete('/api/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) throw error;
        res.status(204).json({ success: true, message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// GET all categories
app.get('/api/categories', async (req, res) => {
    const { username } = req.query;
 
    try {
        const { data, error } = await supabase.from('categories').select('*').eq('created_by', username);
        if (error) throw error;
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// POST new category
app.post('/api/categories', async (req, res) => {
    const { name, created_by } = req.body;
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{ name, created_by }])
            .single();
        if (error) throw error;
        res.status(201).json({ success: true, data, message: 'Category created successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// DELETE a category
app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        res.status(204).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
