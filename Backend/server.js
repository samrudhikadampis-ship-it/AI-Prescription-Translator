const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const documentRoutes = require("./routes/documentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const frontendPath = path.join(__dirname, "..", "Frontend");
const uploadsPath = path.join(__dirname, "uploads");

fs.mkdirSync(uploadsPath, { recursive: true });

function isAllowedOrigin(origin) {
    if (!origin) {
        return true;
    }

    try {
        const url = new URL(origin);
        const host = url.hostname;

        if (host === "localhost" || host === "127.0.0.1") {
            return true;
        }

        if (host.endsWith(".app.github.dev") || host.endsWith(".github.dev")) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
}

app.use(cors({
    origin: function (origin, callback) {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error("Not allowed by CORS"));
    }
}));

app.use(express.json());
app.use(express.static(frontendPath));

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "MediLingo backend is running"
    });
});

app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});