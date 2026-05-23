import { HiOutlineSearch } from 'react-icons/hi';

const SearchFilter = ({ searchValue, onSearchChange, placeholder = 'Search...', filters = [], onFilterChange, filterValues = {} }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="relative flex-1">
      <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
      <input
        type="text"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
        id="search-input"
      />
    </div>
    {filters.map((filter) => (
      <select
        key={filter.key}
        value={filterValues[filter.key] || ''}
        onChange={(e) => onFilterChange(filter.key, e.target.value)}
        className="input-field w-full sm:w-44"
        id={`filter-${filter.key}`}
      >
        <option value="">{filter.label}</option>
        {filter.options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    ))}
  </div>
);

export default SearchFilter;
