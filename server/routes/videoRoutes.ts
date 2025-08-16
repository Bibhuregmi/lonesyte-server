import { Router } from "express";
import { uploadVideo, getVideo, uploadVlog } from "../controllers/videoControllers";
import { authMiddleware, handleUploadError, upload } from "../middlewares/middleware";
const router = Router(); 

router.post('/upload', authMiddleware, upload.single("video"), handleUploadError, uploadVideo)
router.post('/upload-vlogs', authMiddleware, upload.single("video"), handleUploadError, uploadVlog)
router.get('/get-video', authMiddleware, getVideo)

export default router; 