// TheMealDB API endpoint
const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// DOM Elements
const recipeNameSearchInput = document.getElementById('recipeNameSearch');
const ingredientSearchInput = document.getElementById('ingredientSearch');
const recipeResults = document.getElementById('recipeResults');
const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
const recipeModalBody = document.getElementById('recipeModalBody');
const favoritesList = document.getElementById('favoritesList');
const ingredientSearchBtn = document.getElementById('ingredientSearchBtn');
const cuisineFilterSelect = document.getElementById('cuisineFilter');
const searchByCuisineBtn = document.createElement('button');

// Cuisine types for filter (categories available in TheMealDB)
const cuisineTypes = [
  'All', 'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian', 'French',
  'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican', 'Japanese', 'Kenyan', 'Malaysian',
  'Mexican', 'Moroccan', 'Polish', 'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian',
  'Turkish', 'Vietnamese'
];

// Populate cuisine filter options
cuisineFilterSelect.innerHTML = '';
cuisineTypes.forEach(cuisine => {
  const option = document.createElement('option');
  option.value = cuisine.toLowerCase();
  option.textContent = cuisine;
  cuisineFilterSelect.appendChild(option);
});

// Event listeners
nameSearchBtn.addEventListener('click', () => searchRecipes('name'));
ingredientSearchBtn.addEventListener('click', () => searchRecipes('ingredient'));
document.addEventListener('DOMContentLoaded', loadFavorites);

// Adding button and event for cuisine types search
searchByCuisineBtn.textContent = 'Cerca per Cucina';
searchByCuisineBtn.className = 'btn btn-primary mt-2';
searchByCuisineBtn.addEventListener('click', searchByCuisine);
cuisineFilterSelect.parentNode.appendChild(searchByCuisineBtn);

// Search recipes
async function searchRecipes(searchType) {
  const cuisine = cuisineFilterSelect.value;
  let searchTerm, url;

  if (searchType === 'name') {
    searchTerm = recipeNameSearchInput.value;
    if (!searchTerm) {
      alert('Please enter a recipe name');
      return;
    }
    url = `${API_BASE_URL}/search.php?s=${encodeURIComponent(searchTerm)}`;
  } else {
    searchTerm = ingredientSearchInput.value;
    if (!searchTerm) {
      alert('Please enter at least one ingredient');
      return;
    }
    url = `${API_BASE_URL}/filter.php?i=${encodeURIComponent(searchTerm)}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      let filteredMeals = data.meals;

      if (cuisine) {
        const cuisineResponse = await fetch(`${API_BASE_URL}/filter.php?a=${encodeURIComponent(cuisine)}`);
        const cuisineData = await cuisineResponse.json();
        if (cuisineData.meals) {
          const cuisineMealIds = new Set(cuisineData.meals.map(meal => meal.idMeal));
          filteredMeals = filteredMeals.filter(meal => cuisineMealIds.has(meal.idMeal));
        }
      }

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

// View Recipe Details
async function viewRecipeDetails(recipeId) {
  try {
    const url = `${API_BASE_URL}/lookup.php?i=${recipeId}`;
    const response = await fetch(url);
    const data = await response.json();
    const recipe = data.meals[0];

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (recipe[`strIngredient${i}`]) {
        ingredients.push(`${recipe[`strIngredient${i}`]} - ${recipe[`strMeasure${i}`]}`);
      }
    }

    recipeModalBody.innerHTML = `
            <h2>${recipe.strMeal}</h2>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" class="img-fluid mb-3">
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
            <h3>Instructions:</h3>
            <p>${recipe.strInstructions}</p>
        `;

    recipeModal.show();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    alert('Error fetching recipe details. Please try again later.');
  }
}

// Toggle Favorites
function toggleFavorite(recipe) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const index = favorites.findIndex(fav => fav.idMeal === recipe.idMeal);

  if (index === -1) {
    favorites.push({
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strMealThumb: recipe.strMealThumb
    });
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

// Load favorites
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favoritesList.innerHTML = '';

  favorites.forEach(favorite => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      <a href="#" class="favorite-recipe-link" data-id="${favorite.idMeal}">
        ${favorite.strMeal}
      </a>
      <button class="btn btn-sm btn-danger remove-favorite" data-id="${favorite.idMeal}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    // Event to favorite recipes modal
    li.querySelector('.favorite-recipe-link').addEventListener('click', (e) => {
      e.preventDefault();
      viewRecipeDetails(favorite.idMeal);
    });

    li.querySelector('.remove-favorite').addEventListener('click', () => toggleFavorite(favorite));
    favoritesList.appendChild(li);
  });
}

// Search by cuisine type
async function searchByCuisine() {
  const selectedCuisine = cuisineFilterSelect.value;

  try {
    // Fetch recipes by area (cuisine)
    const url = `${API_BASE_URL}/filter.php?a=${encodeURIComponent(selectedCuisine)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.meals) {
      displayRecipes(data.meals);
    } else {
      recipeResults.innerHTML = '<p>Nessuna ricetta trovata per questa cucina.</p>';
    }
  } catch (error) {
    console.error('Errore nel recuperare le ricette per cucina:', error);
    recipeResults.innerHTML = '<p class="text-danger">Errore nel recuperare le ricette. Riprova più tardi.</p>';
  }
}
















