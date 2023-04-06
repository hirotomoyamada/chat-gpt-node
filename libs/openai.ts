import dotenv from 'dotenv';
import { Configuration, OpenAIApi, CreateCompletionRequest } from 'openai';

dotenv.config();

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

export const openai = new OpenAIApi(configuration);
