import dotenv from "dotenv";

dotenv.config();

const portValue = process.env.PORT ?? "3000";
const port = Number(portValue);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
};
