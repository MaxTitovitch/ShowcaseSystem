import { getRepository } from 'typeorm'
import { Store } from '../entity/Store'
import {Promotion} from "../entity/Promotion";
import {Region} from "../entity/Region";
import {ProductPrice} from "../entity/ProductPrice";
import {ProductAvailability} from "../entity/ProductAvailability";
import {ProductPriceStore} from "../entity/ProductPriceStore";
import {ProductAvailabilityStore} from "../entity/ProductAvailabilityStore";
import {Product} from "../entity/Product";

const express = require('express');
const router = express.Router();
var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/static/images/store')
  },
  filename: function (req, file, cb) {
    let name = Date.now() + '-' + file.fieldname + '.' + file.originalname.split('.').reverse()[0];
    req.body[file.fieldname] = name;
    cb(null, name)
  }
});
var upload = multer({ storage: storage });

router.get('/',  async (req, res) => {
  let stores = await getRepository(Store).createQueryBuilder("store")
      .leftJoinAndSelect("store.region", "region").orderBy('store.id').getMany();
  res.render('store/stores', {entities: stores, messageStatus: res.locals});
});

router.get('/one/:index?', async (req, res) => {
  let promotions = await getRepository(Promotion).createQueryBuilder("promotion").orderBy('id').getMany();
  let regions = await getRepository(Region).createQueryBuilder("region").orderBy('id').getMany();
  if(req.params.index) {
    let store = await getRepository(Store).findOne({id: req.params.index}), storeProducts = [], disabledId = [];
    store.openingHours = JSON.parse(store.openingHours);
    store.promotions = JSON.parse(store.promotions);

    let products = await getRepository(Product).createQueryBuilder("product").orderBy('article').getMany();
    let price = await getRepository(ProductPriceStore).createQueryBuilder("PRODUCT_PRICE")
        .where('store_id = :store_id', {store_id: req.params.index}).getMany();
    let availability = await getRepository(ProductAvailabilityStore).createQueryBuilder("PRODUCT_AVAILABILITY")
        .where('store_id = :store_id', {store_id: req.params.index}).getMany();
    for (let i = 0; i < price.length; i++) {
      storeProducts.push({
        storeId: price[i].storeId,
        productId: price[i].productId,
        price: price[i].price,
        discountPrice: price[i].discountPrice,
        promotionId: price[i].promotionId,
        availability: availability[i].availability,
        quantity: availability[i].quantity,
      });
      disabledId.push(price[i].productId);
    }

   let position = {latitude: `${store.latitude.toFixed(6)}`, longitude: `${store.longitude.toFixed(6) }`};
    res.render('store/store', {entity: store, path: '/admin/stores/one/' + store.id, nameAction: 'Обновление', promotions, regions, position, products, storeProducts, disabledId});
  } else {
    res.render('store/store', {entity: null, path: '/admin/stores/one', nameAction: 'Создание', promotions, regions, position: null});
  }
});

router.post('/one/:index?', upload.fields([{ name: 'picture', maxCount: 1 }]),  async (req, res) => {
  let store, path = '/static/images/store/';
  try {
    let object = {
      name: req.body.name,
      regionId: req.body.region_id,
      address: req.body.address,
      openingHours: req.body.opening_hours,
      phone: req.body.phone,
      picture: req.body.picture ? path + req.body.picture : '',
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      sort: req.body.sort,
      promotions: JSON.stringify(req.body.promotions || []),
    };
    console.log(object);
    if(req.params.index) {
      if(object.picture == '') {
        delete object.picture;
      }
      store = await getRepository(Store).update({id: req.params.index}, object);
      store.id = req.params.index;
    } else {
      store = await getRepository(Store).create( object);
      store = await getRepository(Store).save(store);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    console.log(e);
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/stores/one/' + store.id);
});

router.post('/delete/:index?',  async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Store).delete({id: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/stores');
});




router.post('/:parent/products/one/:index?',  async (req, res) => {
  try {
    let object1 = {
      storeId: req.params.parent,
      productId: req.body.product_id,
      price: req.body.price,
      discountPrice: req.body.discount_price,
      promotionId: req.body.promotion_id
    }, object2 = {
      storeId: req.params.parent,
      productId: req.body.product_id,
      availability: req.body.availability,
      quantity: req.body.quantity
    }, price, availability;
    if(req.params.index) {
      price = await getRepository(ProductPriceStore).update({storeId: req.params.parent, productId: req.params.index}, object1);
      availability = await getRepository(ProductAvailabilityStore).update({storeId: req.params.parent, productId: req.params.index}, object2);
    } else {
      price = await getRepository(ProductPriceStore).create(object1);
      price = await getRepository(ProductPriceStore).save(price);
      availability = await getRepository(ProductAvailabilityStore).create(object2);
      availability = await getRepository(ProductAvailabilityStore).save(availability);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    console.log(e);
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/stores/one/' + req.params.parent);
});

router.post('/:parent/products/one/:index/delete',  async (req, res) => {
  try {
    if (req.params.index && req.params.parent) {
      await getRepository(ProductPriceStore).delete({storeId: req.params.parent, productId: req.params.index});
      await getRepository(ProductAvailabilityStore).delete({storeId: req.params.parent, productId: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/stores/one/' + req.params.parent);
});



module.exports = router;