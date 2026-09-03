export function getRegulatedObligationSettingId(value: {
  settingId?: number | null;
}) {
  return value.settingId ?? null;
}
