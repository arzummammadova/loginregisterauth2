

import User from "../models/authModel.js";



//admin panel
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.status(200).json(users)
  }
  catch (error) {
    res.status(500).json({message:"internal server error"})
  }




}