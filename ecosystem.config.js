module.exports = {
  apps: [
    {
      name: "gfcedit_server_1",
      script: "build/index.js",
      watch: true,
      env: {
        NODE_ENV: "production",
        PORT: 4001,
        name: "gfcedit_server_1",
      },
      env_development: {
        NODE_ENV: "development",
      },
    },
    // ,
    // {
    //   name: "hybank_server_2",
    //   script: "build/index.js",
    //   watch: true,
    //   env: {
    //     NODE_ENV: "production",
    //     PORT: 3002,
    //     name: "hybank_server_2",
    //   },
    //   env_development: {
    //     NODE_ENV: "development",
    //   },
    // },
  ],
};
