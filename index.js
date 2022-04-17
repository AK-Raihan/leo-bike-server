const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();


const port = process.env.PORT || 5000;

// middlewere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9idnw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        console.log('database connected')
        const database = client.db('leo-bike');
        const productsCollection = database.collection('products');
        const AddCollection = database.collection('Addproduct');
        const cycleCollection = database.collection('cycle');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');

        // product post api
        app.post('/product', async (req, res) => {
          const productDetails = req.body;
          const result = await productsCollection.insertOne(productDetails);
          res.send(result);
        })

        // get product api
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });
        // get food api
        app.get('/cycle', async (req, res) => {
            const cursor = cycleCollection.find({});
            const cycle = await cursor.toArray();
            res.send(cycle);
        });

        // single product get api
        app.get("/singleCycle/:id", async (req, res) => {
            const result = await productsCollection.find({ _id: ObjectId(req.params.id)}).toArray();
            res.send(result[0]);
           });

           // cofirm order post
        app.post("/confirmOrder", async (req, res) => {
            console.log(req.body);
            const result = await ordersCollection.insertOne(req.body);
            res.send(result);
          });

          // get orders api
        app.get('/myOrders', async(req, res)=>{
          const cursor = ordersCollection.find({});
          const orders = await cursor.toArray();
          res.send(orders);
        });

        // my orders
        app.get('/myOrders/:email', async(req, res)=>{
          const result = await ordersCollection.find({ email: req.params.email})
          .toArray();
          console.log(result);
          res.send(result);
        });
        
       // deleted order
      app.delete("/delteOrder/:id", async (req, res) => {
        const result = await ordersCollection.deleteOne({_id: ObjectId(req.params.id),});
        res.send(result);
      });
       // deleted product
      app.delete("/product/:id", async (req, res) => {
        const result = await productsCollection.deleteOne({_id: ObjectId(req.params.id),});
        res.send(result);
      });

      // users info post api
      app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.json(result);
      })

      //upsert google sign in ar jnno
      app.put('/users', async(req, res)=>{
        const user = req.body;
        const filter = { email: user.email };
        const options = {upsert: true};
        const updateDoc = { $set: user } ;
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.json(result);
      });
      //role setup
      app.put('/users/admin', async(req, res)=>{
        const user = req.body;
        console.log('put', user)
        const filter = { email: user.email };
        const updateDoc = { $set: {role:'admin'} } ;
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.json(result);
      });

      // chaking admin
      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })


    // REVIEW POST API 
    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result)
    })
    // GET ALL REVIEWS 
    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result)
    })


    }
    finally{
        // await client.close()
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, Welcome to leo bike')
})

app.listen(port, () => {
  console.log(`Leo Bike app listening at : ${port}`)
})

