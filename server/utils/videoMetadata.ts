export interface VideoMetadata{
    id?: string; 
    user_id?: string;
    title: string | null;
    description: string | null;
    video_url: string;
    created_at: string;
    language?: string | null; // optional, if language metadata is needed
}

export interface VlogMetadata{
    id?: string;
    user_id?: string;
    title: string | null;
    video_url: string;
    created_at: string;
    latitude: number;
    longitude: number;
}