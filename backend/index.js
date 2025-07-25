const express = require("express");
const cors = require ("cors");
const dotenv = require ("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT;

app.use(cors());

const myData = [ 
    {id:1,name :"this might show on /data"},
    {id:2,name :"backend is fun"}
]

app.get("/data", (req,res)=>{ 
    res.json(myData)
})

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
})