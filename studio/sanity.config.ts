import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { imagekitPlugin } from 'sanity-plugin-imagekit';
import { schema } from './schemaTypes';
import { structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '4tjg72wm';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';
const apiVersion = process.env.SANITY_STUDIO_API_VERSION || '2026-07-07';

export default defineConfig({
  name: 'default',
  title: 'UShop Studio',
  projectId,
  dataset,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    imagekitPlugin({
      urlEndpoint: process.env.SANITY_STUDIO_IMAGEKIT_URL_ENDPOINT || '',
      publicKey: process.env.SANITY_STUDIO_IMAGEKIT_PUBLIC_KEY || '',
    }),
  ],
});

