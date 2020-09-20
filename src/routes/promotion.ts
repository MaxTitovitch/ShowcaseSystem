import { getRepository } from 'typeorm'
import { Promotion } from '../entity/Promotion'

const express = require('express');
const router = express.Router();

var multer  = require('multer');
// var upload = multer({ dest: 'src/static/images/promotion/' });
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

router.post('/one/:index?', upload.single('picture_small'),  async (req, res) => {

  let filedata = req.file;
  console.log(req.body);

  // let promotion;
  // try {
  //   let object = {
  //     title: req.body.title,
  //     terms: req.body.terms,
  //     starting: req.body.starting,
  //     ending: req.body.ending,
  //     picture_big: req.body.picture_big,
  //     picture_medium: req.body.picture_medium,
  //     picture_small: req.body.picture_small,
  //     big_show: req.body.big_show,
  //     medium_show: req.body.medium_show,
  //     small_show: req.body.small_show,
  //   };
  //   if(req.params.index) {
  //     promotion = await getRepository(Promotion).update({id: req.params.index}, object);
  //     promotion.id = req.params.index;
  //   } else {
  //     promotion = await getRepository(Promotion).create( object);
  //     promotion = await getRepository(Promotion).save(promotion);
  //   }
  //   req.flash('success', 'Запись успешно сохранена!');
  // } catch (e) {
  //   req.flash('error', 'Ошибка сохранения!');
  // }
  // res.redirect('/admin/promotions/one/' + promotion.id);
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