"use client";

import { useEffect } from "react";

export default function UnregisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => {
          if (reg.active && reg.active.scriptURL.includes("sw.js")) {
            console.log("🧹 Unregistering old service worker");
            reg.unregister();
          }
        });
      });
    }
  }, []);

  return null;
}
