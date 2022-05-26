const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT | 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nhk4e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
    try {
        await client.connect();
        const productsCollection = client.db('car_manufacturer').collection('products')


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