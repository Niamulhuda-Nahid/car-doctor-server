const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0puja.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db("carDoctor").collection("services");
    const orderCollection = client.db("carDoctor").collection("orders");


    app.get('/services', async(req, res)=>{
        const result = await serviceCollection.find().toArray();
        res.send(result);
    })

    app.get('/services/:id', async(req,res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await serviceCollection.findOne(query);
        res.send(result)
    })

    
    // orders

    app.get('/orders', async(req, res) => {
      // console.log(req.query.email);
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await orderCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/orders', async(req, res)=>{
        const newOrder = req.body;
        const result = await orderCollection.insertOne(newOrder);
        res.send(result);
    })

    app.patch('/orders/:id', async(req, res)=>{
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id : new ObjectId(id)}
      const updateDoc = {
        $set: {
          status: updateOrder.status
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc)
      res.send(result);
    })

    app.delete('/orders/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id : new ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Car doctor server running')
});

app.listen(port, ()=>{
    console.log(`Car server running on PORT: ${port}`);
});