interface SearchHighlightProps {
  text?: string | null;
  search?: string;
  /** Shown when there is no text. */
  empty?: string;
}

/** Marks the part of a table cell the list search matched. */
export default function SearchHighlight({
  text,
  search,
  empty = "—",
}: SearchHighlightProps) {
  if (!text) return <>{empty}</>;
  if (!search) return <>{text}</>;
  const index = text.toLowerCase().indexOf(search.toLowerCase());
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-yellow-200 px-0.5 text-inherit dark:bg-yellow-700">
        {text.slice(index, index + search.length)}
      </mark>
      {text.slice(index + search.length)}
    </>
  );
}
