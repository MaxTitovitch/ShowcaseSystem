import {createQueryBuilder, getConnection, getRepository} from "typeorm";
import {Store} from "../entity/Store";
import {Admin} from "../entity/Admin";
import {Region} from "../entity/Region";
import {Category} from "../entity/Category";
import {ProductPriceStore} from "../entity/ProductPriceStore";
import {Product} from "../entity/Product";
import {Promotion} from "../entity/Promotion";
import {ProductAvailabilityStore} from "../entity/ProductAvailabilityStore";

const express = require('express');
const router = express.Router();

const nodemailer = require('nodemailer');

let getActions = async function(store) {
  let promotions = await getRepository(Promotion).createQueryBuilder("promotion")
      .orderBy('id').getMany(), rand;
  rand = Math.floor(Math.random() * promotions.length);
  let promotionFirst = promotions[rand];

  promotions = [...promotions.slice(0, rand), ...promotions.slice(rand + 1)];
  rand = Math.floor(Math.random() * promotions.length);
  let promotionSecond = promotions[rand];

  let products1 = await getRepository(Product).createQueryBuilder("product")
      .leftJoinAndSelect("product.productAvailabilityStores", "PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("product.productPriceStores", "PRODUCT_PRICE_STORE")
      // TODO Раскомент
      //  .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + store.id)
      .where('"PRODUCT_PRICE_STORE"."PROMOTION_ID" = \'' + promotionFirst.id + '\'')
      .orderBy('product.article').getMany();
  let products2 = await getRepository(Product).createQueryBuilder("product")
      .leftJoinAndSelect("product.productAvailabilityStores", "PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("product.productPriceStores", "PRODUCT_PRICE_STORE")
      // TODO Раскомент
      //  .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + store.id)
      .where('"PRODUCT_PRICE_STORE"."PROMOTION_ID" = \'' + promotionSecond.id + '\'')
      .orderBy('product.article').getMany();
  return [products1, products2, promotionFirst, promotionSecond]
};

router.use(async (req, res, next) => {
  let store = req.cookies.store;
  let region = req.cookies.region;
  let orderField = req.cookies.orderField;
  let orderDirection = req.cookies.orderDirection;
  let perPage = req.cookies.perPage;
  if(!store || !region) {
    store = await getRepository(Store).createQueryBuilder("store").orderBy('id').getOne();
    region = await getRepository(Region).createQueryBuilder("region").where('id = :id', {id: store.regionId}).orderBy('id').getOne();
    res.cookie('store', store);
    res.cookie('region', region);
  }
  if(!orderField) {
    orderField = 'PRICE';
    res.cookie('orderField', orderField);
  }
  if(!orderDirection) {
    orderDirection = 'ASC';
    res.cookie('orderDirection', orderDirection);
  }
  if(!perPage) {
    perPage = '24';
    res.cookie('perPage', perPage);
  }
  let categories = await getRepository(Category).createQueryBuilder("category").where('hidden = 0').orderBy('sort', 'DESC').getMany();
  let categoriesMenu = await getRepository(Category).createQueryBuilder("category").where('id = parent_id').andWhere('hidden = 0').limit(5).orderBy('sort', 'DESC').getMany();
  let products = await getActions(store);
  res.locals.store = store;
  res.locals.region = region;
  res.locals.categories = categories;
  res.locals.categoriesMenu = categoriesMenu;
  res.locals.actionFirst = products[0];
  res.locals.actionSecond = products[1];
  res.locals.promoFirst = products[2];
  res.locals.promoSecond = products[3];
  res.locals.orderType = {orderField, orderDirection, perPage};
  // console.log(res.locals.orderType);
  next()
});

let getActionsMain = async function() {
  let promotions0 = await getRepository(Promotion).createQueryBuilder("promotion")
      .where('picture_big IS NOT NULL')
      .where('big_show = 1')
      .orderBy('id').getMany();
  let promotions1 = await getRepository(Promotion).createQueryBuilder("promotion")
      .where('picture_medium IS NOT NULL')
      .where('medium_show = 1')
      .orderBy('id').getMany();
  let promotions2 = await getRepository(Promotion).createQueryBuilder("promotion")
      .where('picture_small IS NOT NULL')
      .where('small_show = 1')
      .orderBy('id').getMany();
  return [promotions0, promotions1, promotions2]
};

router.get('/', async (req, res) => {
  let actions = await getActionsMain();
  res.render("user/index", {layout: null, big: actions[0], medium: actions[1], small: actions[2]});
});

router.get('/shares',async (req, res) => {
  let shares = await getRepository(Promotion).createQueryBuilder("promotion").orderBy('id').getMany();
  res.render("user/akcii", {layout: null, shares});
});

router.get('/categories/set-per-page/:index',async (req, res) => {
  if(['12', '24', '48'].lastIndexOf(req.params.index) !== -1){
    res.cookie('perPage', req.params.index);
  }
  res.redirect(req.header('Referer') || '/');
});
router.get('/categories/set-order',async (req, res) => {
  if(['PRICE_ASC', 'PRICE_DESC', 'NAME_ASC', 'NAME_DESC'].lastIndexOf(req.query.sort) !== -1){
    res.cookie('orderField', req.query.sort.split('_')[0]);
    res.cookie('orderDirection', req.query.sort.split('_')[1]);
  }
  res.redirect(req.header('Referer') || '/');
});

router.get('/shares/:index', (req, res) => {
  res.render("user/akcii-one", {layout: null});
});

function paginateAll(products, req) {
  let perPage = req.cookies.perPage;
  return [products.slice((((req.query.pages || 1) - 1 ) * perPage), (((req.query.pages || 1) - 1 ) * perPage) + perPage),  Math.ceil(products.length / perPage)];
}

router.get('/categories-show/:index', async (req, res) => {

  let table = req.cookies.orderField == 'NAME' ? 'product' : 'PRODUCT_PRICE_STORE';
  // let orderField = req.cookies.orderField == 'PRICE' ? `DISCOUNT_PRICE` : req.cookies.orderField;
  let categoryCurrent = await getRepository(Category).createQueryBuilder("CATEGORY")
      .leftJoinAndSelect("CATEGORY.parent", "CATEGORY_SHOW")
      .leftJoinAndSelect("CATEGORY.categories", "CATEGORY_SHOW_LITLE")
      .leftJoinAndSelect("CATEGORY_SHOW.categories", "CATEGORY_SHOW_PARENT_LITLE")
      .where('"CATEGORY"."ID" = ' + req.params.index)
      .andWhere('"CATEGORY_SHOW_PARENT_LITLE"."ID" != "CATEGORY_SHOW_PARENT_LITLE"."PARENT_ID"').getOne();

  let oldProducts = getRepository(Product).createQueryBuilder("product")
      .leftJoinAndSelect("product.productAvailabilityStores", "PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("product.productPriceStores", "PRODUCT_PRICE_STORE",
          '"PRODUCT_PRICE_STORE"."STORE_ID" = ' + req.cookies.store.id
          + ` AND (("PRODUCT_PRICE_STORE"."PRICE" BETWEEN ${req.query.from || 0} AND ${req.query.to || 100000} AND "PRODUCT_PRICE_STORE"."DISCOUNT_PRICE" IS NULL)`
          + ` OR ("PRODUCT_PRICE_STORE"."DISCOUNT_PRICE" BETWEEN ${req.query.from || 0} AND ${req.query.to || 100000} AND "PRODUCT_PRICE_STORE"."DISCOUNT_PRICE"  IS NOT NULL))`
      )
      .leftJoinAndSelect("product.productToCategoryBindings", "PRODUCT_TO_CATEGORY_BINDING")
      .leftJoinAndSelect("PRODUCT_TO_CATEGORY_BINDING.category", "CATEGORY")
      .leftJoinAndSelect("CATEGORY.parent", "CATEGORY_SHOW")
      // TODO Раскомент
      // .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + req.cookies.store.id)
      .where('"CATEGORY"."ID" = ' + req.params.index)
      .orWhere('"CATEGORY"."PARENT_ID" = ' + req.params.index)
      .orWhere('"CATEGORY_SHOW"."PARENT_ID" = ' + req.params.index);
  if(req.query.from && req.query.to){
    oldProducts = oldProducts
        .andWhere(`("PRODUCT_PRICE_STORE"."PRICE" BETWEEN ${req.query.from} AND ${req.query.to})`);
  }
  let products = await oldProducts.orderBy(`"${table}"."${req.cookies.orderField}"`, req.cookies.orderDirection).getMany();
  products = products.filter(function (el) {
    return el.productPriceStores.length > 0;
  });
  console.log(products);
  let paginate = paginateAll(products, req);
  products = paginate[0];
  let pages = {quantity: Number.parseInt(paginate[1]), current: Number.parseInt(req.query.pages || 1)};
  res.render("user/tovary", {layout: null, products, categoryCurrent, pages, priceSort: {from: req.query.from || null, to: req.query.to || null}, searchVal: null});
});

router.get('/categories/:index', async (req, res) => {
  let mainCategories = await getRepository(Category).createQueryBuilder("CATEGORY")
      .leftJoinAndSelect("CATEGORY.categories", "CATEGORY_SON")
      .andWhere(`CATEGORY.PARENT_ID = '${req.params.index}'`)
      .orderBy('CATEGORY.sort').getMany();
  res.render("user/kategory", {layout: null, mainCategories});
});

router.get('/map', async (req, res) => {
  let regions = await getRepository(Region).createQueryBuilder("REGION")
      .leftJoinAndSelect("REGION.stores", "STORE").orderBy('REGION.ID').getMany();
  res.render("user/map", {layout: null, regions});
});

router.get('/shop-check/:index', async (req, res) => {
  let store = await getRepository(Store).createQueryBuilder("STORE")
    .leftJoinAndSelect("STORE.region", "REGION")
    .where(`"STORE"."ID" = ${req.params.index}`).getOne();
  let region = store.region;
  res.cookie('store', store);
  res.cookie('region', region);

  res.send({store: store.name, region: region.name});
});

router.post('/availability/:index', async (req, res) => {
  let productAvailabilityStores = await getRepository(ProductAvailabilityStore).createQueryBuilder("PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("PRODUCT_AVAILABILITY_STORE.store", "STORE")
      .where(`"PRODUCT_AVAILABILITY_STORE"."PRODUCT_ID" = '${req.params.index}'`)
      .orderBy('PRODUCT_AVAILABILITY_STORE.STORE_ID').getMany();
  res.send(productAvailabilityStores);
});

router.get('/shop/:index/:success?', async (req, res) => {
  try {
    let shop = await getRepository(Store).createQueryBuilder("STORE")
        .leftJoinAndSelect("STORE.region", "REGION")
        .where(`"STORE"."ID" = ${req.params.index}`).getOne();
    shop.openingHours = JSON.parse(shop.openingHours);
    if(req.params.success) {
      res.locals.successmessage;
      res.render("user/one-magaz", {layout: null, shop, successmessage: 'Сообщение успешно отправлено'});
    } else {
      res.render("user/one-magaz", {layout: null, shop, successmessage: null});
    }
  } catch (e) {
    res.redirect('/');
  }
});

router.post('/shop/:index', async (req, res) => {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sportcompanyminsk@gmail.com',
        pass: 'awesomekpss2020'
      }
    });

    let e = await transporter.sendMail({
      from: '"МегаМаг" <sportcompanyminsk@gmail.com>',
      to: "maxtitovitch@mail.ru",
      subject: "Новое сообщение от пользователя МегаМаг",
      html: `<p><strong>От:</strong> ${req.body.name} (${req.body.email}, ${req.body.phone})</p><p><strong>Сообщение:</strong> ${req.body.message}</p>`
    });
    res.redirect("/shop/" + req.params.index + '/success');
  } catch (e) {
    res.redirect('/');
  }
});

router.get('/product/find', async (req, res) => {
  let query = '"PRODUCT_TO_CATEGORY_BINDING"."CATEGORY_ID" IS NOT NULL';
  if (req.query.category_id != '0'){
    query = `"PRODUCT_TO_CATEGORY_BINDING"."CATEGORY_ID" = ${req.query.category_id}`;
  }
  let product = await getRepository(Product).createQueryBuilder("PRODUCT")
      .leftJoinAndSelect("PRODUCT.productToCategoryBindings", "PRODUCT_TO_CATEGORY_BINDING", query)
      .leftJoinAndSelect("PRODUCT.productPriceStores", "PRODUCT_PRICE_STORE")
  //     // TODO Раскомент
  //     // .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + store.id)
      .andWhere(`"PRODUCT"."NAME" LIKE '%${req.query.s}%' OR "PRODUCT"."ARTICLE" LIKE '%${req.query.s}%'`).getOne();
  console.log(product);
  if(product) {
    res.redirect('/product/' + product.article);
  } else {
    res.redirect('/');
  }
});

router.get('/product/:index', async (req, res) => {
  let product = await getRepository(Product).createQueryBuilder("PRODUCT")
      .leftJoinAndSelect("PRODUCT.productAvailabilityStores", "PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("PRODUCT.productPriceStores", "PRODUCT_PRICE_STORE")
  //     // TODO Раскомент
  //     //  .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + store.id)
      .where(`"PRODUCT"."ARTICLE" = '${req.params.index}'`).getOne();
  product.pictureSet = JSON.parse(product.pictureSet);
  res.render("user/one-tovar", {layout: null, product});
});

router.get('/product-show/:index', async (req, res) => {
  let product = await getRepository(Product).createQueryBuilder("PRODUCT")
      .leftJoinAndSelect("PRODUCT.productAvailabilityStores", "PRODUCT_AVAILABILITY_STORE")
      .leftJoinAndSelect("PRODUCT.productPriceStores", "PRODUCT_PRICE_STORE")
      //     // TODO Раскомент
      //     //  .where('"PRODUCT_PRICE_STORE"."STORE_ID" = ' + store.id)
      .where(`"PRODUCT"."ARTICLE" = '${req.params.index}'`).getOne();
  product.pictureSet = JSON.parse(product.pictureSet);
  res.render("user/one-tovar1", {layout: null, product});
});

router.get('/list', (req, res) => {
  res.render("user/spisok", {layout: null});
});

module.exports = router;