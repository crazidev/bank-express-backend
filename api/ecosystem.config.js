module.exports = {
  apps: [
    {
      name: "bank_server_1",
      script: "build/index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 4001,
        name: "bank_server_1",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    // ,
    // {
    //   name: "bank_server_2",
    //   script: "build/index.js",
    //   watch: true,
    //   env: {
    //     NODE_ENV: "production",
    //     PORT: 3002,
    //     name: "bank_server_2",
    //   },
    //   env_development: {
    //     NODE_ENV: "development",
    //   },
    // },
  ],
};
