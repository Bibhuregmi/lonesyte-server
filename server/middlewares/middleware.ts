import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { supabase } from "../utils/supabase";

const storage = multer.memoryStorage();
export const upload = multer({storage})

// Middleware to authenticate user using Supabase
export const authMiddleware = async (req:Request, res:Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: 'Authentication Required!' });
    }
    try{
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ message: "Invalid Token" });
        }
        req.user = user;
        next(); 
    } catch(error){
        console.log(error)
        return res.status(401).json({ message: 'Authentication failed'});
    }
}