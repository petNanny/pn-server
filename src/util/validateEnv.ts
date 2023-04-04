import { cleanEnv } from "envalid";
import { port, str } from "envalid/dist/validators";

export default cleanEnv(process.env, {
  MONGO_CONNECTION_STRING: str(),
  PORT: port(),
  ACCESS_TOKEN_SECRET: str(),
  REFRESH_TOKEN_SECRET: str(),
  TEST_PORT: port(),
  MONGO_CONNECTION_STRING_TEST_DB: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_BUCKET_NAME: str(),
  AWS_BUCKET_REGION: str(),
  JWT_KEY: str(),
  EMAIL_SERVICE: str(),
  EMAIL_USER: str(),
  EMAIL_PASS: str(),
  EMAIL_VERIFY_LINK: str(),
  GOOGLE_OAUTH_CLIENT_ID: str(),
});
