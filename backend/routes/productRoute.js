import express from "express";
import Product from "../models/productModel";
import { isAdmin, isAuth } from "../util";
const router = express.Router();

router.get("/", paginatedProductResults(Product), (req, res) => {
  res.json(res.paginatedProductResults);
});

function paginatedProductResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const priceFrom = parseInt(req.query.priceFrom);
    const priceTo = parseInt(req.query.priceTo);

    const category = req.query.category ? { category: req.query.category } : {};
    const searchKeyword = req.query.searchKeyword
      ? {
          name: {
            $regex: req.query.searchKeyword,
            $options: "i",
          },
        }
      : {};
    const sortOrder = req.query.sortOrder
      ? req.query.sortOrder === "lowest"
        ? { price: 1 }
        : { price: -1 }
      : { _id: -1 };
    const priceProduct = { price: { $gte: priceFrom, $lte: priceTo } };
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const allCounts = await model
      .countDocuments({ ...category, ...searchKeyword, ...priceProduct })
      .exec();
    if (endIndex < allCounts) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.allDocs = allCounts;
      results.results = await model
        .find({ ...category, ...searchKeyword, ...priceProduct })
        .limit(limit)
        .skip(startIndex)
        .sort(sortOrder)
        .exec();
      res.paginatedProductResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

router.get("/all", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

router.get("/categories", async (req, res) => {
  const products = await Product.find({});
  const byCategory = products.map((el) => el.category);

  function ukloniDuplikate(nizDuplikata) {
    let pomocniObjekat = {};
    return nizDuplikata.filter(function (el) {
      const key = JSON.stringify(el);
      const match = Boolean(pomocniObjekat[key]);
      return match ? false : (pomocniObjekat[key] = true);
    });
  }
  const bezDuplikata = ukloniDuplikate(byCategory);
  res.send(bezDuplikata);
});

router.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  res.send(product);
});

router.get("/filter/price", filteredByPrice(Product), async (req, res) => {
  res.send(res.filteredByPrice);
});

function filteredByPrice(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const priceFrom = parseInt(req.query.priceFrom);
    const priceTo = parseInt(req.query.priceTo);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const allCounts = await model.countDocuments().exec();
    if (endIndex < allCounts) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      let query = { price: { $gte: priceFrom, $lte: priceTo } };
      results.results = await model
        .find(query)
        .limit(limit)
        .skip(startIndex)
        .exec();
      results.allDocs = results.results.length;
      res.filteredByPrice = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

router.get("/filter/category", filteredCategory(Product), async (req, res) => {
  res.send(res.filteredCategory);
});

function filteredCategory(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    console.log("paginatedResults -> page", page);
    const limit = parseInt(req.query.limit);
    console.log("paginatedResults -> limit", limit);
    const cat = req.query.category;
    console.log("paginatedResults -> cat", cat);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const allCounts = await model.countDocuments().exec();
    if (endIndex < allCounts) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.results = await model
        .find({ category: cat })
        .limit(limit)
        .skip(startIndex)
        .exec();
      results.allDocs = results.results.length;
      res.filteredCategory = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

router.post("/", async (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    description: req.body.description,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
  });

  const newProduct = await product.save();

  if (newProduct) {
    return res
      .status(201)
      .send({ msg: "New product created", data: newProduct });
  }
  res.status(500).send({ message: "Error in creating product." });
});

// Pagination

router.get("/", paginatedResults(Product), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const allCounts = await model.countDocuments().exec();
    if (endIndex < allCounts) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      results.allDocs = allCounts;
      results.results = await model.find().limit(limit).skip(startIndex).exec();
      res.paginatedResults = results;
      next();
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  };
}

router.post("/:id/reviews", isAuth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    const review = {
      name: req.body.name,
      rating: Number(req.body.rating),
      comment: req.body.comment,
    };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((a, c) => c.rating + a, 0) /
      product.reviews.length;
    const updatedProduct = await product.save();
    res.status(201).send({
      data: updatedProduct.reviews[updatedProduct.reviews.length - 1],
      message: "Review saved successfully.",
    });
  } else {
    res.status(404).send({ message: "Product Not Found" });
  }
});

router.put("/:id", isAuth, isAdmin, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
    product.name = req.body.name;
    product.price = req.body.price;
    product.image = req.body.image;
    product.brand = req.body.brand;
    product.category = req.body.category;
    product.countInStock = req.body.countInStock;
    product.description = req.body.description;
    const updatedProduct = await product.save();
    if (updatedProduct) {
      return res
        .status(200)
        .send({ message: "Product Updated", data: updatedProduct });
    }
  }
  return res.status(500).send({ message: " Error in Updating Product." });
});

router.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const deletedProduct = await Product.findById(req.params.id);
  if (deletedProduct) {
    await deletedProduct.remove();
    res.send({ message: "Product Deleted" });
  } else {
    res.send("Error in Deletion.");
  }
});

export default router;
