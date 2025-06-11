const mongoose=require('mongoose')
const mongoURL='mongodb://localhost:27017/Pigmy'

const connectToMongo=async()=>{
    try{
        await mongoose.connect(mongoURL);
        console.log("Connect to mongo successfull");
    }
    catch(err){
        console.log("Connect to mongo unsuccessfull",err)
    }
}
module.exports=connectToMongo
