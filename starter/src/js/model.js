import { API_URL, API_KEY, RES_PER_PAGE } from './config';
import { AJAX } from './helpers';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
    sorted: false,
  },
  bookmarks: [],
};

function createRecipeObject(data) {
  let { recipe } = data.data;

  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
}

export async function loadRecipe(id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);
    state.recipe = createRecipeObject(data);
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
    return state.recipe;
  } catch (err) {
    throw err;
  }
}

export async function loadSearchResults(query) {
  try {
    state.search.query = query;
    state.search.sorted = false;
    const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        image: rec.image_url,
        publisher: rec.publisher,
        title: rec.title,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
}

export function getSearchResultsPage(results, page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return results.slice(start, end);
}

export function updateServings(newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
}

function persistBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
}

export function addBookmark(recipe) {
  // add bookmark
  state.bookmarks.push(recipe);

  // mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
}

export function deleteBookmark(id) {
  const index = state.bookmarks.findIndex(el => el.id === id);

  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
}

function init() {
  const storage = localStorage.getItem('bookmarks');

  if (storage) state.bookmarks = JSON.parse(storage);
}
init();

function clearBookmarks() {
  localStorage.clear('bookmarks');
}

export async function uploadRecipe(newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(([key, value]) => key.startsWith('ingredient') && value !== '')
      .reduce((results, [key, value]) => {
        const [, index, property] = key.split('-');
        const ingNum = index.padStart(2, '0');

        if (!results[ingNum])
          results[ingNum] = { quantity: '', unit: '', description: '' };

        switch (property) {
          case 'quantity':
          case 'unit':
          case 'description':
            results[ingNum][property] =
              value !== '' ? (isNaN(value) ? value : +value) : '';
            break;
          default:
            break;
        }

        return results;
      }, []);

    const ingredientsArr = Object.values(ingredients);

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients: ingredientsArr,
    };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
}

export async function getRecipeDuration() {
  try {
    const recipePromise = state.search.results.map(async recipe => {
      const id = recipe.id;
      const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

      const cookingTime = data.data.recipe.cooking_time;
      recipe.cookingTime = cookingTime;
      return cookingTime;
    });

    state.search.results.sortedRecipe = await Promise.all(recipePromise);
    sortRecipes();
  } catch (err) {
    throw err;
  }
}

function sortRecipes() {
  const sortedResults = [...state.search.results];
  sortedResults.sort((a, b) => {
    return +a.cookingTime - +b.cookingTime;
  });
  state.search.sortedResults = sortedResults;
}

export function resetPage() {
  state.search.page = 1;
}

export function setSorted() {
  state.search.sorted = !state.search.sorted;
}

// clearBookmarks();

// loadSearchResults('pasta');

// sort by cooking duration
// for each recipe get recipe ajax call using id
// get cooking time from recipe call
// add cooking time to recipes
// sort by cooking time
