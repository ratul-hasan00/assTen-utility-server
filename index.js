const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection URI
const uri = "mongodb+srv://simpleDB:BBt8131hyL7v8lJ5@cluster0.5cp4gli.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('simple crud is running');
});

async function run() {
    try {
        await client.connect();

        const db = client.db('smart_db');
        const billsCollections = db.collection('bills');
        const userCollections = db.collection('users');
        const paymentCollections = db.collection('paymentBills');

        // ----------------------- USERS RELATED -----------------------

        // Create user (manual + Google register)
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log("Received user:", newUser);

            // Check if user exists already
            const exists = await userCollections.findOne({ email: newUser.email });
            if (exists) {
                return res.send({ message: "User already exists" });
            }

            const result = await userCollections.insertOne(newUser);
            res.send(result);
        });

        // Update user profile (name, photo)
        app.patch('/users/:email', async (req, res) => {
            const email = req.params.email;
            const updatedUser = req.body;

            const filter = { email: email };
            const updateDoc = {
                $set: {
                    name: updatedUser.name,
                    photoURL: updatedUser.photoURL
                }
            };

            const result = await userCollections.updateOne(filter, updateDoc);
            res.send(result);
        });

        // ----------------------- BILLS CRUD -----------------------

        app.get('/bills', async (req, res) => {
            const category = req.query.category;
            let query = {};

            if (category && category !== "All") {
                query = { category: category };
            }

            const cursor = billsCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await billsCollections.findOne(query);
            res.send(result);
        });

        app.post('/bills', async (req, res) => {
            const newBill = req.body;
            const result = await billsCollections.insertOne(newBill);
            res.send(result);
        });

        // ----------------------- PAYMENT BILLS -----------------------

        // Get all payment bills
        app.get('/payment-bills', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) query = { email: email }; // fetch user-specific payments

            const result = await paymentCollections.find(query).toArray();
            res.send(result);
        });

        // Get payment by ID
        app.get('/payment-bills/:id', async (req, res) => {
            const id = req.params.id;
            const result = await paymentCollections.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // Create new payment
        app.post('/payment-bills', async (req, res) => {
            const newPayment = req.body;
            const result = await paymentCollections.insertOne(newPayment);
            res.send(result);
        });

        // Update payment by ID
        app.patch('/payment-bills/:id', async (req, res) => {
            const id = req.params.id;
            const updatedPayment = req.body;

            const result = await paymentCollections.updateOne(
                { _id: new ObjectId(id) },
                { $set: updatedPayment }
            );
            res.send(result);
        });

        // Delete payment by ID
        app.delete('/payment-bills/:id', async (req, res) => {
            const id = req.params.id;
            const result = await paymentCollections.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });


        // Successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. Connected to MongoDB!");

    } finally {
        // client.close();  // keep open
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`simple crud is running on port ${port}`);
});
