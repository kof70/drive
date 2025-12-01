import { useCanvasStore } from "@/client/stores/canvasStore";
import React, { useState } from "react";
import { Input } from "../../ui/input";
import { MapPin, PinIcon } from "lucide-react";

interface RepereSearchBarProps {
  onFocusRepere: (repereId: string) => void;
}

export const RepereSearchBar: React.FC<RepereSearchBarProps> = ({
  onFocusRepere,
}) => {
  const { elements } = useCanvasStore();
  const repereList = elements.filter(
    (el) =>
      el.type === "rectangleGroup" &&
      typeof el.content === "object" &&
      el.content !== null &&
      "name" in el.content,
  );

  const getRepereName = (repere: (typeof repereList)[number]) => {
    if (
      typeof repere.content === "object" &&
      repere.content !== null &&
      "name" in repere.content
    ) {
      return (repere.content as any).name || "";
    }
    return "";
  };

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<typeof repereList>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setResults(
      repereList.filter((r) =>
        getRepereName(r).toLowerCase().includes(value.toLowerCase()),
      ),
    );
  };

  return (
    <div className="flex flex-col gap-2 p-2 w-72 absolute top-4 left-1/2 -translate-x-1/2 z-50">
      <Input
        type="text"
        placeholder="Rechercher un repère par nom..."
        value={query}
        onChange={handleSearch}
        className="border bg-background rounded-full  p-2s"
      />
      {results.length > 0 && (
        <ul className="bg-white rounded-xl shadow p-1 max-h-48 overflow-y-auto">
          {results.map((r) => (
            <li
              key={r.id}
              className="cursor-pointer flex items-center gap-2 hover:bg-blue-100 text-sm p-1 rounded-lg"
              onClick={() => {
                onFocusRepere(r.id);
                setQuery("");
                setResults([]);
              }}
              style={{
                color:r.style.borderColor
              }}
            >
              <MapPin size={16} style={{ fill:r.style.backgroundColor, borderColor:r.style.borderColor }}/>
              {getRepereName(r)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
