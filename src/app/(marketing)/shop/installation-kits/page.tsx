import { permanentRedirect } from "next/navigation";
import { SETUPS_CATEGORY } from "@/lib/catalog";

/** The kits now live on the Complete Solar Setups category page, alongside the setup products. */
export default function InstallationKitsPage() {
  permanentRedirect(`/shop/${SETUPS_CATEGORY}`);
}
