const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
  // res.render('index')
  res.send("<h2>Привет User!</h2>");
})

module.exports = router