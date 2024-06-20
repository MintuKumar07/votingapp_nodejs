const mongoose=require('mongoose');

//importing dotenv
require('dotenv').config();

//Defining the url
//const mongoURL='mongodb://localhost:27017/hotels';
const mongoURL=process.env.MONGODB_URL_LOCAL;

//for mongoDB Atlas
//const mongoURL=process.env.MONGODB_URL;

//Setting up mongodb connection
mongoose.connect(mongoURL,{
    useNewUrlParser:true,       //mandatory parameter
    useUnifiedTopology:true     //mandatory parameter
})

 //Default connection
 //mongoose maintain a default connection objects representing the mongoDB connection
 const db=mongoose.connection;

 //evevnt listener
 db.on('connected',()=>{
    console.log('connected to mongoDB server');
 });

 db.on('error',(err)=>{
    console.log('MongoDB connection error',err);
 });

 db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
 });

 //exporting database connection
 module.exports=db;