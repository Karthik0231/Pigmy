const express=require("express")
const app=express();
// Remove the global express.json() middleware
app.use(express.json())
const cors=require('cors')

const connectToMongo=require("./DB.js");
connectToMongo()

app.use(cors()) 

const port=8080;
app.listen(port,()=>{
    console.log("................................")
    console.log("Server is running on port,"+port)
})

app.use("/admin",require("./Routes/adminRoute"));
app.use("/uploads", express.static("./uploads"));

app.use("/collector",require("./Routes/collectorRoute"));

app.use("/customer",require("./Routes/userRoute"));
