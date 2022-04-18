const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors')


// for reading environment variables
require('dotenv/config');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

app.use(cors());
app.options('*', cors());

const categoryRouter = require('./routers/categories');
const productRouter = require('./routers/products');
const orderRouter = require('./routers/orders');
const userRouter = require('./routers/users');

const api = process.env.API_URL;

// Middlewares(req.body)
//app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('tiny')); // for logging API requests from client
app.use(authJwt());
app.use('/public/uploads', express.static(__dirname + '/public/uploads')); // static path
app.use(errorHandler);


// Routers
app.use(`${api}/products`, productRouter);
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/users`, userRouter);
app.use(`${api}/categories`, categoryRouter);


// Connection to the database
mongoose.connect(process.env.CONNECTION_STRING,
    // {
    //     useNewUrlParser: true,
    //     useUnifiedTopology:true,
    //     dbName:'mern_database'
    // }
    
    )
.then(()=>{console.log(`Database Connected to ${process.env.CONNECTION_STRING}`)})
.catch((err)=>{console.log(err)});


// Development
// app.listen(3000, ()=>{
//     console.log('Server is running http://localhost:3000');
// }); 

// Production
var server = app.listen(process.env.PORT || 3000, ()=>{
    var port = server.address().port;
    console.log(`Server is running on ${port}`);
})