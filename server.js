const express = require("express");
const path = require("path");

const app = express();

connectDB();

app.use(express.json({extended: false}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server loaded on ${PORT}`));