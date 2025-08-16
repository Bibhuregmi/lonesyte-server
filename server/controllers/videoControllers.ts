import { Request, Response } from "express";
import {s3} from "../utils/s3"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import { supabase } from "../utils/supabase"
import { VideoMetadata, VlogMetadata } from "../utils/videoMetadata";
import { PassThrough } from "stream";
import { compressVideo } from "../utils/videoCompression";

const bucketName = process.env.AWS_BUCKET_NAME!;
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes
let uploadStream : Buffer | PassThrough; 

export const uploadVideo = async(req: Request, res: Response) => {
    try{
        if(!req.file){
            return res.status(400).json({message: "Can't upload a empty file"})
        }
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const userId = req.user.id; 
        const fileName = `users/${userId}/videos/${Date.now()}-${req.file.originalname}`
        //checking if the size of the file < 2GB
        if(req.file.size > MAX_FILE_SIZE){
            //compressing only if the size is > 2GB
            uploadStream = await compressVideo(req.file.buffer);
        }else{
            uploadStream = req.file.buffer; 
        }
        //Uploading to S3
        await s3.send(new PutObjectCommand({
            Bucket: bucketName, 
            Key: fileName, 
            Body: uploadStream, 
            ContentType: req.file.mimetype
        }))

        //Saving Metadata to Supabase
        const {error} = await supabase.from("videos").insert({
            user_id: userId,
            title: req.body.title || null,
            description: req.body.description || null,
            video_url: fileName,
            created_at: new Date().toISOString(),
            language: req.body.language || null,
        } as VideoMetadata);
        if (error) throw new Error(error.message); 
        return res.status(200).json({message: "Video Upload Success!", fileName})
    }catch (error){
        console.error("Upload Error:", error)
        return res.status(500).json({message: 'Falied to upload video', error: (error as Error).message})
    }
}

export const getVideo = async(req: Request, res: Response) => {
    try{
        if(!req.user){
            return res.status(401).json({message: "User not authenticated"})
        }
        const userId = req.user.id;
        const {data, error} = await supabase.from("videos").select("*").eq("user_id", userId).order('created_at', {ascending: true});
        if(error){
            return res.status(404).json({message: "Video metadata not found"})
        }
        if(!data || data.length === 0){
            return res.status(404).json({message: "Video not available"})
        }
        //signed url to access the file
        const videosWithURL = await Promise.all(data.map(async (video: VideoMetadata) => {
            const command = new GetObjectCommand({
                Bucket: bucketName,
                Key: video.video_url, 
            })
            const url = await getSignedUrl(s3, command, {expiresIn: 3600}) //url expires in 1hour 
            //returning metadata and signed url
            return {
                ...video,
                url
            }
        }))
        return res.status(200).json({
            videos: videosWithURL
        });
    } catch(error){
        console.error("Get Video Eroor:", error)
        return res.status(500).json({message: 'Failed to get video'})
    }
}

export const uploadVlog = async (req: Request, res: Response) => {
    try{
        if(!req.file){
            return res.status(400).json({message: "No video provided!"})
        }
        if(!req.user){
            return res.status(401).json({message: "User not authenticated!"})
        }
        const userId = req.user.id; 
        const fileName = `users/${userId}/vlogs/${Date.now()}-${req.file.originalname}`
        const latitude = parseFloat(req.body.latitude)
        const longitude = parseFloat(req.body.longitude)
        if(isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180){
            return res.status(400).json({message: "Invalid co-ordinates"})
        } 
        if(req.file.size > MAX_FILE_SIZE){
            uploadStream = await compressVideo(req.file.buffer)
        }else{
            uploadStream = req.file.buffer
        }
        await s3.send(new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName, 
            Body: uploadStream, 
            ContentType: req.file.mimetype
        }))
        const {error} = await supabase.from("travel_vlogs").insert({
            user_id: userId,
            title: req.body.title || null, 
            video_url : fileName, 
            created_at: new Date().toISOString(),
            latitude: latitude,
            longitude: longitude
        } as VlogMetadata)
        if(error) throw new Error(error.message);
        return res.status(200).json({message: "Vlog upload success!", fileName})
    } catch(error){
        console.error("Upload Error: ", error)
        return res.status(500).json({message: "Failed to upload video", error: (error as Error).message})
    }
}