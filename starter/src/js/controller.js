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
  resultsView.render(model.getSearchResultsPage(goToPage));
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

    console.log(model.state.recipe);

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
      addRecipeView.toggleWindow();
    }, MODEL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log(err);
    addRecipeView.renderError(err);
  }
}

async function controlSort() {
  try {
    // 0) render spinner
    resultsView.renderSpinner();
    console.log(model.state.search.results.sorted);

    if (
      !model.state.search.sorted &&
      !model.state.search.sortedResults?.length
    ) {
      await model.getRecipeDuration();
    }

    debugger;

    if (!model.state.sorted) {
      // 4) render results
      resultsView.render(
        model.getSearchResultsPage(model.state.search.sortedResults)
      );
    } else {
      resultsView.render(
        model.getSearchResultsPage(model.state.search.results)
      );
    }
    model.setSorted();

    // 5) Render initial pagination buttons
    paginationView.render(model.state.search);

    // console.log(model.state.search.results);
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
  console.log('welcome');
}
init();

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////
