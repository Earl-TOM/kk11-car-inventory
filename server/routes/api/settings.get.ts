import { defineHandler } from "nitro";
import { getSiteSettings } from "../../utils/site-settings";

export default defineHandler(async () => {
  return getSiteSettings();
});