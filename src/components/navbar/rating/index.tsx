import { useQuery } from "@tanstack/react-query";
import { Tooltip } from "antd";
import { Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { $axiosPrivate } from "@/services/AxiosService";
import { useAppSelector } from "@/store/hooks";

interface OrganizationRating {
  inn: string;
  name: string;
  /** The rating class: AAA, AA, A, BBB … as chamber.uz gives it. */
  rating: string | null;
  /** Points out of 100. */
  score: number;
  activity: string | null;
}

const RATING_PAGE = "https://chamber.uz/oz/contractor-rating";

// A-classes are good, B-classes middling, the rest weak
const toneFor = (rating: string | null) => {
  if (rating?.startsWith("A")) return "border-green-200 bg-green-50 text-green-700!";
  if (rating?.startsWith("B")) return "border-amber-200 bg-amber-50 text-amber-700!";
  return "border-red-200 bg-red-50 text-red-700!";
};

/**
 * The current organization's contractor rating from the Chamber of Commerce (chamber.uz),
 * shown in the header; a click opens the rating page there.
 */
const OrganizationRatingBadge = () => {
  const { t } = useTranslation();
  const organizationId = useAppSelector((state) => state.organization.id);

  const { data } = useQuery({
    queryKey: ["organizations", "current", "rating", organizationId],
    queryFn: async () =>
      (await $axiosPrivate.get<OrganizationRating | null>("/organizations/current/rating")).data,
    enabled: Boolean(organizationId),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  if (!data) return null;

  return (
    <Tooltip
      title={
        <div className="text-xs">
          <div className="font-semibold">{data.name}</div>
          {data.activity && <div>{data.activity}</div>}
          <div>{t("rating.score", { score: data.score })}</div>
          <div className="mt-1 opacity-80">{t("rating.source")}</div>
        </div>
      }
    >
      <a
        href={RATING_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium whitespace-nowrap ${toneFor(data.rating)}`}
      >
        <Award className="size-4" />
        <span>{t("rating.title")}:</span>
        <span className="font-semibold">{data.rating ?? "-"}</span>
        <span className="opacity-75">· {data.score}</span>
      </a>
    </Tooltip>
  );
};

export default OrganizationRatingBadge;
