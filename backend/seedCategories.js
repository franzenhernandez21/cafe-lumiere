// seedCategories.js - UPDATED
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category");

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const defaultCategories = [
      { 
        name: "Coffee", 
        description: "All coffee-based products",
        subcategories: [
          { name: "Hot", description: "Hot coffee drinks" },
          { name: "Cold", description: "Iced and cold coffee drinks" }
        ]
      },
      { 
        name: "Pie", 
        description: "Freshly baked pies",
        subcategories: [
          { name: "Fruit", description: "Fruit-based pies" },
          { name: "Savory", description: "Savory pies" }
        ]
      },
      { 
        name: "Cakes", 
        description: "Delicious cakes",
        subcategories: [
          { name: "Chocolate", description: "Chocolate cakes" },
          { name: "Vanilla", description: "Vanilla cakes" }
        ]
      },
      { 
        name: "Cupcake", 
        description: "Sweet and small cupcakes",
        subcategories: [
          { name: "Classic", description: "Classic flavors" },
          { name: "Specialty", description: "Special flavors" }
        ]
      },
      { 
        name: "Gifting", 
        description: "Perfect gift packages",
        subcategories: [
          { name: "Small", description: "Small gift sets" },
          { name: "Large", description: "Large gift sets" }
        ]
      },
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      } else {
        // Update existing with subcategories
        await Category.findOneAndUpdate(
          { name: cat.name },
          { subcategories: cat.subcategories }
        );
      }
    }

    console.log(" Default categories with subcategories seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error(" MongoDB connection failed:", err));