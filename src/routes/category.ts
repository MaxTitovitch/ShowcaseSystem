import { getRepository } from 'typeorm'
import { Category } from '../entity/Category'
import {Region} from "../entity/Region";
import {Product} from "../entity/Product";
import {ProductToCategoryBinding} from "../entity/ProductToCategoryBinding";
import {RecommendedProducts} from "../entity/RecommendedProducts";

const express = require('express');
const router = express.Router();

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/static/images/category')
  },
  filename: function (req, file, cb) {
    let name = Date.now() + '-' + file.fieldname + '.' + file.originalname.split('.').reverse()[0];
    req.body[file.fieldname] = name;
    cb(null, name)
  }
});

var upload = multer({ storage: storage });

router.get('/',  async (req, res) => {
  let categories = await getRepository(Category).createQueryBuilder("category")
      .leftJoinAndSelect("category.region", "region")
      .leftJoinAndSelect("category.parent", "parent")
      .orderBy('category.id').getMany();
  res.render('category/categories', {entities: categories, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  let regions = await getRepository(Region).createQueryBuilder("region").orderBy('id').getMany();
  let products = await getRepository(Product).createQueryBuilder("product").orderBy('article').getMany();
  let parents = await getRepository(Category).createQueryBuilder("category").where("category.id NOT IN (:id)", { id: req.params.index || 0 }).orderBy('id').getMany();
  if(req.params.index) {
    let category = await getRepository(Category).findOne({id: req.params.index}), categoryProducts = [], disabledId = [];
    let recommended = await getRepository(RecommendedProducts).createQueryBuilder("RECOMMENDED_PRODUCTS")
        .where('category_id = :category_id', {category_id: req.params.index}).getMany();
    let sort = await getRepository(ProductToCategoryBinding).createQueryBuilder("PRODUCT_TO_CATEGORY_BINDING")
        .where('category_id = :category_id', {category_id: req.params.index}).getMany();
    for (let i = 0; i < sort.length; i++) {
      categoryProducts.push({
        categoryId: sort[i].categoryId,
        productId: sort[i].productId,
        recommendedProducts: JSON.parse(recommended[i].recommendedProducts),
        sort: sort[i].sort
      });
      disabledId.push(sort[i].productId)
    }
    res.render('category/category', {entity: category, path: '/admin/categories/one/' + category.id, nameAction: 'Обновление', regions, parents, products, categoryProducts, disabledId});
  } else {
    res.render('category/category', {entity: null, path: '/admin/categories/one', nameAction: 'Создание', regions, parents, products: null});
  }
});

router.post('/one/:index?', upload.fields([
    { name: 'product_dummy_picture', maxCount: 1 }
]),  async (req, res) => {
  let category, path = '/static/images/category/';
  try {
    let object = {
      regionId: req.body.region_id,
      parentId: req.body.parent_id,
      name: req.body.name,
      hidden: req.body.hidden || '0',
      sort: req.body.sort,
      productDummyPicture: req.body.product_dummy_picture ? path + req.body.product_dummy_picture : '',
    };
    if(req.params.index) {
      if(object.productDummyPicture == '') {
        delete object.productDummyPicture;
      }
      category = await getRepository(Category).update({id: req.params.index}, object);
      category.id = req.params.index;
    } else {
      category = await getRepository(Category).create( object);

      let lastId = false;
      if(req.body.id == '0') {
        category.id = '1';
      }
      if(category.parentId == '0') {
        category.parentId = (await getRepository(Category).createQueryBuilder("category").orderBy('id', 'DESC').getOne()).id || '1';
        lastId = true;
      }
      category = await getRepository(Category).save(category);
      if(lastId) {
        category.parentId = category.id;
        category = await getRepository(Category).save(category);
      }
    }
    req.flash('success', 'Запись успешно сохранена!');
    res.redirect('/admin/categories/one/' + category.id);
  } catch (e) {
    req.flash('error', 'Ошибка сохранения!');
    res.redirect('/admin/categories');
  }
});

router.post('/delete/:index?', async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Category).delete({id: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/categories');
});



router.post('/:parent/products/one/:index?',  async (req, res) => {
  try {
    let object1 = {
      categoryId: req.params.parent,
      productId: req.body.product_id,
      sort: req.body.sort
    }, object2 = {
      categoryId: req.params.parent,
      productId: req.body.product_id,
      recommendedProducts: JSON.stringify(req.body['recommended_products[]'] || []),
    }, ptcObject, recommend;
    if(object2.recommendedProducts) {
      if ((object2.recommendedProducts + "")[0] == '"') {
        object2.recommendedProducts = `[${object2.recommendedProducts}]`;
      }
    }
    if(req.params.index) {
      ptcObject = await getRepository(ProductToCategoryBinding).update({categoryId: req.params.parent, productId: req.params.index}, object1);
      recommend = await getRepository(RecommendedProducts).update({categoryId: req.params.parent, productId: req.params.index}, object2);
    } else {
      ptcObject = await getRepository(ProductToCategoryBinding).create(object1);
      ptcObject = await getRepository(ProductToCategoryBinding).save(ptcObject);
      recommend = await getRepository(RecommendedProducts).create(object2);
      recommend = await getRepository(RecommendedProducts).save(recommend);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    console.log(e);
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/categories/one/' + req.params.parent);
});

router.post('/:parent/products/one/:index/delete',  async (req, res) => {
  try {
    if (req.params.index && req.params.parent) {
      await getRepository(ProductToCategoryBinding).delete({categoryId: req.params.parent, productId: req.params.index});
      await getRepository(RecommendedProducts).delete({categoryId: req.params.parent, productId: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/categories/one/' + req.params.parent);
});







module.exports = router;