declare const process: {
  loadEnvFile(path?: string): void;
  env: Record<string, string | undefined>;
};

process.loadEnvFile();

const apiSchemaUrl = process.env.API_SCHEMA_URL;
if (!apiSchemaUrl) {
  throw new Error('API_SCHEMA_URL is not configured in .env');
}

export default {
  api: {
    input: apiSchemaUrl,
    output: {
      target: './src/api/client.ts',
      schemas: './src/api/model',
      client: 'fetch',
    },
  },
};
