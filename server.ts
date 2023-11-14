import dotenv from "dotenv";
import express, { Request, Response, request } from "express";
dotenv.config();

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true, type: "multipart/form-data" }));
app.use(express.json({ type: "application/json" }));

const apiKey = process.env.API_KEY;

const authenticate = (req: Request, res: Response, next: Function) => {
  const providedApiKey = req.headers["authorization"]?.split(" ")[1];

  if (providedApiKey === apiKey) {
    next(); // Authentication passed
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.post("/upload", authenticate, (req: Request, res: Response) => {
  console.log(req);
  res.send("Authorized request successfully");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
