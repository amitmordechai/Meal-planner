const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CATEGORIES = ["Breakfast", "Lunch", "Dinner"];

let familyMembers = ["Ofir", "Maayan", "Amit", "Romy", "Hadar", "Libby"];

let mealOptions = {
    Breakfast: ["Scrambled Eggs", "Pancakes"],
    Lunch: ["Pasta", "Salad"],
    Dinner: ["Soup", "Chicken and potatoes"]
};

let mealIngredients = {
    "Scrambled Eggs": ["Eggs", "Butter"],
    "Pancakes": ["Flour", "Milk", "Eggs", "Sugar"],
    "Pasta": ["Pasta", "Tomato sauce"],
    "Salad": ["Lettuce", "Tomato", "Onion"],
    "Soup": ["Vegetables"],
    "Chicken and potatoes": ["Chicken", "Potatoes"]
};


let mealData = {};
let shoppingList = [];
let extraItems = [];

//reset week
function createEmptyWeek(){
    const data = {};
    DAYS.forEach(day => {
        data[day] = {};
        CATEGORIES.forEach(cat => {
            data[day][cat] = Array(familyMembers.length).fill("");
        });
    });
    return data;
};


//save data in local storage
function saveData(){
    localStorage.setItem("mealData", JSON.stringify(mealData));
    localStorage.setItem("familyMembers", JSON.stringify(familyMembers));
    localStorage.setItem("mealOptions", JSON.stringify(mealOptions));
    localStorage.setItem("mealIngredients", JSON.stringify(mealIngredients));
    localStorage.setItem("shoppingList", JSON.stringify(shoppingList));
    localStorage.setItem("extraItems", JSON.stringify(extraItems));
};

//load data
function loadData(){
    mealData = JSON.parse(localStorage.getItem("mealData"))||createEmptyWeek();
    familyMembers = JSON.parse(localStorage.getItem("familyMembers"))||familyMembers;
    mealOptions = JSON.parse(localStorage.getItem("mealOptions"))||mealOptions;
    mealIngredients = JSON.parse(localStorage.getItem("mealIngredients"))||mealIngredients;
    shoppingList = JSON.parse(localStorage.getItem("shoppingList"))||[];
    extraItems = JSON.parse(localStorage.getItem("extraItems"))||[];
};


//feedback
function showFeedback(text){
    const box = document.getElementById("feedback");
    box.textContent = text;
    box.classList.add("show");
    setTimeout(() => box.classList.remove("show"), 1500);
};

//views
const views = document.querySelectorAll(".view");
function showView(id){
    views.forEach(view => view.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
};


//buttons
document.addEventListener("click", e => {
    const action = e.target.dataset.action;
    if(!action) return;

    if(action === "open-planner"){
        showView("view_planner");
        buildMealPlanner();
    }

    if(action === "open-shopping"){
        showView("view_shopping");
        renderShoppingList();
    }

    if(action === "open-overview"){
        showView("view_overview");
        renderOverview();
    }

    if(action === "back"){
        showView("view_dashboard");
    }

    if(action === "reset"){
        if(confirm("Are you sure you want to reset the week?")){
            mealData = createEmptyWeek();
            shoppingList = [];
            mealOptions = {
                Breakfast: ["Scrambled Eggs", "Pancakes"],
                Lunch: ["Pasta", "Salad"],
                Dinner: ["Soup", "Chicken and potatoes"]
            };
            mealIngredients = {
                "Scrambled Eggs": ["Eggs", "Butter"],
                "Pancakes": ["Flour", "Milk", "Eggs", "Sugar"],
                "Pasta": ["Pasta", "Tomato sauce"],
                "Salad": ["Lettuce", "Tomato", "Onion"],
                "Soup": ["Vegetables"],
                "Chicken and potatoes": ["Chicken", "Potatoes"]
            };
            updateShoppingList();
            saveData();
            showView("view_dashboard");
            showFeedback("Week reset!")
        };
    }

    if(action === "add-member"){
        const name = prompt("enter family member name:");
        if(!name) return;

        familyMembers.push(name);

        DAYS.forEach(day => {
            CATEGORIES.forEach(cat => {
                mealData[day][cat].push("");
            });
        });
        saveData();
        showFeedback(name + " added");
    }

    if(action === "remove-member"){
        const name = prompt("Enter the name you want to remove:");
        const index = familyMembers.indexOf(name);

        if(index === -1){
            showFeedback("Name not found");
            return;
        };
        familyMembers.splice(index, 1);

        DAYS.forEach(day => {
            CATEGORIES.forEach(cat => {
                mealData[day][cat].splice(index, 1);
            });
        });
        saveData();
        showFeedback(name + " removed");
    }
});

//manage meals
document.getElementById("manage_meals_btn").addEventListener("click", () => {
    const box = document.getElementById("manage_meals");
    if(box.classList.contains("hidden")){
        box.classList.remove("hidden");
        renderManageMeals();
    }
    else{
        box.classList.add("hidden");
    }
});


//add new meal
document.getElementById("add_meal_btn").addEventListener("click", () => {
    const category = prompt("Enter meal category (Breakfast, Lunch, Dinner):");
    if(!CATEGORIES.includes(category)){
        showFeedback("Invalid category");
        return;
    }

    const mealName = prompt("Enter meal name:");
    if (!mealName) return;

    if(mealOptions[category].includes(mealName)){
        showFeedback("Meal already exists in " + category);
        return;
    }

    const name = prompt("Enter ingredient name:");
    if(!name) return;

    const ingredients = name.split(",");
     
    mealOptions[category].push(mealName);
    mealIngredients[mealName] = ingredients;

    showFeedback("Meal " + mealName + " added to " + category);
    buildMealPlanner();
    saveData();
});



//delete meal 
function deleteMeal(category, mealName){
    if(!confirm("Delete " + mealName + "?")) return;

    //delete meal from options
    mealOptions[category] = mealOptions[category].filter(m => m !== mealName);

    //delete meal from planned meals
    DAYS.forEach(day => {
        const mealsForCategory = mealData[day][category];

        for (let i = 0; i < mealsForCategory.length; i++){
            if (mealsForCategory[i] === mealName){
                mealsForCategory[i] = "";       
            }
        };
    });

    delete mealIngredients[mealName];

    updateShoppingList();
    saveData();
    buildMealPlanner();
    renderManageMeals();
    showFeedback(mealName + " deleted");
};


//add extra item
document.getElementById("add_extra_item_btn").addEventListener("click", () => {
    const name = prompt("Enter item name:");
    if(!name) return;

    const quantityInput = prompt("Enter quantity:");
    const quantity = parseInt(quantityInput, 10) || 1;

    extraItems.push({
        name: name,
        quantity: quantity,
        bought: false
    });
    saveData();
    renderShoppingList();
    showFeedback("Extra item added");
});


//meal planner 
function buildMealPlanner(){
    const container = document.getElementById("meal_planner");
    container.innerHTML = "";

    DAYS.forEach(day => {
        const daySection = document.createElement("section");
        daySection.className = "day-section";

        const title = document.createElement("h3");
        title.textContent = day;
        daySection.appendChild(title);

        CATEGORIES.forEach(cat => {
            const catTitle = document.createElement("h4");
            catTitle.textContent = cat;
            daySection.appendChild(catTitle);

            familyMembers.forEach((member, i) => {
                const row = document.createElement("div");
                row.className = "meal-row";

                const label = document.createElement("label");
                label.textContent = member;

                const select = document.createElement("select");
                select.innerHTML = `<option value="">Choose</option>`;

                mealOptions[cat].forEach(meal => {
                    const option = document.createElement("option");
                    option.value = meal;
                    option.textContent = meal;
                    select.appendChild(option);
                });

                select.value = mealData[day][cat][i];

                select.addEventListener("change", () => {
                    mealData[day][cat][i] = select.value;
                    updateShoppingList();
                    saveData();
                });

                row.append(label, select);
                daySection.appendChild(row);
            });
        });

        container.appendChild(daySection);
    });
};


//shopping list
function updateShoppingList(){
    const items = {};

    DAYS.forEach(day => {
        CATEGORIES.forEach(cat => {
            mealData[day][cat].forEach(meal => {
                if (meal && mealIngredients[meal]) {
                    mealIngredients[meal].forEach(name => {
                        if (!items[name]){
                            items[name] = 0;
                        }

                        items[name] += 1;
                    });
                };
            });
        });
    });
    shoppingList = [];

    for(let name in items){
        shoppingList.push({
            name: name,
            quantity: items[name],
            bought: false
        });
    }
    saveData();
    renderShoppingList();
};


function renderShoppingList(){
    const mealsUl = document.getElementById("shopping_list");
    const extrasUl = document.getElementById("extras_list");

    mealsUl.innerHTML = "";
    extrasUl.innerHTML = "";

    if(shoppingList.length === 0){
        mealsUl.innerHTML = "<li class='empty'>No items yet</li>";
    } 
    else {
        shoppingList.forEach((item, index) => {
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.bought;
            checkbox.addEventListener("change", () => {
                item.bought = checkbox.checked;
                saveData();
            });

            const text = document.createElement("span");
            text.textContent = item.name + " (" + item.quantity + ")";
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "x";
            removeBtn.addEventListener("click", () => {
                shoppingList.splice(index, 1);
                saveData();
                renderShoppingList();
            });

            li.append(checkbox, text, removeBtn);
            mealsUl.appendChild(li);
        });
    }

    if(extraItems.length === 0){
        extrasUl.innerHTML = "<li class='empty'>No extra items</li>";
    } 
    else {
        extraItems.forEach((item, index) => {
            const li = document.createElement("li");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = item.bought;
            checkbox.addEventListener("change", () => {
                item.bought = checkbox.checked;
                saveData();
            });

            const text = document.createElement("span");
            text.textContent = item.name + " (" + item.quantity + ")";
            const removeBtn = document.createElement("button");
            removeBtn.textContent = "x";
            removeBtn.addEventListener("click", () => {
                extraItems.splice(index, 1);
                saveData();
                renderShoppingList();
            });

            li.append(checkbox, text, removeBtn);
            extrasUl.appendChild(li);
        });
    }
};



function renderManageMeals(){
    const box = document.getElementById("manage_meals");
    box.innerHTML = "";

    for(let cat in mealOptions){
        const title = document.createElement("h4");
        title.textContent = cat;
        box.appendChild(title);

        mealOptions[cat].forEach(meal => {
            const div = document.createElement("div");
            div.textContent = meal + " ";

            const btn = document.createElement("button");
            btn.textContent = "Delete";
            btn.onclick = () => deleteMeal(cat, meal);

            div.appendChild(btn);
            box.appendChild(div);
        });
    };
};


//weekly overview
function renderOverview(){
    const box = document.getElementById("overview_content");
    box.innerHTML = "";

    let hasMeals = false;

    DAYS.forEach(day => {
        const dayDiv = document.createElement("div");
        dayDiv.innerHTML = `<h3>${day}</h3>`;

        CATEGORIES.forEach(cat => {
            mealData[day][cat].forEach((meal, i) => {
                if (meal) {
                    hasMeals = true;
                    dayDiv.innerHTML += `<p>${familyMembers[i]} - ${cat}: ${meal}</p>`;
                };
            });
        });
        box.appendChild(dayDiv);
    });
    if(!hasMeals){
        box.innerHTML = "<p class='empty'>No meals yet</p>";
    };
};

window.addEventListener("DOMContentLoaded", () => {
    loadData();
    if (!Object.keys(mealData).length) {
        mealData = createEmptyWeek();
    }

    updateShoppingList();
    showView("view_dashboard");
    showFeedback("Meal planner ready");
});