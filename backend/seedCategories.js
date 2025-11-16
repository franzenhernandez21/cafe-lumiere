const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("./models/Category"); // make sure may Category model ka sa models folder

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const defaultCategories = [
      { name: "Coffee", description: "All coffee-based products" },
      { name: "Pie", description: "Freshly baked pies" },
      { name: "Cakes", description: "Delicious cakes" },
      { name: "Cupcake", description: "Sweet and small cupcakes" },
      { name: "Gifting", description: "Perfect gift packages" },
    ];

    for (const cat of defaultCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) await Category.create(cat);
    }

    console.log("✅ Default categories seeded successfully!");
    mongoose.connection.close();
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err));
