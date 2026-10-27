import notionists from "@dicebear/styles/notionists.json";
import { configureAvatars } from "@/lib/dicebear";

/**
 * Payra's avatar look: DiceBear "Notionists" line portraits on the brand's yellow-green, so
 * every beneficiary gets a face that is stable for their name across the whole app.
 */
configureAvatars({
  style: notionists,
  options: { backgroundColor: "#ECF0AF" },
});
