const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

// middleWare 

app.use(cors());
app.use(express.json());

// BBt8131hyL7v8lJ5 
// simpleDB 
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
})

async function run() {
    try {
        await client.connect();

        const db = client.db('smart_db')
        const billsCollections = db.collection('bills');

        app.get('/bills', async (req,res)=>{
            const cursor = billsCollections.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/bills/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await billsCollections.findOne(query);
            res.send(result);
        })

        app.post('/bills', async (req, res) => {
            const newBill = req.body;
            const result = await billsCollections.insertOne(newBill);
            res.send(result);
        })

        app.patch('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBills = req.body;
            const query = { _id: new ObjectId(id) }
            const update= {
                $set:{
                    name: updatedBills.name,
                    price: updatedBills.price
                }
            }
            const result = await billsCollections.updateOne(query,update)
            res.send(result);
        })

        app.delete('/bills/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await billsCollections.deleteOne(query);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir)

app.listen(port, () => {
    console.log(`simple crud is running ${port}`);
})