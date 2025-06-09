import mongoose from "mongoose";
export const connectDB = async()=>{
    await mongoose.connect('mongodb+srv://shahnishita76:nishu*2003@cluster0.hjxo8yy.mongodb.net/food-delivery').then(()=>console.log("DB connected"));
}
