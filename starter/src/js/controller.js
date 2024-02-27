import icons from 'url:../img/icons.svg';
import { MODEL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';
import addRecipeView from './views/addRecipeView.js';
import sortView from './views/sortView.js';

const recipeContainer = document.querySelector('.recipe');

async function controlRecipes() {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    // render loading spinner
    recipeView.renderSpinner();

    // 1) update results view to mark selected search results
    if (model.state.search.results.sorted) {
      resultsView.update(
        model.getSearchResultsPage(model.state.search.sortedResults)
      );
    } else {
      resultsView.update(
        model.getSearchResultsPage(model.state.search.results)
      );
    }

    // update bookmarks
    bookmarksView.update(model.state.bookmarks);

    // 1) loading Recipe
    await model.loadRecipe(id);

    // 2) rendering recipe
    recipeView.render(model.state.recipe);

    // console.log(model.state.recipe);

    // console.log(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    // console.error(err);
  }
}

controlRecipes(
  'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886'
);

async function controlSearchResults() {
  try {
    // 0) render spinner
    resultsView.renderSpinner();

    // 2) Get search Query
    const query = searchView.getQuery();
    if (!query) return resultsView.renderError();

    // 3) Load search results
    await model.loadSearchResults(query);

    // 4) render results
    resultsView.render(model.getSearchResultsPage(model.state.search.results));

    // 5) Render initial pagination buttons
    paginationView.render(model.state.search);

    // 6) render sort button
    sortView.renderSortButton();

    // console.log(model.state);
  } catch (err) {
    resultsView.renderError();
    console.error(err);
  }
}

function controlPagination(goToPage) {
  if (model.state.search.sorted)
    resultsView.render(
      model.getSearchResultsPage(model.state.search.sortedResults, goToPage)
    );
  if (!model.state.search.sorted)
    resultsView.render(
      model.getSearchResultsPage(model.state.search.results, goToPage)
    );
  paginationView.render(model.state.search);
}

function controlServings(newServings) {
  // update recipe servings (in state)
  model.updateServings(newServings);
  // update the recipe view
  recipeView.update(model.state.recipe);
}

function controlAddBookmark() {
  // 1) add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

function controlBookmarks() {
  bookmarksView.render(model.state.bookmarks);
}

async function controlAddRecipe(newRecipe) {
  try {
    // render the spinner
    addRecipeView.renderSpinner();

    // upload new recipe to the api
    await model.uploadRecipe(newRecipe);

    // render recipe
    recipeView.render(model.state.recipe);

    // success message
    addRecipeView.renderMessage();

    // render bookmarks view
    bookmarksView.render(model.state.bookmarks);

    // change id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // close form window
    setTimeout(function () {
      addRecipeView.hideWindow();
      setTimeout(function () {
        addRecipeView.resetMessage();
      }, 400);
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err);
  }
}

async function controlSort() {
  try {
    // 0) render spinner
    resultsView.renderSpinner();

    // reset page
    model.resetPage();

    if (
      !model.state.search.sorted &&
      model.state.search.sortedResults === undefined
    ) {
      await model.getRecipeDuration();
    }

    if (!model.state.search.sorted) {
      // 4) render results
      resultsView.render(
        model.getSearchResultsPage(model.state.search.sortedResults)
      );
    } else {
      console.log('sorted - unsorted');
      resultsView.render(
        model.getSearchResultsPage(model.state.search.results)
      );
    }
    model.setSorted();

    // 5) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
}

function init() {
  bookmarksView.addHandlerRender(controlBookmarks);
  searchView.addHandlerSearch(controlSearchResults);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  paginationView.addHandlerClick(controlPagination);
  sortView.addHandlerClick(controlSort);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
