const path = require("path");
const Dotenv = require("dotenv-webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    filename: "Code.gs",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  module: {
    rules: [{ test: /\.ts$/, use: "ts-loader", exclude: /node_modules/ }],
  },
  plugins: [
    new Dotenv({ path: path.resolve(__dirname, ".env"), systemvars: true }),
    new CopyWebpackPlugin({
      patterns: [{ from: "appsscript.json", to: "appsscript.json" }],
    }),
  ],

  optimization: { minimize: false, usedExports: false }

};
