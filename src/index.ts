import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
// import * as bodyParser from "body-parser";
import {Admin} from "./entity/Admin";
import {User} from "./controller/User";

const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const crypto = require('crypto');

// require('./config/passport');

createConnection().then(async connection => {
    const app = express();
    app.use(morgan('dev'));

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
    app.set('view engine', 'handlebars');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({
        cookie: { maxAge: 60000 },
        secret: 'codeworkrsecret',
        saveUninitialized: false,
        resave: false
    }));
    app.use(flash());
    app.use((req, res, next) => {
        res.locals.success_mesages = req.flash('success');
        res.locals.error_messages = req.flash('error');
        next()
    });

    let auth = async function(req, res, next) {
        let admin = await getRepository(Admin).findOne({id: req.session.admin_id});
        if(admin) {
            next();
        } else {
            res.redirect("/auth");
        }
    };

    app.get('/auth', async (req, res) => {
        // res.locals.error_messages = req.flash('error');
        let admin = await getRepository(Admin).findOne({id: req.session.admin_id});
        if(admin) {
            res.redirect("/admin/admins");
        } else {
            res.render('login');
        }
    });

    app.post('/auth-data', async (req, res) => {
        let admin = await getRepository(Admin).findOne({
            login: req.body.login,
            password: crypto.createHmac('sha512', req.body.password).digest('hex')
        });
        if(admin){
            req.session.admin_id = admin.id;
            res.redirect('/admin/admins');
        } else {
            req.flash('error', 'Не верные логин и\\или пароль!');
            res.redirect('/auth');
        }
    });

    app.get('/logout', async (req, res) => {
        req.session.admin_id = null;
        res.redirect("/");
    });

    app.use('/admin', auth, require('./routes/admin'));
    app.use('/', require('./routes/user'));


    app.use((req, res, next) => {
        res.redirect("/");
    });

    app.listen(3000, () => console.log('Server started listening on port 3000!'))
    // app.listen(3000);
    // console.log("Express server has started on port 3000....");
}).catch(error => console.log(error));
