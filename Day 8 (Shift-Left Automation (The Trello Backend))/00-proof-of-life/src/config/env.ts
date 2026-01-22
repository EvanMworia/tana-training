import dotenv from 'dotenv';

dotenv.config();

const required = ['TRELLO_API_KEY', 'TRELLO_TOKEN'] as const;
const optional = ['TRELLO_USERNAME', 'TRELLO_PASSWORD', 'TRELLO_WORKSPACE_ID'] as const;

required.forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
});

export const trelloConfig = {
  apiKey: process.env.TRELLO_API_KEY as string,
  token: process.env.TRELLO_TOKEN as string,
  // Optional: Only required for UI tests
  username: process.env.TRELLO_USERNAME,
  password: process.env.TRELLO_PASSWORD,
  workspaceId: process.env.TRELLO_WORKSPACE_ID,
};