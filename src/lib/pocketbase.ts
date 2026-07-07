import PocketBase from 'pocketbase';

export const pb = new PocketBase(
  import.meta.env.VITE_POCKETBASE_URL || 'https://kk11-pbdb.lifutilabs.com'
);
