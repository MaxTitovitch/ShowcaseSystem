const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render("user/index", {layout: null});
});

router.get('/shares', (req, res) => {
  res.render("user/akcii", {layout: null});
});

router.get('/shares/:index', (req, res) => {
  res.render("user/akcii-one", {layout: null});
});

router.get('/categories', (req, res) => {
  res.render("user/kategory", {layout: null});
});

router.get('/categories/:index', (req, res) => {
  res.render("user/tovary", {layout: null});
});

router.get('/map', (req, res) => {
  res.render("user/map", {layout: null});
});

router.get('/shop/:index', (req, res) => {
  res.render("user/one-magaz", {layout: null});
});

router.get('/product/:index', (req, res) => {
  res.render("user/one-tovar", {layout: null});
});

router.get('/product-show/:index', (req, res) => {
  res.render("user/one-tovar1", {layout: null});
});

router.get('/list', (req, res) => {
  res.render("user/spisok", {layout: null});
});

module.exports = router;