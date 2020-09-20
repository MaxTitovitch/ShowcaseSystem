import { getRepository } from 'typeorm'
import { Region } from '../entity/Region'

const express = require('express');
const router = express.Router();


router.get('/',  async (req, res) => {
  let regions = await getRepository(Region).createQueryBuilder("region").orderBy('id').getMany();
  res.render('region/regions', {entities: regions, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  if(req.params.index) {
    let region = await getRepository(Region).findOne({id: req.params.index});
    res.render('region/region', {entity: region, path: '/admin/regions/one/' + region.id, nameAction: 'Обновление'});
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



module.exports = router;