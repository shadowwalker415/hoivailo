const path = require("path");
const autoprefixer = require("autoprefixer");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // Entry points for the various js bundles
  entry: {
    slots: "./src/public/js/slots.js",
    contact: "./src/public/js/contact.js",
    appointment: "./src/public/js/appointment.js",
    cancelAppointment: "./src/public/js/cancelAppointment.js"
  },
  output: {
    filename: "./js/[name].main.js", // Creates a directory named js and inserts all *.main.js output files in it
    path: path.resolve(__dirname, "src/public/dist") // Creates a directory named dist
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"] // For flatpickr's CSS
      },
      {
        test: /\.(scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [autoprefixer]
              }
            }
          },
          {
            loader: "sass-loader",
            options: {
              sassOptions: {
                silenceDeprecations: [
                  "mixed-decls",
                  "color-functions",
                  "global-builtin",
                  "import"
                ]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "./css/[name].css" // Creats a directory name css and inserts the css output file in it.
    })
  ]
};
