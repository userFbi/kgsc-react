const path = require("path");

// ... aapke existing routes (app.use("/api/manager", ...) etc.) yahan tak

// Production mein React build ko serve karo
if (process.env.NODE_ENV === "production") {
    const clientBuildPath = path.join(__dirname, "../client/dist");
    app.use(express.static(clientBuildPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(clientBuildPath, "index.html"));
    });
}