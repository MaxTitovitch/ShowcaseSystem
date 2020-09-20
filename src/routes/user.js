const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  // res.render('index')
  res.render("user/index", {layout: null});
})

module.exports = router