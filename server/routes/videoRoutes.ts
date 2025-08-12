import { Router } from "express";
import { uploadVideo, getVideo } from "../controllers/videoControllers";
import { authMiddleware, upload } from "../middlewares/middleware";
const router = Router(); 

router.post('/upload', authMiddleware, upload.single("video") ,uploadVideo )
router.get('/:id', authMiddleware, getVideo)

export default router; 