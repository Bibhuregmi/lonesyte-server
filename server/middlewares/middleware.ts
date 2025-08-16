import { Request, Response, NextFunction } from "express";
import { supabase } from "../utils/supabase";
import {uploadConfig, multerErrorHandler} from "../config/multerConfig"

export const upload = uploadConfig;

export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        const error = multerErrorHandler(err);
        return res.status(error.status).json({ message: error.message });
    }
    next();
};
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