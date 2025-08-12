import { Request, Response } from "express";
import {s3} from "../utils/s3"
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner"
import { supabase } from "../utils/supabase"
import { VideoMetadata } from "../utils/videoMetadata";

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
        const bucketName = process.env.AWS_BUCKET_NAME!; 

        //Uploading to S3
        await s3.send(new PutObjectCommand({
            Bucket: bucketName, 
            Key: fileName, 
            Body: req.file.buffer, 
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
        const bucketName = process.env.AWS_BUCKET_NAME!;
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