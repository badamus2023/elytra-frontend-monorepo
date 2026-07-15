import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://192.168.1.102:8080/swagger/v1/swagger.json',
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
