export default {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: false,
  clean: false,
  sourcemap: false,
  minify: false,
  external: ['react', 'react-dom', 'html2canvas', 'jspdf'],
};
