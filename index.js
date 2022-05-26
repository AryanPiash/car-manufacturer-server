const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT | 5000



app.get('/', (req, res) => {
    res.send('Car Manufacturer server is running...')
  })
  
  app.listen(port, () => {
    console.log(`Listening on port`, port)
  })