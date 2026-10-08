import { useId } from "react";
import { LocaleText } from "@/components/locale/locale-text";
import { LOCALES, type Localized, mapLocalized } from "@/content/locales";
import {
  type ByProfile,
  PROFILES,
  type Profile,
  isProfile,
} from "@/content/profiles";
import type { ConnectText } from "@/content/types";
import { SERVER } from "@/engine/catalog";
import { DisabledCheckRow, FieldRow } from "./field-row";
import styles from "./connect-dialog.module.css";

const MASKED_PASSWORD = "••••••••";

type LoginText = ConnectText["login"];

interface LoginFieldsProps {
  text: Localized<LoginText>;
  login: Localized<ByProfile<string>>;
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
}

export function LoginFields({
  text,
  login,
  profile,
  onProfileChange,
}: Readonly<LoginFieldsProps>) {
  const id = useId();

  function label(pick: (entry: LoginText) => string) {
    return <LocaleText text={mapLocalized(text, pick)} />;
  }

  return (
    <>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          {label((entry) => entry.server)}
        </legend>
        <FieldRow
          label={label((entry) => entry.serverType)}
          labelId={`${id}-type`}
          disabled
        >
          {LOCALES.map((locale) => (
            <select
              key={locale}
              lang={locale}
              data-locale-block={locale}
              className={styles.input}
              aria-labelledby={`${id}-type`}
              defaultValue="engine"
              disabled
            >
              <option value="engine">{text[locale].serverTypeValue}</option>
            </select>
          ))}
        </FieldRow>
        <FieldRow
          label={label((entry) => entry.serverName)}
          labelId={`${id}-name`}
        >
          <input
            className={styles.input}
            aria-labelledby={`${id}-name`}
            value={SERVER.name}
            autoComplete="off"
            readOnly
          />
        </FieldRow>
        <FieldRow
          label={label((entry) => entry.authentication)}
          labelId={`${id}-authentication`}
        >
          {LOCALES.map((locale) => (
            <select
              key={locale}
              lang={locale}
              data-locale-block={locale}
              className={styles.input}
              aria-labelledby={`${id}-authentication`}
              value={profile}
              onChange={(event) => {
                if (isProfile(event.target.value)) {
                  onProfileChange(event.target.value);
                }
              }}
            >
              {PROFILES.map((option) => (
                <option key={option} value={option}>
                  {text[locale].profiles[option]}
                </option>
              ))}
            </select>
          ))}
        </FieldRow>
        <FieldRow
          label={label((entry) => entry.userName)}
          labelId={`${id}-user`}
          indent
          disabled
        >
          {LOCALES.map((locale) => (
            <input
              key={locale}
              lang={locale}
              data-locale-block={locale}
              className={styles.input}
              aria-labelledby={`${id}-user`}
              value={login[locale][profile]}
              disabled
            />
          ))}
        </FieldRow>
        <FieldRow
          label={label((entry) => entry.password)}
          labelId={`${id}-password`}
          indent
          disabled
        >
          <input
            className={styles.input}
            aria-labelledby={`${id}-password`}
            value={MASKED_PASSWORD}
            disabled
          />
        </FieldRow>
        <DisabledCheckRow label={label((entry) => entry.rememberPassword)} />
      </fieldset>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>
          {label((entry) => entry.security)}
        </legend>
        <FieldRow
          label={label((entry) => entry.encryption)}
          labelId={`${id}-encryption`}
          disabled
        >
          {LOCALES.map((locale) => (
            <select
              key={locale}
              lang={locale}
              data-locale-block={locale}
              className={styles.input}
              aria-labelledby={`${id}-encryption`}
              defaultValue="optional"
              disabled
            >
              <option value="optional">{text[locale].encryptionValue}</option>
            </select>
          ))}
        </FieldRow>
        <DisabledCheckRow label={label((entry) => entry.trustCertificate)} />
        <FieldRow
          label={label((entry) => entry.hostName)}
          labelId={`${id}-host`}
          disabled
        >
          <input
            className={styles.input}
            aria-labelledby={`${id}-host`}
            disabled
          />
        </FieldRow>
      </fieldset>
    </>
  );
}
