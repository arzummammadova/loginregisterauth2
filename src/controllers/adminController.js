

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
export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedUser = await User.findByIdAndDelete(id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

