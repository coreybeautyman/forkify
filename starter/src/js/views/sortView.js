import View from './view.js';
import icons from 'url:../../img/icons.svg';

class SortView extends View {
  _parentElement = document.querySelector('.sort');

  toggleSortBtn() {
    this._parentElement.classList.toggle('hidden');
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;

      handler();
    });
  }
}

export default new SortView();
