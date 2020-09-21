import { getRepository } from 'typeorm'
import { Product } from '../entity/Product'

const express = require('express');
const router = express.Router();

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/static/images/product')
  },
  filename: function (req, file, cb) {
    if(file.fieldname === 'picture_set') {
      if(!req.body.picture_set) {
        req.body.picture_set = [];
      }
      let path = '/static/images/product/';
      let name = Date.now() + '-' + file.fieldname + '-' + req.body.picture_set.length +'.' + file.originalname.split('.').reverse()[0];
      req.body.picture_set.push(path + name);
      cb(null, name)
    } else {
      let name = Date.now() + '-' + file.fieldname + '.' + file.originalname.split('.').reverse()[0];
      req.body[file.fieldname] = name;
      cb(null, name)
    }
  }
});

var upload = multer({ storage: storage });

router.get('/',  async (req, res) => {
  let products = await getRepository(Product).createQueryBuilder("product").orderBy('article').getMany();
  res.render('product/products', {entities: products, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  if(req.params.index) {
    let product = await getRepository(Product).findOne({article: req.params.index});
    product.pictureSet = JSON.parse(product.pictureSet);
    res.render('product/product', {entity: product, path: '/admin/products/one/' + product.article, nameAction: 'Обновление'});
  } else {
    res.render('product/product', {entity: null, path: '/admin/products/one', nameAction: 'Создание'});
  }
});

router.post('/one/:index?', upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'picture_set', maxCount: 100 },
]),  async (req, res) => {
  let product, path = '/static/images/product/';
  try {
    let object = {
      article: req.body.article,
      name: req.body.name,
      shortName: req.body.short_name,
      description: req.body.description,
      measuredIn: req.body.measured_in,
      unit: req.body.unit,
      picture: req.body.picture ? path + req.body.picture : '',
      thumbnail: req.body.thumbnail ? path + req.body.thumbnail : '',
      pictureSet: JSON.stringify(req.body.picture_set ? req.body.picture_set : []),

      sku: req.body.sku,
      brand: req.body.brand,
      origin: req.body.origin,
      composition: req.body.composition,
      weight: req.body.weight,
      volume: req.body.volume,
    };
    console.log(object)
    if(req.params.index) {
      if(object.picture == '') {
        delete object.picture;
      }
      if(object.thumbnail == '') {
        delete object.thumbnail;
      }
      if(object.pictureSet == '[]') {
        delete object.pictureSet;
      }
      product = await getRepository(Product).update({article: req.params.index}, object);
      product.article = req.params.index;
    } else {
      product = await getRepository(Product).create( object);
      product = await getRepository(Product).save(product);
    }
    req.flash('success', 'Запись успешно сохранена!');
    res.redirect('/admin/products/one/' + product.article);
  } catch (e) {
    console.log(e);
    req.flash('error', 'Ошибка сохранения!');
    res.redirect('/admin/products');
  }
});

router.post('/delete/:index?',  async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Product).delete({article: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/products');
});



module.exports = router;