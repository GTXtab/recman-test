import React from "react";
import type { TFilter } from "../types/data";
import IconButton from "./common/IconButton";

interface Props {
  filter: TFilter;
  onFilterChange: (filter: TFilter) => void;
  onAddColumn: () => void;
}

const FilterAndAddColumn: React.FC<Props> = ({ filter, onFilterChange, onAddColumn }) => {
  return (
    <div className="flex gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter
        </label>
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value as TFilter)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:shadow-md transition-all duration-200 bg-white text-base"
        >
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Uncompleted</option>
        </select>
      </div>
      <div className="flex items-end">
        <IconButton
          onClick={onAddColumn}
          icon={undefined}
          label="Add column"
          variant="primary"
          className="h-[52px] text-base rounded-xl"
        />
      </div>
    </div>
  );
};

export default FilterAndAddColumn;
