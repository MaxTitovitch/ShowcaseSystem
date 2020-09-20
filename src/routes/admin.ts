import { getRepository } from 'typeorm'
import { Admin } from '../entity/Admin'

const express = require('express');
const router = express.Router();
const crypto = require('crypto');


router.get('/',  async (req, res) => {
  let admins = await getRepository(Admin).createQueryBuilder("admin").orderBy('id').getMany();
  res.render('admin/admins', {entities: admins, messageStatus: res.locals});
});

router.get('/one/:index?',  async (req, res) => {
  console.log(res.locals)
  if(req.params.index) {
    let admin = await getRepository(Admin).findOne({id: req.params.index});
    res.render('admin/admin', {entity: admin, path: '/admin/admins/one/' + admin.id, nameAction: 'Обновление'});
  } else {
    res.render('admin/admin', {entity: null, path: '/admin/admins/one', nameAction: 'Создание'});
  }
});

router.post('/one/:index?',  async (req, res) => {
  let admin;
  try {
    let object = {
      login: req.body.login,
      password: crypto.createHmac('sha512', req.body.password).digest('hex'),
    };
    if(req.params.index) {
      admin = await getRepository(Admin).update({id: req.params.index}, object);
      admin.id = req.params.index;
    } else {
      admin = await getRepository(Admin).create( object);
      admin = await getRepository(Admin).save(admin);
    }
    req.flash('success', 'Запись успешно сохранена!');
  } catch (e) {
    req.flash('error', 'Ошибка сохранения!');
  }
  res.redirect('/admin/admins/one/' + admin.id);
});

router.post('/delete/:index?',  async (req, res) => {
  try {
    if (req.params.index) {
      await getRepository(Admin).delete({id: req.params.index});
      req.flash('success', 'Запись успешно удалена!');
    } else {
      req.flash('error', 'Некорректный ИД!');
    }
  } catch (e) {
    req.flash('error', 'Ошибка удаления!');
  }
  res.redirect('/admin/admins');
});



module.exports = router;