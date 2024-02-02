module.exports = {
  apps: [
    {
      name: "hybank_server_1",
      script: "build/index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        name: "hybank_server_1",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    {
      name: "hybank_server_2",
      script: "build/index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 3002,
        name: "hybank_server_2",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
  ],
};
