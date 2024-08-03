import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import {renameSync,unlinkSync} from "fs";
const maxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and Password are required.");
    }

    const user = await User.create({ email, password });
    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and Password are required.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("user not found.");
    }
    const auth = await compare(password, user.password);

    if (!auth) {
      return res.status(401).send("password is incorrect");
    }
    res.cookie("jwt", createToken(email, user._id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.userId);

    if (!userData) {
      return res.status(404).send("User with the given ID not found.");
    }

    return res.status(200).json({
      
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};



export const updateProfile = async (req, res, next) => {
  try {
    const {userId} =req;
    const {firstName,lastName,color}=req.body;
    if(!firstName || !lastName){
      return res.status(400).send("firstname lastname and color is required.");
    }
    const userData = await User.findByIdAndUpdate(userId,{
      firstName,
      lastName,
      color,
      profileSetup:true,
    },
    {new:true,runValidators:true});

    
    return res.status(200).json({
      
        id: userData.id,
        email: userData.email,
        profileSetup: userData.profileSetup,
        firstName: userData.firstName,
        lastName: userData.lastName,
        image: userData.image,
        color: userData.color,
      
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};




export const addProfileImage = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required.");
    }

    const date = Date.now();
    const fileName = `uploads/profiles/${date}_${request.file.originalname}`;

    // Rename the file to include the timestamp
    renameSync(request.file.path, fileName);

    // Update the user with the new image path
    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );


    return response.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.error({ error });
    return response.status(500).send("Internal Server Error");
  }
};


export const removeProfileImage = async (req, res, next) => {
  try {
    const {userId} =req;
    const user=await User.findById(userId);
    if(!user){
      return res.status(404).send("User not Found.");
    }
    if(user.image){
      unlinkSync(user.image);
    }
    user.image =null;
    await user.save();

   return res.status(200).send("Profile image removed");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt"," ",{maxAge:1,secure:true,sameSite:"None"});
   return res.status(200).send("LogoutSuccessfull");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};