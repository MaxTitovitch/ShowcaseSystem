import { getRepository } from 'typeorm'
import { Promotion } from '../entity/Promotion'

const express = require('express');
const router = express.Router();

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/static/images/promotion')
  },
  filename: function (req, file, cb) {
    let name = Date.now() + '-' + file.fieldname + '.' + file.originalname.split('.').reverse()[0];
    req.body[file.fieldname] = name;
    cb(null, name)
  }
});

var upload = multer({ storage: storage });

router.get('/',  async (req, res) => {
  let promotions = await getRepository(Promotion).createQueryBuilder("promotion").orderBy('id').getMany();
  res.render('promotion/promotions', {entities: promotions, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  if(req.params.index) {
    let promotion = await getRepository(Promotion).findOne({id: req.params.index});
    res.render('promotion/promotion', {entity: promotion, path: '/admin/promotions/one/' + promotion.id, nameAction: 'Обновление'});
  } else {
    res.render('promotion/promotion', {entity: null, path: '/admin/promotions/one', nameAction: 'Создание'});
  }
});

router.post('/one/:index?', upload.fields([
    { name: 'picture_small', maxCount: 1 },
    { name: 'picture_medium', maxCount: 1 },
    { name: 'picture_big', maxCount: 1 },
]),  async (req, res) => {
  let promotion, path = '/static/images/promotion/';
  try {
    let object = {
      id: req.body.id,
      title: req.body.title,
      terms: req.body.terms,
      starting: req.body.starting,
      ending: req.body.ending,
      pictureBig: req.body.picture_big ? path + req.body.picture_big : '',
      pictureMedium: req.body.picture_medium ? path + req.body.picture_medium : '',
      pictureSmall: req.body.picture_small ? path + req.body.picture_small : '',
      bigShow: req.body.big_show || '0',
      mediumShow: req.body.medium_show || '0',
      smallShow: req.body.small_show || '0',
    };
    if(req.params.index) {
      if(object.pictureBig == '') {
        delete object.pictureBig;
      }
      if(object.pictureMedium == '') {
        delete object.pictureMedium;
      }
      if(object.pictureSmall == '') {
        delete object.pictureSmall;
      }
      promotion = await getRepository(Promotion).update({id: req.params.index}, object);
      promotion.id = req.params.index;
    } else {
      promotion = await getRepository(Promotion).create( object);
      promotion = await getRepository(Promotion).save(promotion);
    }
    req.flash('success', 'Запись успешно сохранена!');
    res.redirect('/admin/promotions/one/' + promotion.id);
  } catch (e) {
    req.flash('error', 'Ошибка сохранения!');
    res.redirect('/admin/promotions');
  }
});

router.post('/delete/:index?',  async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Promotion).delete({id: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/promotions');
});



module.exports = router;