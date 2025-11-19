(function () {
  let searchModal = null;
  let searchResults = [];

  function toggleSearch() {
    if (!searchModal) createSearchModal();
    searchModal.classList.toggle('active');
    if (searchModal.classList.contains('active')) {
      document.getElementById('searchInput').focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      clearSearchResults();
    }
  }

  function createSearchModal() {
    searchModal = document.createElement('div');
    searchModal.className = 'search-modal';
    searchModal.innerHTML = `
      <div class="search-modal-overlay" onclick="toggleSearch()"></div>
      <div class="search-modal-content">
        <div class="search-header">
          <div class="search-input-container">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input type="text" id="searchInput" placeholder="Search programs, campaigns, or content..." autocomplete="off">
            <button class="search-close" onclick="toggleSearch()" aria-label="Close search">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="search-body">
          <div id="searchResultsContainer" class="search-results"></div>
          <div id="searchEmptyState" class="search-empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <p>Type to search programs, campaigns, or content</p>
          </div>
          <div id="searchNoResults" class="search-no-results" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No results found</p>
            <small>Try different keywords</small>
          </div>
        </div>
        <div class="search-footer">
          <div class="search-tips">
            <span class="search-tip"><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span class="search-tip"><kbd>Enter</kbd> Select</span>
            <span class="search-tip"><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (window.debounce || ((fn)=>fn))(handleSearch, 300));
    searchInput.addEventListener('keydown', handleSearchKeyboard);
  }

  function handleSearch(event) {
    const query = event.target.value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResultsContainer');
    const emptyState = document.getElementById('searchEmptyState');
    const noResults = document.getElementById('searchNoResults');

    if (!query) {
      clearSearchResults();
      return;
    }
    emptyState.style.display = 'none';
    noResults.style.display = 'none';

    searchResults = performSearch(query);

    if (searchResults.length === 0) {
      resultsContainer.innerHTML = '';
      noResults.style.display = 'flex';
      return;
    }
    displaySearchResults(searchResults);
  }

  function performSearch(query) {
    const results = [];

    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      const icon = card.querySelector('.program-icon')?.textContent || '';
      if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
        results.push({ type: 'Program', title, description: description.substring(0, 150) + '...', icon, section: 'programs', element: card });
      }
    });

    const campaignCards = document.querySelectorAll('.campaign-card');
    campaignCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
        results.push({ type: 'Campaign', title, description, icon: '🎯', section: 'campaigns', element: card });
      }
    });

    const givingCards = document.querySelectorAll('.giving-card');
    givingCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      const icon = card.querySelector('.giving-icon')?.textContent || '';
      if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
        results.push({ type: 'Giving Option', title, description: description.substring(0, 150) + '...', icon, section: 'ways-to-give', element: card });
      }
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      const title = card.querySelector('h3')?.textContent || '';
      const description = card.querySelector('p')?.textContent || '';
      if (title.toLowerCase().includes(query) || description.toLowerCase().includes(query)) {
        results.push({ type: 'Project', title, description, icon: '🏗️', section: 'projects', element: card });
      }
    });

    const regionCards = document.querySelectorAll('.region-card');
    regionCards.forEach(card => {
      const text = card.textContent || '';
      if (text.toLowerCase().includes(query)) {
        results.push({ type: 'Region', title: text, description: 'Where we work', icon: card.textContent.split(' ')[0], section: 'where-we-work', element: card });
      }
    });

    return results;
  }

  function displaySearchResults(results) {
    const q = (document.getElementById('searchInput')?.value) || '';
    const resultsContainer = document.getElementById('searchResultsContainer');
    resultsContainer.innerHTML = results.map((result, index) => `
      <div class="search-result-item ${index === 0 ? 'active' : ''}" data-index="${index}" onclick="navigateToResult(${index})">
        <div class="search-result-icon">${result.icon}</div>
        <div class="search-result-content">
          <div class="search-result-header">
            <h4>${highlightQuery(result.title, q)}</h4>
            <span class="search-result-type">${result.type}</span>
          </div>
          <p>${highlightQuery(result.description, q)}</p>
        </div>
        <svg class="search-result-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    `).join('');
  }

  function highlightQuery(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  function navigateToResult(index) {
    const result = searchResults[index];
    if (!result) return;

    toggleSearch();

    const section = document.getElementById(result.section);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (result.element) {
        setTimeout(() => {
          result.element.style.transition = 'all 0.3s ease';
          result.element.style.transform = 'scale(1.05)';
          result.element.style.boxShadow = '0 8px 30px rgba(26, 82, 69, 0.3)';
          setTimeout(() => {
            result.element.style.transform = '';
            result.element.style.boxShadow = '';
          }, 1000);
        }, 500);
      }
    }
  }

  function handleSearchKeyboard(event) {
    const resultItems = document.querySelectorAll('.search-result-item');
    const activeItem = document.querySelector('.search-result-item.active');
    let activeIndex = activeItem ? parseInt(activeItem.dataset.index) : -1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (activeIndex < resultItems.length - 1) updateActiveResult(++activeIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (activeIndex > 0) updateActiveResult(--activeIndex);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0) navigateToResult(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        toggleSearch();
        break;
    }
  }

  function updateActiveResult(index) {
    const resultItems = document.querySelectorAll('.search-result-item');
    resultItems.forEach((item, i) => {
      if (i === index) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else item.classList.remove('active');
    });
  }

  function clearSearchResults() {
    const resultsContainer = document.getElementById('searchResultsContainer');
    const emptyState = document.getElementById('searchEmptyState');
    const noResults = document.getElementById('searchNoResults');
    const searchInput = document.getElementById('searchInput');
    if (resultsContainer) resultsContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (noResults) noResults.style.display = 'none';
    if (searchInput) searchInput.value = '';
    searchResults = [];
  }

  window.toggleSearch = toggleSearch;
  window.navigateToResult = navigateToResult;
})();
