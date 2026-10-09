import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`LeadFlow API listening on port ${env.port}`);
});
