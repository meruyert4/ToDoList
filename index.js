import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import path from 'path';

const app = express();
const port = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = new MongoClient('mongodb://localhost:27017/');
let db;

client.connect()
    .then(() => {
        db = client.db('test');
        console.log('Connected to database');
    })
    .catch(() => {
        process.exit(1);
    });

class Tasks {
    constructor(title, description, author) {
        this.title = title;
        this.description = description;
        this.author = author;
        this.createdAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/tasks', async (req, res) => {
    try {
        const { title, description, author } = req.body;
        if (!title || !description || !author) {
            return res.status(400).send('Title, description, and author cannot be empty');
        }

        const newTask = new Tasks(title, description, author);
        const result = await db.collection('tasks').insertOne(newTask);
        res.json({ message: 'Task Added!', taskId: result.insertedId });
    } catch (error) {
        res.status(500).send('Error. Try again');
    }
});

app.get('/tasks', async (req, res) => {
    try {
        const allTasks = await db.collection('tasks').find({}).toArray();
        res.json(allTasks);
    } catch (error) {
        res.status(500).send('Error. Try again');
    }
});

app.get('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new ObjectId(id);
        const task = await db.collection('tasks').findOne({ _id: objectId });
        if (!task) {
            return res.status(404).send('Task Not Found');
        }
        res.json(task);
    } catch (error) {
        res.status(500).send('Error. Try again');
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const objectId = new ObjectId(id);
        const task = await db.collection('tasks').findOne({ _id: objectId });
        if (!task) {
            return res.status(404).send('Task Not Found');
        }

        await db.collection('tasks').deleteOne({ _id: objectId });
        res.json({ message: 'Task Deleted!', taskId: objectId });
    } catch (error) {
        res.status(500).send('Error. Try again');
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, author } = req.body;
        const objectId = new ObjectId(id);
        const task = await db.collection('tasks').findOne({ _id: objectId });
        if (!task) {
            return res.status(404).send('Task Not Found');
        }

        if (!title || !description || !author) {
            return res.status(400).send('Title, description, and author cannot be empty');
        }

        const updatedTask = {
            title,
            description,
            author,
            updatedAt: new Date().toISOString()
        };

        await db.collection('tasks').updateOne({ _id: objectId }, { $set: updatedTask });
        res.json({ message: 'Task Updated!', taskId: objectId });
    } catch (error) {
        res.status(500).send('Error. Try again');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
