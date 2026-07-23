import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-core',
              test: /node_modules\/(?:react|react-dom|scheduler)\//,
            },
            {
              name: 'curriculum-core',
              test: /\/src\/(?:courseData\.js|data\/curriculum\/|content\/week[0-4]Blocks\.js)/,
            },
          ],
        },
      },
    },
  },
})
