const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e3jxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('college');
        const studentsCollection = database.collection('students');

        // GET API
        app.get('/students', async (req, res) => {
            const cursor = studentsCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let students = [];
            const count = await cursor.count();
            if (page) {
                students = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                students = await cursor.toArray();
            }
            res.send({
                count,
                students
            });
        })
        app.get('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const student = await studentsCollection.findOne(query);
            res.send(student);
        })
        // POST API
        app.post('/students', async (req, res) => {
            const newStudent = req.body;
            const result = await studentsCollection.insertOne(newStudent);
            res.json(result);
        })
        // UPDATE API
        app.put('/students/:id', async (req, res) => {
            const id = req.params.id;
            const updateStudent = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    name: updateStudent.name,
                    email: updateStudent.email
                },
            }
            const result = await studentsCollection.updateOne(filter, updateDoc, options);
            console.log(result);
            res.json(result);
        })
        // DELETE API
        app.delete('/students/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await studentsCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('This is home');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})