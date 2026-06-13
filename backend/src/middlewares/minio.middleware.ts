import multer from "multer";
import type { Request } from "express";

// Store files in memory
const storage = multer.memoryStorage();

// Filter allowed image types
const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    
    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Incorrect file format!"));
    }
};

// Multer upload configuration
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: fileFilter
});