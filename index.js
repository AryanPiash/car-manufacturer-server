const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT | 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhk4e.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' })
  }
  const token = authHeader.split(' ')[1]

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    }
    req.decoded = decoded;
    next()
  });

}



async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('car_manufacturer').collection('products')
        const ordersCollection = client.db('car_manufacturer').collection('orders')
        const clientsCollection = client.db('car_manufacturer').collection('clients')
        const reviewsCollection = client.db('car_manufacturer').collection('reviews')
        const profileCollection = client.db('car_manufacturer').collection('profile')


        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query)
            const products = await cursor.toArray()
            res.send(products)
          })
        
          app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const product = await productsCollection.findOne(query)
            res.send(product)
          })   


          app.post('/order', async (req, res) => {
            const order = req.body;
            const query = { product: order.product, client: order.client }
            const exists = await ordersCollection.findOne(query)
            if (exists) {
              return res.send({ success: false, order: exists })
            }
      
            const result = await ordersCollection.insertOne(order)
            res.send({ success: true, result })
          })


          app.get('/order', verifyJWT, async(req, res) => {
            const client = req.query.client;
            const decodedEmail = req.decoded.email;
            if (client === decodedEmail) {
              const query = { client: client }
              const orders = await ordersCollection.find(query).toArray()
              return res.send(orders)
            }
            else {
              return res.status(403).send({ message: 'Forbidden access' })
            }
          })

          app.put('/clients/:email', async (req, res) => {
            const email = req.params.email;
            const clients = req.body;
            const filter = { email: email }
            const options = { upsert: true };
            const updateDoc = {
              $set: clients
            };
            const result = await clientsCollection.updateOne(filter, updateDoc, options)
      
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ result, token })
          })

          app.delete('/order/:email',verifyJWT,async (req, res) => {
            const email = req.params.email;
            const filter = {client: email}
          const result = await ordersCollection.deleteOne(filter)
            res.send(result)
          })


          app.get('/review', async (req, res) => {
            const query = {}
            const reviews = await reviewsCollection.find(query).toArray()
            res.send(reviews)
          })
          
          app.post('/review', async (req, res) => {
            const review = req.body;
            const query = { product: review.product, client: review.client }
            const exists = await reviewsCollection.findOne(query)
            if (exists) {
              return res.send({ success: false, order: exists })
            }
      
            const result = await reviewsCollection.insertOne(review)
            res.send({ success: true, result })
          })



          app.post('/profile', async (req, res) => {
            const profile = req.body;
            const query = { name: profile.name, email: profile.email }
            const exists = await profileCollection.findOne(query)
            if (exists) {
              return res.send({ success: false, order: exists })
            }
      
            const result = await profileCollection.insertOne(profile)
            res.send({ success: true, result })
          })



         
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Manufacturer server is running...')
})

app.listen(port, () => {
    console.log(`Listening on port`, port)
})