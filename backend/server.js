require('dotenv').config()

const express = require('express')
const LaborlinkRoutes = require('./routes/authroutes')
const mongoose = require('mongoose')
const cors = require("cors");

//express app 
const app = express()

//enable CORS to allow cross-origin requests
app.use(cors());

//middleware
app.use(express.json())

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

app.use('/api/laborlink', LaborlinkRoutes)

//connect to db
mongoose.connect(process.env.MONGO_URI) 
    .then(() => {
    //listen for requests
    app.listen(process.env.PORT, () => {
    console.log('Connected to db and listening on port', process.env.PORT)
})
    })
    .catch((error) => {
        console.log(error)
    })
