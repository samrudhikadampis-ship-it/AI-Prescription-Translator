const express = require("express");
const documentRoutes = require("./routes/documentRoutes");
const app = express();

app.use(express.json());



app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
    res.send("MediLingo backend is running!");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});