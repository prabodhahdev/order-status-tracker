import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orderRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", orderRoutes);

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});