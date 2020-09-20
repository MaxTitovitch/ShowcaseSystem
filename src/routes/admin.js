const express = require('express')
const router = express.Router()

router.get('/admins', (req, res) => {
  res.render('admin/admins');
})

module.exports = router