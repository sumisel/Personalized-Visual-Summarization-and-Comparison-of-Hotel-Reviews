module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/Personalized-Visual-Summarization-and-Comparison-of-Hotel-Reviews/" : "/",
    css: {
      loaderOptions: {
        sass: {
          prependData: `
            @import "@/scss/_global.scss";
          `
        }
      }
    }
  };