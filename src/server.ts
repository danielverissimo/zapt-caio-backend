import express from "express";
import https from "https";
import fs from "fs";
import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "./swagger.json";

var options = {
  customCss: '.swagger-ui .topbar { display: none }'
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs, options));

// Read the SSL certificate files
const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8");
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, "utf8");

const credentials = {
  key: privateKey,
  cert: certificate
};

// Create an HTTPS service using the Express app
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(process.env.PORT, () => {
  logger.info(`HTTPS Server running on port ${process.env.PORT}`);
});

initIO(httpsServer);  // Assuming your socket.io initialization supports HTTPS, otherwise you'll need to modify this as well
StartAllWhatsAppsSessions();
gracefulShutdown(httpsServer);
