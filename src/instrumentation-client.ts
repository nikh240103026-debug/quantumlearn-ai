import { reportClientError } from "@/lib/monitoring/report-client-error";

window.addEventListener("error", (event) => {
  // Cross-origin script failures carry no Error object; skip those.
  if (event.error) reportClientError(event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  reportClientError(event.reason);
});
