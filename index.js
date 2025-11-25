const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// -------------------- MongoDB Connection --------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5cp4gli.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

let db;

// prevent multiple connections in vercel
async function connectDB() {
    if (!db) {
        await client.connect();
        db = client.db('smart_db');
        console.log("Connected to MongoDB on Vercel");
    }
    return db;
}

// -------------------- Default Route --------------------
app.get('/', (req, res) => {
    res.send('Utility Bill Management server running on Vercel');
});

// -------------------- Main Run Function --------------------
async function run() {
    const database = await connectDB();
    const billsCollections = database.collection('bills');
    const userCollections = database.collection('users');
    const paymentCollections = database.collection('paymentBills');

    // -------------------- Users --------------------
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const exists = await userCollections.findOne({ email: newUser.email });
        if (exists) {
            return res.send({ message: "User already exists" });
        }
        const result = await userCollections.insertOne(newUser);
        res.send(result);
    });

    app.patch('/users/:email', async (req, res) => {
        const email = req.params.email;
        const updatedUser = req.body;
        const result = await userCollections.updateOne(
            { email },
            { $set: updatedUser }
        );
        res.send(result);
    });

    // -------------------- Bills --------------------
    app.get('/bills', async (req, res) => {
        const category = req.query.category;
        let query = {};

        if (category && category !== "All") {
            query = { category };
        }

        const result = await billsCollections.find(query).toArray();
        res.send(result);
    });

    app.get('/bills/:id', async (req, res) => {
        const id = req.params.id;
        const result = await billsCollections.findOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    app.post('/bills', async (req, res) => {
        const result = await billsCollections.insertOne(req.body);
        res.send(result);
    });

    // -------------------- Payment Bills --------------------
    app.get('/payment-bills', async (req, res) => {
        const email = req.query.email;
        const query = email ? { email } : {};
        const result = await paymentCollections.find(query).toArray();
        res.send(result);
    });

    app.get('/payment-bills/:id', async (req, res) => {
        const id = req.params.id;
        const result = await paymentCollections.findOne({ _id: new ObjectId(id) });
        res.send(result);
    });

    app.post('/payment-bills', async (req, res) => {
        const result = await paymentCollections.insertOne(req.body);
        res.send(result);
    });

    app.patch('/payment-bills/:id', async (req, res) => {
        const id = req.params.id;
        const result = await paymentCollections.updateOne(
            { _id: new ObjectId(id) },
            { $set: req.body }
        );
        res.send(result);
    });

    app.delete('/payment-bills/:id', async (req, res) => {
        const id = req.params.id;
        const result = await paymentCollections.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
    });
}

run().catch(console.dir);

// -------------------- Listen --------------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
