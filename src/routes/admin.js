const express = require('express')
const router = express.Router()

router.get('/admins', (req, res) => {
  // res.render('index')
  res.send("<h2>Привет Admin!</h2>");
})

module.exports = router