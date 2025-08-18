import multer from "multer";
import { Request } from "express";

// Constants for file validation
const ALLOWED_MIME_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

// Storage configuration
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only video files are allowed.'));
        return;
    }
    cb(null, true);
};

// Multer configuration
export const uploadConfig = multer({
    storage,
    limits: {
        files: 1
    },
    fileFilter
});

// Error handler for multer
export const multerErrorHandler = (err: any) => {
    return {
        status: 400,
        message: err.message
    };
};
