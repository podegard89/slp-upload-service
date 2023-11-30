import dotenv from "dotenv";
import express, { Request, Response, request } from "express";
import multer from "multer";
import cookieParser from "cookie-parser";
import cors from "cors";
import { supabase } from "./lib/supabase";
dotenv.config();

const app = express();
const port = 3000;

app.use(
  express.urlencoded({
    extended: true,
    type: "application/octet-stream",
    limit: 20 * 1024 * 1024,
    parameterLimit: 50000,
  })
);

app.use(
  express.json({
    limit: 20 * 1024 * 1024,
    type: "application/json",
  })
);

app.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename for the uploaded file
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

const authenticate = async (req: Request, res: Response, next: Function) => {
  const refreshToken = req.cookies["sb-refresh-token"];
  const accessToken = req.cookies["sb-access-token"];

  if (!refreshToken || !accessToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data, error } = await supabase.auth.setSession({
    refresh_token: refreshToken as string,
    access_token: accessToken,
  });

  if (error) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  res.locals.userData = data.user;

  next();
};

app.post(
  "/upload",
  cors(),
  authenticate,
  upload.array("slpFiles", 5),
  (req: Request, res: Response) => {
    console.log(req.files);
    console.log(res.locals.userData.user_metadata.name);
    res.redirect(process.env.CLIENT_URL_DEV + "/dashboard");
  }
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
