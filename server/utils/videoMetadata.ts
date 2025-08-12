export interface VideoMetadata{
    id?: string; 
    user_id?: string | null; // optional, if user authentication is implemented
    title: string | null;
    description: string | null;
    video_url: string;
    created_at: string;
    language?: string | null; // optional, if language metadata is needed
}