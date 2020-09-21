import { getRepository } from 'typeorm'
import { Store } from '../entity/Store'
import {Promotion} from "../entity/Promotion";
import {Region} from "../entity/Region";

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
    let store = await getRepository(Store).findOne({id: req.params.index});
    store.openingHours = JSON.parse(store.openingHours);
    store.promotions = JSON.parse(store.promotions);

   let position = {latitude: `${store.latitude.toFixed(6)}`, longitude: `${store.longitude.toFixed(6) }`};
    res.render('store/store', {entity: store, path: '/admin/stores/one/' + store.id, nameAction: 'Обновление', promotions, regions, position});
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



module.exports = router;