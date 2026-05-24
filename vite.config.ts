import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES_BASE ?? '/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        quiz: 'quiz.html',
      },
    },
  },
});
