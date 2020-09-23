import "reflect-metadata";
import {createConnection, getRepository} from "typeorm";
import * as express from "express";
// import * as bodyParser from "body-parser";
import {Admin} from "./entity/Admin";
import {User} from "./controller/User";
import {Product} from "./entity/Product";
import {ProductAvailabilityStore} from "./entity/ProductAvailabilityStore";

const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressHandlebars = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const crypto = require('crypto');
const helpers = require('handlebars-helpers')();


createConnection().then(async connection => {
    const app = express();
    app.use(morgan('dev'));

    app.set('views', path.join(__dirname, 'views'));
    app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout', helpers: {
        arrayHours: function(array, index, secondIndex) {
            try {
                return array[index][secondIndex];
            } catch (e) {
                return '';
            }
        },
        consoleLog(value) {
            console.log(value);
            return value;
        },
        getPriceProduct (product, isOld = true) {
            if(isOld) {
                    return product.productPriceStores[0].price + "руб.";
            } else {
                return product.productPriceStores[0].discountPrice ? product.productPriceStores[0].discountPrice + "руб." : null;
            }
        },
        getPriceProductPrice (product, isOld = true, prep = '', isReturnOld, prep2 = '', end = 'руб.') {
            if(isOld) {
                if(product.productPriceStores[0].discountPrice) {
                    return prep + product.productPriceStores[0].price + end;
                }
            } else {
                if(!product.productPriceStores[0].discountPrice && isReturnOld) {
                    return prep2  + product.productPriceStores[0].price + end;
                }
                return product.productPriceStores[0].discountPrice ? (prep || '') + product.productPriceStores[0].discountPrice + end : null;
            }
        },
        getDiscountProduct (product) {
            if(product.productPriceStores[0].discountPrice) {
                return `Скидка ${((1 - (product.productPriceStores[0].discountPrice / product.productPriceStores[0].price)) * 100).toFixed(0)} %`;
            }else {
                return '';
            }
        },
        getRomp(product){
            if (product.productAvailabilityStores[0].quantity < 10 ) {
                return '/static/img/boxes.png';
            }else if (product.productAvailabilityStores[0].quantity >= 10 && product.productAvailabilityStores[0].quantity < 20) {
                return '/static/img/boxes1.png';
            }else if (product.productAvailabilityStores[0].quantity >= 20 && product.productAvailabilityStores[0].quantity < 30) {
                return '/static/img/boxes2.png';
            }else if (product.productAvailabilityStores[0].quantity >= 30 && product.productAvailabilityStores[0].quantity < 40) {
                return '/static/img/boxes3.png';
            }else if (product.productAvailabilityStores[0].quantity >= 40 && product.productAvailabilityStores[0].quantity < 50) {
                return '/static/img/boxes4.png';
            }else  {
                return '/static/img/boxes5.png';
            }
        },
        getProductCategory (product, param, isParent = false) {
            if(isParent) {
                return product.productToCategoryBindings[0].category.parent[param];
            } else {
                return product.productToCategoryBindings[0].category[param];
            }
        },
        isProductCategory(category, options) {
            if(category.parentId !== category.id) {
                return options.fn(category.parent);
            } else {
                return options.inverse(false);
            }
        },
        selectedOrder(field, orderField, orderDirection, options) {
            if(field == `${orderField}_${orderDirection}`) {
                return 'selected';
            } else {
                return '';
            }
        },
        hasAction(product, options) {
            if(product.productPriceStores[0].discountPrice) {
                return options.fn(((1 - (product.productPriceStores[0].discountPrice / product.productPriceStores[0].price)) * 100).toFixed(0));
            }else {
                return options.inverse(false);
            }
        },
        firstPercent(priceSort) {
            if(priceSort.from) {
                return priceSort.from / 10000 * 100;
            } else {
                return '0';
            }
        },
        secondPercent(priceSort) {
            if(priceSort.to) {
                return priceSort.to / 10000 * 100;
            } else {
                return '100';
            }
        },
        async getProductStoreInfo(product, options) {
            try {
                let productAvailabilityStores = await getRepository(ProductAvailabilityStore).createQueryBuilder("PRODUCT_AVAILABILITY_STORE")
                    .leftJoinAndSelect("PRODUCT_AVAILABILITY_STORE.store", "STORE")
                    .where(`"PRODUCT_AVAILABILITY_STORE"."PRODUCT_ID" = '${product.article}'`)
                    .orderBy('PRODUCT_AVAILABILITY_STORE.STORE_ID').getMany();
                return options.fn(productAvailabilityStores);
            } catch (e) {
                return options.inverse(false);
            }
        },
    }}));
    app.set('view engine', 'handlebars');

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(express.static(__dirname));
    // app.use(multer({dest:"uploads"}).single("filedata"));
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
    app.use("/static", express.static(__dirname + "/static"));

    let auth = async function(req, res, next) {
        let admin = await getRepository(Admin).findOne({id: req.cookies.admin_id});
        if(admin) {
            next();
        } else {
            res.redirect("/auth");
        }
    };

    app.get('/auth', async (req, res) => {
        let admin = await getRepository(Admin).findOne({id: req.cookies.admin_id});
        if(admin) {
            res.redirect("/admin/admins");
        } else {
            res.render('login', {layout: null});
        }
    });

    app.post('/auth-data', async (req, res) => {
        let admin = await getRepository(Admin).findOne({
            login: req.body.login,
            password: crypto.createHmac('sha512', req.body.password).digest('hex')
        });
        if(admin){
            res.cookie('admin_id', admin.id);
            res.redirect('/admin/admins');
        } else {
            req.flash('error', 'Не верные логин и\\или пароль!');
            res.redirect('/auth');
        }
    });

    app.get('/logout', async (req, res) => {
        res.cookie('admin_id', 0);
        res.redirect("/");
    });

    app.use('/admin/admins', auth, require('./routes/admin'));
    app.use('/admin/regions', auth, require('./routes/region'));
    app.use('/admin/promotions', auth, require('./routes/promotion'));
    app.use('/admin/categories', auth, require('./routes/category'));
    app.use('/admin/products', auth, require('./routes/product'));
    app.use('/admin/stores', auth, require('./routes/store'));
    app.use('/', require('./routes/user'));


    app.use((req, res, next) => {
        res.redirect("/");
    });

    app.listen(3000, () => console.log('Server started listening on port 3000!'))
}).catch(error => console.log(error));
