import express from 'express'
// import dotenv from 'dotenv'
import { MongoClient, ObjectId} from 'mongodb'

const app = express()
const port = 3000
app.use(express.urlencoded({extended:true}))
app.use(express.json())

const client = new MongoClient('mongodb://localhost:27017/')
let db 

client.connect()
    .then(()=>{
        db = client.db('test')
        console.log('connected')
    }).catch(()=>{
        process.exit(1)
    })

class Tasks {
    constructor(title, description, author){
        this.title = title
        this.description = description
        this.author = author
        this.createdAt = new Date().toISOString()
        this.updatedAt = new Date().toISOString()
    }
}

app.post('/tasks', async(req, res)=>{
    try {
        const {title, description, author} = req.body
        if(!title || !description || !author){
            return res.send(`Title, description, author cannot be empty`)
        }

        const newTask = new Tasks(title, description, author)
        const result = await db.collection('tasks').insertOne(newTask)
        res.send(`Task Added! \nTaskId: ${result.insertedId}`)
    } catch (error) {
       return res.send(`Error. Try again`)
    }
})

app.get('/tasks', async(req, res)=>{
    try {
        const allTasks = await db.collection('tasks').find({}).toArray()
        res.send(allTasks)
    } catch (error) {
       return res.send(`Error. Try again`)
    }
})

app.get('/tasks/:id', async(req, res)=>{
    try {
        const {id} = req.params
        const objectId = new ObjectId(id)
        const task = await db.collection('tasks').findOne({_id:objectId})
        if(!task){
            return res.send('Task Not Found')
        }
        res.send(task)
    } catch (error) {
       return res.send(`Error. Try again`)
    }
})

app.delete('/tasks/:id', async(req, res)=>{
    try {
        const {id} = req.params
        const objectId = new ObjectId(id)
        const task = await db.collection('tasks').findOne({_id:objectId})
        if(!task){
            return res.send('Task Not Found')
        }

        await db.collection('tasks').deleteOne({_id: objectId})
        res.send(`Task Deleted! \n taskId: ${objectId}`)
    } catch (error) {
       return res.send(`Error. Try again`)
    }
})

app.put('/tasks/:id', async(req, res)=>{
    try {
        const {id} = req.params
        const {title, description, author} = req.body
        const objectId = new ObjectId(id)
        const task = await db.collection('tasks').findOne({_id:objectId})
       
        if(!task){
            return res.send('Task Not Found')
        }

        if(!title || !description || !author){
            return res.send(`Title, description, author cannot be empty`)
        }

        const updatedtask = {
            title, description, author,
            updatedAt: new Date().toISOString()
        }

        await db.collection('tasks').updateOne({_id:objectId}, {$set:updatedtask})
        res.send(`Task Updated! taskId:${objectId}`)
    } catch (error) {
       return res.send(`Error. Try again`)
    }
})

app.listen(port, ()=>{
    console.log('running')
})