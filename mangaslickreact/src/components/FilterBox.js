import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './filterbox.css';

const FILTER_ICONS = {
  genres: '🎭',
  authors: '✍️',
  tags: '🏷️',
  status: '📶',
  year: '📅',
  type: '📚'
};

const STATIC_STATUS = ['Ongoing', 'Completed', 'Hiatus'];
const STATIC_TYPES = ['Manga', 'Manhwa', 'Manhua'];
const STATIC_YEARS = Array.from({ length: 25 }, (_, i) => `${2000 + i}`);

const FilterBox = ({ onFilterChange }) => {
  const [genreOptions, setGenreOptions] = useState([]);
  const [authorOptions, setAuthorOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [activeFilterType, setActiveFilterType] = useState(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileSelectedType, setMobileSelectedType] = useState(null);

  const [selectedFilters, setSelectedFilters] = useState({
    genres: [],
    authors: [],
    tags: [],
    status: [],
    type: [],
    year: []
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await axios.get('https://api.mangadex.org/manga', {
          params: {
            limit: 100,
            offset: 0
          }
        });

        const data = response.data.data;
        const genresSet = new Set();
        const authorsSet = new Set();
        const tagsSet = new Set();

        data.forEach((manga) => {
          manga.relationships?.forEach((rel) => {
            if (rel.type === 'tag' && rel.attributes?.name?.en) {
              tagsSet.add(rel.attributes.name.en.toLowerCase());
            }

            if (rel.type === 'author' && rel.attributes?.name) {
              authorsSet.add(rel.attributes.name.toLowerCase());
            }
          });

          if (manga.attributes?.publicationDemographic) {
            genresSet.add(manga.attributes.publicationDemographic.toLowerCase());
          }
        });

        setGenreOptions([...genresSet]);
        setAuthorOptions([...authorsSet]);
        setTagOptions([...tagsSet]);
      } catch (error) {
        console.error('Error fetching filter options:', error.message);
      }
    };

    fetchOptions();
  }, []);

  const handleTagToggle = (type, value) => {
    const updated = selectedFilters[type].includes(value)
      ? selectedFilters[type].filter(v => v !== value)
      : [...selectedFilters[type], value];

    setSelectedFilters({ ...selectedFilters, [type]: updated });
  };

  const handleTagRemove = (type, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [type]: selectedFilters[type].filter(v => v !== value)
    });
  };

  const applyFilters = () => {
    onFilterChange(selectedFilters);
    setIsMobileModalOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters({
      genres: [],
      authors: [],
      tags: [],
      status: [],
      type: [],
      year: []
    });
  };

  const filterData = [
    { key: 'genres', label: 'Genres', options: genreOptions },
    { key: 'authors', label: 'Authors', options: authorOptions },
    { key: 'tags', label: 'Tags', options: tagOptions },
    { key: 'status', label: 'Status', options: STATIC_STATUS },
    { key: 'type', label: 'Type', options: STATIC_TYPES },
    { key: 'year', label: 'Year', options: STATIC_YEARS }
  ];

  const renderOptions = (type, options) => (
    <div className="filter-options">
      {options && options.length > 0 ? (
        options.sort().map((option) => (
          <button
            key={option}
            className={`filter-button ${selectedFilters[type].includes(option) ? 'selected' : ''}`}
            onClick={() => handleTagToggle(type, option)}
          >
            {option}
          </button>
        ))
      ) : (
        <p>No options available</p>
      )}
    </div>
  );

  return (
    <div className="filter-box">
      <div className="filter-header">
        <h3>Filters</h3>
        <div className="filter-actions">
          <button onClick={applyFilters} className="apply-btn">Apply</button>
          <button onClick={clearFilters} className="clear-btn">Clear All</button>
        </div>
      </div>

      {/* Desktop View */}
      <div className="desktop-view">
        {filterData.map(({ key, label, options }) => (
          <div key={key} className="filter-section">
            <p onClick={() => setActiveFilterType(activeFilterType === key ? null : key)}>
              <span className="filter-type">
                {label.toUpperCase()} <span className="icon">{FILTER_ICONS[key]}</span>:
              </span>
              <span className="toggle-icon">{activeFilterType === key ? '▲' : '▼'}</span>
            </p>

            {selectedFilters[key].length > 0 && (
              <div className="selected-tags">
                {selectedFilters[key].map(tag => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button className="remove" onClick={() => handleTagRemove(key, tag)}>✕</button>
                  </span>
                ))}
              </div>
            )}

            {activeFilterType === key && renderOptions(key, options)}
          </div>
        ))}
      </div>

      {/* Mobile Button */}
      <div className="mobile-view">
        <button className="mobile-filter-toggle" onClick={() => setIsMobileModalOpen(true)}>📋 Open Filters</button>
      </div>

      {/* Mobile Modal */}
      {isMobileModalOpen && (
        <div className="mobile-modal">
          <div className="mobile-modal-header">
            <h4>Select Filter Type</h4>
            <button onClick={() => setIsMobileModalOpen(false)}>✕</button>
          </div>
          {!mobileSelectedType ? (
            <div className="mobile-filter-list">
              {filterData.map(({ key, label }) => (
                <button
                  key={key}
                  className="filter-type-button"
                  onClick={() => setMobileSelectedType(key)}
                >
                  {label} {FILTER_ICONS[key]}
                </button>
              ))}
            </div>
          ) : (
            <div className="mobile-tag-list">
              <h5>
                {mobileSelectedType.toUpperCase()} <button onClick={() => setMobileSelectedType(null)}>← Back</button>
              </h5>
              {renderOptions(mobileSelectedType, filterData.find(f => f.key === mobileSelectedType)?.options || [])}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBox;
