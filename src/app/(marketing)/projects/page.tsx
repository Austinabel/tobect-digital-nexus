import { redirect } from "next/navigation";

/**
 * The Projects page is switched off for now — visitors are sent to the homepage,
 * which shows projects once some are added (Admin → Pages → Projects).
 * To bring the page back, restore this file from git history.
 */
export default function ProjectsPage() {
  redirect("/");
}
