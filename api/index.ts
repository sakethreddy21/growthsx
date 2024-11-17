const express = require("express");
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

import userRoutes from './routes/user'
import adminRoutes from './routes/admin' 
import { connectMongoDB } from '../lib/config'; // Adjust the path as needed

connectMongoDB()

app.use(cors())


app.use(express.json());
// Routes



app.use('/user', userRoutes)

app.use('/admin', adminRoutes)

app.get("/", (req:any, res:any) => res.json("Express on Vercel"));

app.listen(3000, () => console.log("Server ready on port 3000."));

module.exports = app;