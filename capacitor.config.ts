import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.doiagain.app",
  appName: "Doi Again",
  webDir: "public",
  server: {
    url: "https://doi-again.vercel.app",
    cleartext: true,
  },
};
export default config;
