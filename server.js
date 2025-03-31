const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const cors = require("cors")
const understandAudienceRoutes = require("./routes/understandAudienceRoutes");


app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
const MongodbURI = process.env.MONGO_URI;
app.use(cors({
    origin: [ 'http://localhost:5173',"https://testir.xyz","https://irresistible-offer-copilot.testir.xyz", ,'http://localhost:5174',], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true 
}));

app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//mounting routes
app.use("/api/understand-audience", understandAudienceRoutes);


app.use('/test3', (req, res) => {
   
    res.json("Congratulations on deployement")
})



const port = process.env.PORT || 3005;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});