import foodModel from "../models/FoodModel.js";
import fs from 'fs';

const addFood = async (req, res) => {
  try {
    // Log for debugging
    console.log("REQ.BODY =>", req.body);
    console.log("REQ.FILE =>", req.file);

    // Ensure filename is captured correctly
    const image_filename = req.file ? req.file.filename : null;

    // Create a new food document
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename
    });

    // Save to DB
    await food.save();
    res.json({ success: true, message: "Food Added" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error", error });
  }
};
const listFood = async (req, res) => {
  try {
    const foodList = await foodModel.find();
    res.json({ success: true, data: foodList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to fetch food", error });
  }
};
//remove fooditem
const removeFood = async (req,res) => {
  try {
      const food = await foodModel.findById(req.body.id);
      fs.unlink(`uploads/${food.image}`,()=>{})

      await foodModel.findByIdAndDelete(req.body.id);
      res.json({success:true,message:"Food Removed"})
  } catch (error) {
      console.log(error);
      res.json({success:false,message:"Error"})
  }
}



export {addFood,listFood,removeFood}