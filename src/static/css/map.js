var myMap;
var placemarkCollections = {};
var placemarkList = {};

// Список городов и магазинов в них
var shopList = [
    {
        'cityName': 'Москва',
        'shops': [
            {'coordinates': [55.72532368326033, 37.748675112058876], 'name': 'Рязанский проспект, 6Ас21'},
            {'coordinates': [55.701677873469, 37.57358050756649], 'name': 'Ленинский проспект, 47с2'}
        ]
    },
    {
        'cityName': 'Санкт-Петербург',
        'shops': [
            {'coordinates': [59.863210042666125, 30.37903938671841], 'name': 'Будапештская улица, 36к2'},
            {'coordinates': [59.99486277158917, 30.406505207030918], 'name': 'проспект Непокорённых'}
        ]
    }
];

ymaps.ready(init);

function init() {

    // Создаем карту
    myMap = new ymaps.Map("map", {
        center: [56, 37],
        zoom: 8,
        controls: [
            'zoomControl'
        ],
        zoomMargin: [20]
    });

    for (var i = 0; i < shopList.length; i++) {

        // Добавляем название города в выпадающий список
        $('select#cities').append('<option value="' + i + '">' + shopList[i].cityName + '</option>');

        // Создаём коллекцию меток для города
        var cityCollection = new ymaps.GeoObjectCollection();

        for (var c = 0; c < shopList[i].shops.length; c++) {
            var shopInfo = shopList[i].shops[c];

            var shopPlacemark = new ymaps.Placemark(
                shopInfo.coordinates,
                {
                    hintContent: shopInfo.name,
                    balloonContent: shopInfo.name
                }
            );

            if (!placemarkList[i]) placemarkList[i] = {};
            placemarkList[i][c] = shopPlacemark;

            // Добавляем метку в коллекцию
            cityCollection.add(shopPlacemark);

        }

        placemarkCollections[i] = cityCollection;

        // Добавляем коллекцию на карту
        myMap.geoObjects.add(cityCollection);

    }

    $('select#cities').trigger('change');
}


// Переключение города
$(document).on('change', $('select#city'), function () {
    var cityId = $('select#cities').val();

    // Масштабируем и выравниваем карту так, чтобы были видны метки для выбранного города
    myMap.setBounds(placemarkCollections[cityId].getBounds(), {checkZoomRange:true}).then(function(){
        if(myMap.getZoom() > 15) myMap.setZoom(15); // Если значение zoom превышает 15, то устанавливаем 15.
    });

    $('#shops').html('');
    for (var c = 0; c < shopList[cityId].shops.length; c++) {
        $('#shops').append('<li value="' + c + '">' + shopList[cityId].shops[c].name + '</li>');
    }

});

// Клик на адрес
$(document).on('click', '#shops li', function () {

    var cityId = $('select#cities').val();
    var shopId = $(this).val();

    placemarkList[cityId][shopId].events.fire('click');
});
