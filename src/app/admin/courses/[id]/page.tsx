import { redirect } from "next/navigation";

/*
 * This page used to be a hard-coded mock: it showed sample data instead
 * of the record, and its "Save" only waited on a timer and showed a
 * success message without saving anything. Real viewing and editing
 * happens in the list page's edit dialog, so send admins there.
 */
export default function Page() {
  redirect("/admin/courses");
}
