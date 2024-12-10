// TheMealDB API endpoint
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// DOM Elements
const recipeNameSearchInput = document.getElementById('recipeNameSearch');
const nameSearchBtn = document.getElementById('nameSearchBtn');
const recipeResults = document.getElementById('recipeResults');

// Event listeners
nameSearchBtn.addEventListener('click', () => searchRecipes('name'));


// Search recipes
async function searchRecipes(searchType) {
  let searchTerm, url;

  searchTerm = recipeNameSearchInput.value;
  if (!searchTerm) {
    alert('Please enter a recipe name');
    return;
  }
  url = `${API_BASE_URL}/search.php?s=${encodeURIComponent(searchTerm)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      let filteredMeals = data.meals;

      displayRecipes(filteredMeals);
    } else {
      recipeResults.innerHTML = '<p>No recipes found. Try different search terms or filters.</p>';
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipeResults.innerHTML = '<p class="text-danger">Error fetching recipes. Please try again later.</p>';
  }
}

// Display recipes
function displayRecipes(recipes) {
  recipeResults.innerHTML = '';
  if (recipes.length === 0) {
    recipeResults.innerHTML = '<p>No recipes found. Try different search terms or filters.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    recipeResults.appendChild(card);
  });
}

// Create recipe card
function createRecipeCard(recipe) {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const isFavorite = favorites.some(fav => fav.idMeal === recipe.idMeal);

  const card = document.createElement('div');
  card.className = 'col';
  card.innerHTML = `
    <div class="card recipe-card">
      <img src="${recipe.strMealThumb}" class="card-img-top" alt="${recipe.strMeal}">
      <div class="card-body">
        <h5 class="card-title">${recipe.strMeal}</h5>
        <button class="btn btn-primary btn-sm view-recipe" data-id="${recipe.idMeal}">Vedi Ricetta</button>
        <button class="btn ${isFavorite ? 'btn-danger' : 'btn-outline-primary'} btn-sm favorite-recipe" data-id="${recipe.idMeal}">
          <i class="fas fa-heart"></i>
        </button>
      </div>
    </div>
  `;

  card.querySelector('.view-recipe').addEventListener('click', () => viewRecipeDetails(recipe.idMeal));
  card.querySelector('.favorite-recipe').addEventListener('click', () => toggleFavorite(recipe));

  return card;
}

















