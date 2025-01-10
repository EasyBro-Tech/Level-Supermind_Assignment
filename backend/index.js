// import express from "express"
// import {main} from "./langdlow.js"

const express = require("express")
const {main} = require("./langflow.js")
const cors = require("cors")
let application= express()
const path = require("path")

application.use(express.json())
application.use(cors())

application.post("/requestAnalysis", async (req,res)=>{
    
    const { posttype } = req.body
    // console.log(`Input type received: ${posttype}`);
    
    try {
        const response = await main(posttype)
        return res.json(response.replace(/[`"]/g, '').replace(/\n/g, '<br>').replace(/"/g, ''))
// console.log("");

    } catch (error) {
        // console.log(error)
        return res.status(500).json({msg : error.message})
    }
})

application.use("/", express.static(path.join(__dirname, "build")));

application.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });


application.listen(7000,"0.0.0.0",async ()=>{
    console.log("Server Started successfully")
})