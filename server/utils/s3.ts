import { S3Client } from "@aws-sdk/client-s3"
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AWS_BUCKET_NAME || !process.env.AWS_BUCKET_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS configuration in environment variables");
}
export const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})