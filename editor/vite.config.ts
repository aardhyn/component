import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';

const DEFAULT_PORT = 2048;
const port = parseInt(process.env.PORT) || DEFAULT_PORT;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: { port },
});
