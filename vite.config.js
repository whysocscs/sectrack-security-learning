import { defineConfig } from 'vite'
import { localContentAuthoringPlugin } from './scripts/local-content-authoring.mjs'

export default defineConfig({
  plugins: [localContentAuthoringPlugin()],
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
