import View from './view.js';
import icons from 'url:../../img/icons.svg';

class SortView extends View {
  _parentElement = document.querySelector('.sort');

  renderSortButton() {
    this._parentElement.classList.toggle('hidden');
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler();
    });
  }
}

export default new SortView();
