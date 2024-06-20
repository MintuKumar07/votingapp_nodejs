const express = require('express');
const app = express();
const db=require('./db');
require('dotenv').config();

const bodyParser=require('body-parser');
app.use(bodyParser.json());

const PORT=process.env.PORT || 3000;


//Importing the Router File
const userRoutes=require('./routes/userRoutes');
const candidateRoutes=require('./routes/candidateRoutes');
//using the router
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);


app.listen(PORT, ()=>{
    console.log("Listening to port 3000");
});