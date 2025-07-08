const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  // Entry points for the various js bundles
  entry: {
    index: "./src/public/js/index.js",
    styles: "./src/public/scss/styles.scss",
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
            loader: "sass-loader",
            options: {
              sassOptions: {
                // Optional: Silence Sass deprecation warnings. See note below.
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
