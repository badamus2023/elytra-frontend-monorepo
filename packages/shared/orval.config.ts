export default {
  api: {
    input: 'http://localhost:8080/swagger/v1/swagger.json',
    output: {
      target: './src/api/client.ts',
      schemas: './src/api/model',
      client: 'fetch',
    },
  },
};
