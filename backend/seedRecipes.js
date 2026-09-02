const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const User = require("./models/User");
const Recipe = require("./models/Recipe");

dotenv.config();

const recipes = [
  {
    title: "Dal Tadka",
    description:
      "Comforting yellow lentils cooked with aromatic spices and a flavorful tempering.",
    ingredients: [
      "1 cup toor dal",
      "1 onion",
      "2 tomatoes",
      "3 garlic cloves",
      "2 green chilies",
      "1 tsp turmeric",
      "1 tsp cumin seeds",
      "1 tsp red chili powder",
      "1 tbsp ghee",
      "Coriander leaves",
      "Salt"
    ],
    instructions:
      "Cook the toor dal with turmeric until soft. Heat ghee and add cumin seeds, garlic, onion and green chilies. Add tomatoes and spices and cook well. Mix the tempering with the cooked dal and simmer for a few minutes. Garnish with coriander leaves.",
    category: "Vegetarian",
    difficulty: "Easy",
    cookingTime: 35
  },

  {
    title: "Vegetable Pulao",
    description:
      "Fragrant basmati rice cooked with mixed vegetables and aromatic whole spices.",
    ingredients: [
      "2 cups basmati rice",
      "1 carrot",
      "1/2 cup green peas",
      "1 capsicum",
      "1 onion",
      "2 green chilies",
      "1 cinnamon stick",
      "2 cardamom pods",
      "2 cloves",
      "1 tsp ginger garlic paste",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Wash and soak the rice. Heat oil and fry the whole spices, onion, green chilies and ginger garlic paste. Add the vegetables and cook briefly. Add rice and water with salt. Cover and cook until the rice is fluffy and fully cooked.",
    category: "Vegetarian",
    difficulty: "Medium",
    cookingTime: 35
  },

  {
    title: "Rajma Masala",
    description:
      "Red kidney beans cooked in a rich onion and tomato gravy with Indian spices.",
    ingredients: [
      "2 cups kidney beans",
      "2 onions",
      "3 tomatoes",
      "1 tbsp ginger garlic paste",
      "1 tsp cumin seeds",
      "1 tsp turmeric",
      "2 tsp chili powder",
      "1 tsp coriander powder",
      "1 tsp garam masala",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Soak kidney beans overnight and cook until soft. Heat oil and saute cumin seeds and onions. Add ginger garlic paste, tomatoes and spices and cook until the oil separates. Add cooked kidney beans and simmer until the gravy thickens. Garnish with coriander leaves.",
    category: "Vegetarian",
    difficulty: "Medium",
    cookingTime: 60
  },

  {
    title: "Vegetable Korma",
    description:
      "Mixed vegetables cooked in a creamy and mildly spiced coconut-based gravy.",
    ingredients: [
      "1 carrot",
      "1 potato",
      "1/2 cup green peas",
      "1/2 cup beans",
      "1 onion",
      "1/2 cup coconut milk",
      "1 tbsp ginger garlic paste",
      "1 tsp garam masala",
      "1/2 tsp turmeric",
      "Cashews",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Cook the vegetables until slightly tender. Saute onion and ginger garlic paste in oil. Add spices and coconut milk and cook gently. Add the vegetables and simmer until the gravy becomes creamy and flavorful. Garnish with cashews and coriander leaves.",
    category: "Vegetarian",
    difficulty: "Medium",
    cookingTime: 40
  },

  {
    title: "Egg Masala",
    description:
      "Boiled eggs coated in a spicy onion and tomato masala.",
    ingredients: [
      "4 eggs",
      "2 onions",
      "2 tomatoes",
      "1 tbsp ginger garlic paste",
      "2 green chilies",
      "1 tsp turmeric",
      "2 tsp chili powder",
      "1 tsp coriander powder",
      "1 tsp garam masala",
      "Curry leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Boil and peel the eggs. Heat oil and saute onions, curry leaves and green chilies. Add ginger garlic paste, tomatoes and spices. Cook until the masala becomes thick. Add the boiled eggs and coat them well with the masala.",
    category: "Non-Vegetarian",
    difficulty: "Easy",
    cookingTime: 30
  },

  {
    title: "Fish Curry",
    description:
      "Tangy and spicy fish curry prepared with tamarind and aromatic spices.",
    ingredients: [
      "500g fish",
      "2 onions",
      "2 tomatoes",
      "1/2 cup tamarind extract",
      "1 tbsp ginger garlic paste",
      "2 tsp chili powder",
      "1 tsp turmeric",
      "1 tsp coriander powder",
      "Curry leaves",
      "Mustard seeds",
      "Salt",
      "Oil"
    ],
    instructions:
      "Marinate the fish with turmeric and salt. Heat oil and temper mustard seeds and curry leaves. Saute onions and tomatoes with ginger garlic paste and spices. Add tamarind extract and water and bring to a boil. Add fish pieces and cook gently until tender.",
    category: "Non-Vegetarian",
    difficulty: "Medium",
    cookingTime: 40
  },

  {
    title: "Mutton Pepper Fry",
    description:
      "Spicy mutton pieces cooked with freshly ground black pepper and aromatic spices.",
    ingredients: [
      "500g mutton",
      "2 onions",
      "1 tbsp ginger garlic paste",
      "2 green chilies",
      "2 tsp black pepper",
      "1 tsp turmeric",
      "1 tsp garam masala",
      "Curry leaves",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Pressure cook the mutton with turmeric and salt until tender. Heat oil and saute onions, green chilies and curry leaves. Add ginger garlic paste and spices. Add the cooked mutton and freshly ground black pepper. Fry until the mixture becomes dry and aromatic.",
    category: "Non-Vegetarian",
    difficulty: "Hard",
    cookingTime: 75
  },

  {
    title: "Chicken Tikka",
    description:
      "Juicy chicken pieces marinated in yogurt and spices and grilled until lightly charred.",
    ingredients: [
      "500g boneless chicken",
      "1 cup yogurt",
      "1 tbsp ginger garlic paste",
      "2 tsp chili powder",
      "1 tsp turmeric",
      "1 tsp garam masala",
      "1 tbsp lemon juice",
      "1 capsicum",
      "1 onion",
      "Salt",
      "Oil"
    ],
    instructions:
      "Cut chicken into pieces and marinate with yogurt, spices, ginger garlic paste and lemon juice. Rest the chicken for at least 30 minutes. Thread chicken, onion and capsicum onto skewers and grill until cooked and lightly charred.",
    category: "Non-Vegetarian",
    difficulty: "Medium",
    cookingTime: 45
  },

  {
    title: "Carrot Halwa",
    description:
      "Traditional Indian dessert made with grated carrots, milk, sugar and nuts.",
    ingredients: [
      "500g carrots",
      "2 cups milk",
      "1/2 cup sugar",
      "2 tbsp ghee",
      "Cardamom powder",
      "Cashews",
      "Almonds",
      "Raisins"
    ],
    instructions:
      "Grate the carrots and cook them in milk until soft. Add sugar and continue cooking until the mixture thickens. Heat ghee and fry the nuts and raisins. Add them to the halwa with cardamom powder and mix well.",
    category: "Dessert",
    difficulty: "Medium",
    cookingTime: 45
  },

  {
    title: "Rasgulla",
    description:
      "Soft and spongy Bengali sweets cooked in light sugar syrup.",
    ingredients: [
      "1 liter milk",
      "2 tbsp lemon juice",
      "1 cup sugar",
      "4 cups water",
      "Cardamom"
    ],
    instructions:
      "Boil the milk and add lemon juice to curdle it. Strain and wash the chenna thoroughly. Knead until smooth and make small balls. Prepare sugar syrup with sugar and water. Add the balls and cook until they become soft and spongy.",
    category: "Dessert",
    difficulty: "Hard",
    cookingTime: 50
  },

  {
    title: "Mango Kulfi",
    description:
      "Creamy frozen Indian dessert combining ripe mangoes with rich milk and nuts.",
    ingredients: [
      "2 ripe mangoes",
      "3 cups full cream milk",
      "1/2 cup sugar",
      "Cardamom powder",
      "Pistachios",
      "Almonds"
    ],
    instructions:
      "Boil milk and reduce it until thick. Add sugar and cardamom and allow it to cool. Blend mangoes into a smooth puree and mix with the milk. Add chopped nuts, pour into molds and freeze until completely set.",
    category: "Dessert",
    difficulty: "Medium",
    cookingTime: 30
  },

  {
    title: "Coconut Ladoo",
    description:
      "Simple and delicious sweet balls made with coconut and condensed milk.",
    ingredients: [
      "2 cups grated coconut",
      "1 cup condensed milk",
      "1/2 tsp cardamom powder",
      "Cashews",
      "Ghee"
    ],
    instructions:
      "Heat a little ghee in a pan and lightly roast the grated coconut. Add condensed milk and cardamom powder. Cook while stirring until the mixture becomes thick. Allow it to cool slightly and shape into small balls. Garnish with cashews.",
    category: "Dessert",
    difficulty: "Easy",
    cookingTime: 20
  },

  {
    title: "Paneer Tikka",
    description:
      "Spiced paneer cubes grilled with colorful vegetables for a tasty snack.",
    ingredients: [
      "250g paneer",
      "1 capsicum",
      "1 onion",
      "1 cup yogurt",
      "1 tsp ginger garlic paste",
      "1 tsp chili powder",
      "1 tsp garam masala",
      "1/2 tsp turmeric",
      "1 tbsp lemon juice",
      "Salt",
      "Oil"
    ],
    instructions:
      "Cut paneer and vegetables into cubes. Mix yogurt with spices, ginger garlic paste, lemon juice and salt. Marinate paneer and vegetables for 30 minutes. Place them on skewers and grill until lightly charred.",
    category: "Snacks",
    difficulty: "Medium",
    cookingTime: 35
  },

  {
    title: "Samosa",
    description:
      "Crispy triangular pastry filled with spicy potato and pea stuffing.",
    ingredients: [
      "2 cups all-purpose flour",
      "3 potatoes",
      "1/2 cup green peas",
      "1 onion",
      "Green chilies",
      "1 tsp cumin seeds",
      "1 tsp chili powder",
      "1 tsp garam masala",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Prepare dough using flour, salt and water. Cook mashed potatoes, peas, onion and spices to make the filling. Roll the dough and shape it into cones. Fill with potato mixture, seal and deep fry until golden and crispy.",
    category: "Snacks",
    difficulty: "Medium",
    cookingTime: 45
  },

  {
    title: "Medu Vada",
    description:
      "Crispy South Indian lentil fritters with a soft and fluffy center.",
    ingredients: [
      "2 cups urad dal",
      "1 onion",
      "2 green chilies",
      "Curry leaves",
      "1 tsp black pepper",
      "1 tsp cumin seeds",
      "Coriander leaves",
      "Salt",
      "Oil"
    ],
    instructions:
      "Soak urad dal for several hours and grind it into a thick batter. Add onion, green chilies, curry leaves, pepper, cumin and salt. Shape the batter into rings and deep fry until golden and crispy. Serve hot.",
    category: "Snacks",
    difficulty: "Medium",
    cookingTime: 40
  },

  {
    title: "Corn Pakoda",
    description:
      "Crunchy fritters made with sweet corn, gram flour and aromatic spices.",
    ingredients: [
      "1 cup sweet corn",
      "1/2 cup gram flour",
      "1 onion",
      "2 green chilies",
      "Coriander leaves",
      "1 tsp chili powder",
      "1/2 tsp cumin",
      "Salt",
      "Oil"
    ],
    instructions:
      "Crush the sweet corn lightly and mix with gram flour, onion, green chilies, coriander and spices. Add a little water to form a thick mixture. Drop small portions into hot oil and fry until crisp and golden.",
    category: "Snacks",
    difficulty: "Easy",
    cookingTime: 25
  },

  {
    title: "Banana Fritters",
    description:
      "Sweet and crispy fritters made with ripe bananas and flour.",
    ingredients: [
      "3 ripe bananas",
      "1 cup all-purpose flour",
      "2 tbsp sugar",
      "1/2 tsp cardamom powder",
      "1/2 tsp baking powder",
      "Water",
      "Oil"
    ],
    instructions:
      "Mash the bananas and mix them with flour, sugar, cardamom and baking powder. Add water to prepare a thick batter. Drop small portions into hot oil and fry until golden and crispy.",
    category: "Snacks",
    difficulty: "Easy",
    cookingTime: 20
  },

  {
    title: "Pineapple Smoothie",
    description:
      "Refreshing tropical smoothie prepared with fresh pineapple and yogurt.",
    ingredients: [
      "1 cup pineapple",
      "1 cup yogurt",
      "1/2 cup milk",
      "2 tbsp honey",
      "4 ice cubes"
    ],
    instructions:
      "Chop fresh pineapple into small pieces. Add pineapple, yogurt, milk, honey and ice cubes to a blender. Blend until smooth and creamy. Serve immediately while chilled.",
    category: "Beverages",
    difficulty: "Easy",
    cookingTime: 10
  },

  {
    title: "Banana Milkshake",
    description:
      "Creamy and filling milkshake made with ripe bananas and chilled milk.",
    ingredients: [
      "2 ripe bananas",
      "2 cups chilled milk",
      "2 tbsp sugar",
      "1/2 tsp vanilla extract",
      "4 ice cubes",
      "Almonds"
    ],
    instructions:
      "Peel and slice the bananas. Add bananas, chilled milk, sugar, vanilla and ice cubes to a blender. Blend until smooth and creamy. Pour into glasses and garnish with chopped almonds.",
    category: "Beverages",
    difficulty: "Easy",
    cookingTime: 10
  },

  {
    title: "Rose Milk",
    description:
      "Refreshing chilled milk drink flavored with rose syrup and served over ice.",
    ingredients: [
      "2 cups chilled milk",
      "3 tbsp rose syrup",
      "1 tbsp sugar",
      "Ice cubes",
      "Rose petals"
    ],
    instructions:
      "Pour chilled milk into a glass. Add rose syrup and sugar and mix well. Add ice cubes and garnish with rose petals. Serve immediately.",
    category: "Beverages",
    difficulty: "Easy",
    cookingTime: 5
  }
];

const seedRecipes = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB.");

    // Find your registered user
    const user = await User.findOne({
      email: "deepaksoundarapandi@gmail.com"
    });

    if (!user) {
      console.log("User not found.");
      console.log(
        "Please make sure deepaksoundarapandi@gmail.com is registered."
      );

      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(`Using user: ${user.name} (${user.email})`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipe of recipes) {
      // Check whether this recipe already exists
      const existingRecipe = await Recipe.findOne({
        title: recipe.title,
        author: user._id
      });

      if (existingRecipe) {
        console.log(`SKIPPED: ${recipe.title} already exists.`);
        skippedCount++;
        continue;
      }

      // Add author ID
      const recipeWithAuthor = {
        ...recipe,
        author: user._id
      };

      await Recipe.create(recipeWithAuthor);

      console.log(`ADDED: ${recipe.title}`);
      addedCount++;
    }

    console.log("--------------------------------");
    console.log(`New recipes added: ${addedCount}`);
    console.log(`Duplicate recipes skipped: ${skippedCount}`);
    console.log(`Total new recipes in this file: ${recipes.length}`);
    console.log("--------------------------------");

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding recipes:", error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error("Error closing MongoDB connection:", closeError);
    }

    process.exit(1);
  }
};

seedRecipes();