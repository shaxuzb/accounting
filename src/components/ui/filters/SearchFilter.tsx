import { Input } from "antd";
import { Search } from "lucide-react";
import { useState, useEffect, type FC } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
interface ClientFilterProps {
  clear?: boolean;
}
const SearchFilter: FC<ClientFilterProps> = () => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valueStr = event.target.value;
    setValue(valueStr);
    if (valueStr === "") {
      searchParams.delete("search");
    }
  };

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    const valueInterval = setTimeout(() => {
      if (value) {
        // a new search starts from the first page — an old page number can lie past
        // the end of the shorter result
        if (value !== searchParams.get("search")) newParams.delete("page");
        newParams.set("search", value);
      } else {
        setValue(searchParams.get("search") || "");
      }
      setSearchParams(newParams, { replace: true });
    }, 500);
    return () => {
      clearTimeout(valueInterval);
    };
  }, [value, searchParams, setSearchParams]);
  return (
    <div className="flex flex-col gap-1 relative">
      <Input
        prefix={<Search className="size-4 text-muted-second!" />}
        value={value}
        min="1"
        id="number"
        name="number"
        placeholder={t("common.search")}
        onChange={handleChange}
        className="w-full! h-8 [&_input]:h-5.5!"
      />
    </div>
  );
};

export default SearchFilter;
