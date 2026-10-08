import { LocaleText } from "@/components/locale/locale-text";
import type { Localized } from "@/content/locales";
import { type ByProfile, PROFILES } from "@/content/profiles";

export function ProfileText({
  text,
}: Readonly<{ text: ByProfile<Localized> }>) {
  return PROFILES.map((profile) => (
    <span key={profile} data-profile-block={profile}>
      <LocaleText text={text[profile]} />
    </span>
  ));
}
