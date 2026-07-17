import { defineConfig } from 'orval';

declare const process: {
  loadEnvFile(path?: string): void;
  env: Record<string, string | undefined>;
};

process.loadEnvFile();

const apiUrl = process.env.API_URL?.replace(/\/$/, '');
if (!apiUrl) {
  throw new Error('API_URL is not configured in .env');
}

export default defineConfig({
  api: {
    input: `${apiUrl}/swagger/v1/swagger.json`,
    output: {
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/api/axios-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
