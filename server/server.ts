import Express, {Request, Response} from "express"
import dotenv from "dotenv";
import router from "./routes/videoRoutes";
dotenv.config(); 

const app = Express(); 
const PORT = process.env.PORT; 

app.use(Express.json());
app.use("/api/videos", router)

app.listen(PORT, () => {
    console.log(
        `Server is listening on http://localhost:${PORT}`
    )
})