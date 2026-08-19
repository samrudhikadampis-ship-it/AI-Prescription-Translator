const express = require("express");
const cors = require("cors");

const documentRoutes = require("./routes/documentRoutes");

const app = express();

// Allow frontend to access backend
app.use(cors({
    origin: "https://literate-fiesta-5g77jp45wr472p6v6-5500.app.github.dev"
}));

app.use(express.json());

app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
    res.send("MediLingo backend is running!");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});