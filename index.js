const express = require('express');

const bodyParser = require('body-parser');

const cors = require('cors');

const { createClient } = require('@supabase/supabase-js');
 
const app = express();

const port = 5000;
 
const supabaseUrl = 'https://xhegtiebgfqoinzdhsvr.supabase.co';

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZWd0aWViZ2Zxb2luemRoc3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2NjU3OTIsImV4cCI6MjAzMTI0MTc5Mn0.P0IvuDsM8Wp0VGW8Oe2W97alkm7pwnJHdrfTJlcfZCE';

const supabase = createClient(supabaseUrl, supabaseKey);
 
app.use(cors());

app.use(bodyParser.json());
 
// GET all todos

app.get('/api/todos', async (req, res) => {

    try {

        const { data, error } = await supabase.from('todos').select('*');

        if (error) throw error;

        res.status(200).json({ success: true, data });

    } catch (error) {

        res.status(500).json({ success: false, error: error.message });

    }

});
 
// POST new todo

app.post('/api/todos', async (req, res) => {

    try {

        const { title, due_date, priority, category_id } = req.body;

        const { data, error } = await supabase

            .from('todos')

            .insert([{ title, due_date, priority, category_id }])

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

    try {

        const { data, error } = await supabase.from('categories').select('*');

        if (error) throw error;

        res.status(200).json({ success: true, data });

    } catch (error) {

        res.status(500).json({ success: false, error: error.message });

    }

});
 
// POST new category

app.post('/api/categories', async (req, res) => {

    try {

        const { name, color } = req.body;

        const { data, error } = await supabase

            .from('categories')

            .insert([{ name, color }])

            .single();

        if (error) throw error;

        res.status(201).json({ success: true, data, message: 'Category created successfully' });

    } catch (error) {

        res.status(500).json({ success: false, error: error.message });

    }

});
 
app.listen(port, () => {

    console.log(`Server running on port ${port}`);

});
 
