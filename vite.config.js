import babel from "vite-babel-plugin";

export default {
  plugins: [
    babel(),
  ],
  root: 'examples',
  build: {
    outDir: 'examples/dist'
  }
};