import { getRepository } from 'typeorm'
import { Region } from '../entity/Region'
import {ProductToCategoryBinding} from "../entity/ProductToCategoryBinding";
import {RecommendedProducts} from "../entity/RecommendedProducts";
import {ProductPrice} from "../entity/ProductPrice";
import {ProductAvailability} from "../entity/ProductAvailability";
import {Promotion} from "../entity/Promotion";
import {Product} from "../entity/Product";

const express = require('express');
const router = express.Router();


router.get('/',  async (req, res) => {
  let regions = await getRepository(Region).createQueryBuilder("region").orderBy('id').getMany();
  res.render('region/regions', {entities: regions, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  if(req.params.index) {
    let region = await getRepository(Region).findOne({id: req.params.index}), regionProducts = [], disabledId = [];
    let price = await getRepository(ProductPrice).createQueryBuilder("PRODUCT_PRICE")
        .where('region_id = :region_id', {region_id: req.params.index}).getMany();
    let availability = await getRepository(ProductAvailability).createQueryBuilder("PRODUCT_AVAILABILITY")
        .where('region_id = :region_id', {region_id: req.params.index}).getMany();
    let promotions = await getRepository(Promotion).createQueryBuilder("promotion").orderBy('id').getMany();
    let products = await getRepository(Product).createQueryBuilder("product").orderBy('article').getMany();
    for (let i = 0; i < price.length; i++) {
      regionProducts.push({
        regionId: price[i].regionId,
        productId: price[i].productId,
        price: price[i].price,
        discountPrice: price[i].discountPrice,
        promotionId: price[i].promotionId,
        availability: availability[i].availability,
        quantity: availability[i].quantity,
      });
      disabledId.push(price[i].productId);
    }
    res.render('region/region', {entity: region, path: '/admin/regions/one/' + region.id, nameAction: 'Обновление', promotions, products, regionProducts, disabledId});
  } else {
    res.render('region/region', {entity: null, path: '/admin/regions/one', nameAction: 'Создание'});
  }
});

router.post('/one/:index?',  async (req, res) => {
  let region;
  try {
    let object = {
      name: req.body.name,
    };
    if(req.params.index) {
      region = await getRepository(Region).update({id: req.params.index}, object);
      region.id = req.params.index;
    } else {
      region = await getRepository(Region).create( object);
      region = await getRepository(Region).save(region);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/regions/one/' + region.id);
});

router.post('/delete/:index?',  async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Region).delete({id: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/regions');
});






router.post('/:parent/products/one/:index?',  async (req, res) => {
  try {
    let object1 = {
      regionId: req.params.parent,
      productId: req.body.product_id,
      price: req.body.price,
      discountPrice: req.body.discount_price,
      promotionId: req.body.promotion_id
    }, object2 = {
      regionId: req.params.parent,
      productId: req.body.product_id,
      availability: req.body.availability,
      quantity: req.body.quantity
    }, price, availability;
    if(req.params.index) {
      price = await getRepository(ProductPrice).update({regionId: req.params.parent, productId: req.params.index}, object1);
      availability = await getRepository(ProductAvailability).update({regionId: req.params.parent, productId: req.params.index}, object2);
    } else {
      price = await getRepository(ProductPrice).create(object1);
      price = await getRepository(ProductPrice).save(price);
      availability = await getRepository(ProductAvailability).create(object2);
      availability = await getRepository(ProductAvailability).save(availability);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    console.log(e);
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/regions/one/' + req.params.parent);
});

router.post('/:parent/products/one/:index/delete',  async (req, res) => {
  try {
    if (req.params.index && req.params.parent) {
      await getRepository(ProductPrice).delete({regionId: req.params.parent, productId: req.params.index});
      await getRepository(ProductAvailability).delete({regionId: req.params.parent, productId: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/regions/one/' + req.params.parent);
});


module.exports = router;