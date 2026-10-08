export const PROFILES = ["visitor", "dev"] as const;

export type Profile = (typeof PROFILES)[number];

export type ByProfile<T> = Record<Profile, T>;

export const DEFAULT_PROFILE: Profile = "visitor";

export function byProfile<T>(pick: (profile: Profile) => T): ByProfile<T> {
  return { visitor: pick("visitor"), dev: pick("dev") };
}

export function isProfile(value: unknown): value is Profile {
  return PROFILES.some((profile) => profile === value);
}
