const express = require("express");

const app = express();

app.use(express.json());

const documentRoutes = require("./routes/documentRoutes");

app.use("/api/documents", documentRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});