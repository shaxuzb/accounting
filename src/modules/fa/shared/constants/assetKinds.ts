import { faDocumentAccountRoleCodes } from "./documentAccounts";

/** The asset registry keeps both kinds, one kind per document (1C has its own NMA documents). */
export const faAssetKinds = { fixed: 1, intangible: 2 } as const;
export type FaAssetKindId = (typeof faAssetKinds)[keyof typeof faAssetKinds];

export const faAssetKindLabels: Record<number, string> = {
  [faAssetKinds.fixed]: "fa.kinds.fixed",
  [faAssetKinds.intangible]: "fa.kinds.intangible",
};

/** The kind a new document starts with: `?kind=2` opens an intangible one. */
export const faAssetKindFromParams = (params: URLSearchParams): FaAssetKindId =>
  Number(params.get("kind")) === faAssetKinds.intangible
    ? faAssetKinds.intangible
    : faAssetKinds.fixed;

const intangibleRoles: Record<string, string> = {
  [faDocumentAccountRoleCodes.fixedAsset]: "intangible_asset",
  [faDocumentAccountRoleCodes.capitalInvestment]: "intangible_investment",
  [faDocumentAccountRoleCodes.accumulatedDepreciation]: "accumulated_amortization",
  [faDocumentAccountRoleCodes.disposal]: "intangible_disposal",
  [faDocumentAccountRoleCodes.disposalGain]: "intangible_disposal_gain",
  [faDocumentAccountRoleCodes.revaluationReserve]: "intangible_revaluation_reserve",
};

/** The account role for the kind: an intangible asset takes 04xx / 05xx / 0830 / 9220 / 9320 / 8510.2 (as the server's ForKind). */
export const faKindRole = (assetKindId: number | null | undefined, role: string) =>
  assetKindId === faAssetKinds.intangible ? (intangibleRoles[role] ?? role) : role;

const intangibleLabels: Record<string, string> = {
  "fa.fields.faAssetId": "fa.intangible.asset",
  "fa.fields.faGroupId": "fa.intangible.group",
  "fa.fields.assetAccount": "fa.intangible.account",
  "fa.sections.assetNumber": "fa.intangible.assetNumber",
  "fa.entities.assets": "fa.kinds.intangible",
};

/** A fixed-asset wording or its intangible counterpart («Asosiy vosita» → «Nomoddiy aktiv»). */
export const faKindLabel = (assetKindId: number | null | undefined, key: string) =>
  assetKindId === faAssetKinds.intangible ? (intangibleLabels[key] ?? key) : key;
