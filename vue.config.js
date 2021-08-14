const path = require("path");

module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.alaanor.beatlist",
        win: {
          target: "nsis",
          icon: "./public/icon.ico",
        },
        extraResources: ["cache/*"],
      },
    },
  },
  configureWebpack: {
    // devtool: "source-map",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  },
};
