import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voluntern API",
      version: "1.0.0",
      description: "Gençlər və könüllülər üçün vakansiya API",
    },
    servers: [
      { url: "http://localhost:5000/api" }
    ],
  },
  apis: ["./src/routers/*.js"], // ✅ tam path
};


const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
