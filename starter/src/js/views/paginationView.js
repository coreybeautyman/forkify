import View from './view.js';
import icons from 'url:../../img/icons.svg';

class paginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;

      handler(goToPage);
    });
  }

  _generateLeftArrow(page) {
    return `<button data-goto="${
      page - 1
    }" class="btn--inline pagination__btn--prev">
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-left"></use>
    </svg>
    <span>Page ${page - 1}</span>
  </button>
`;
  }
  _generateRightArrow(page) {
    return `
    <button data-goto="${page + 1}"  class="btn--inline pagination__btn--next">
      <span>Page ${page + 1}</span>
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-right"></use>
      </svg>
    </button>`;
  }

  _generateCurrPage(page, numPages) {
    return `  <span class="pagination__currPage">
    <span>${page}/${numPages}</span>
  </span>
`;
  }

  _generateEmptyButton() {
    return `<button class="hidden btn--inline pagination__btn--prev">
    <svg class="search__icon">
      <use href="${icons}#icon-arrow-left"></use>
    </svg>
    <span>Page x</span>
  </button>`;
  }

  _generateMarkup() {
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    // page 1 and there are other pages
    if (this._data.page === 1 && numPages > 1)
      return `${this._generateEmptyButton()}${this._generateCurrPage(
        this._data.page,
        numPages
      )}${this._generateRightArrow(this._data.page)}`;

    // last page
    if (this._data.page === numPages && numPages > 1)
      return `${this._generateLeftArrow(
        this._data.page
      )}${this._generateCurrPage(
        this._data.page,
        numPages
      )}${this._generateEmptyButton()}`;

    // other page
    if (this._data.page < numPages)
      return `${this._generateLeftArrow(
        this._data.page
      )}${this._generateCurrPage(
        this._data.page,
        numPages
      )}${this._generateRightArrow(this._data.page)}`;

    // page 1 and there are other pages
    return ``;
  }
}

export default new paginationView();
