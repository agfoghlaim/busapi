const http = require('http');
const express = require('express');
//const morgan = require('morgan');

const busroutesRoutes = require('./api/routes/busroutes')
const snapshots = require('./api/routes/snapshots');


const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const mongoose = require('mongoose');



mongoose.connect('mongodb+srv://marieoh:' + process.env.MONGO_PW+'@bus-zvhfi.mongodb.net/bus?retryWrites=true&w=majority', {useNewUrlParser:true})

/*

HEADERS (prevent cors errors)
doesn't send response, just sorts the headers part

*/
// app.use((req,res,next)=>{
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

//   //for post/put browser sends this first to see if it's ok to actually make the request
//   if(req.method === 'OPTIONS'){

//     //respond with which methods are allowed
//     // res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');

//     //restrict to GET for now
//     res.header('Access-Control-Allow-Methods', 'GET');
//     return res.status(200).json({})
//   }
// })

//app.use(morgan('dev'));
app.use('/busroutes', busroutesRoutes)
app.use('/snapshots', snapshots)

//errors anything that the previous routes couldn't handle must be an error if it gets to here
app.use((req,res,next)=>{
  const error = new Error('Not found');
  error.status = 404;
  next(error);
})

//to return 500 server error
app.use((err, req,res,next)=>{
  res.status(err.status || 500);
  res.json({
    error:{
      message: 'Something is wrong: ' + err.message
    }
  })
})


server.listen(port);

