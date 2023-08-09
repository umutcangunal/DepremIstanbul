var myMap, customMarker;
var currentLocation; // Anlık konumu saklamak için değişken
var markers = []; // İşaretçileri saklamak için dizi
var emergencyForm; // Formu tanımlamak için değişken

function initMap() {
    const initialLocation = { lat: 0, lng: 0 }; // Başlangıçta haritanın merkezi

    myMap = new google.maps.Map(document.getElementById('map'), {
        center: initialLocation,
        zoom: 15 // Başlangıç yakınlaştırma düzeyi
    });

    customMarker = new google.maps.Marker({
        map: myMap,
        animation: google.maps.Animation.DROP, // İşaretçi düşer gibi belirecek
        draggable: true // İşaretçinin sürüklenebilir olması
    });

    // İşaretçiye tıklandığında, formdaki bilgileri içine yaz
    google.maps.event.addListener(customMarker, 'click', function() {
        showInfoWindow();
    });

    // İşaretçi sürüklendiğinde, adres alanını otomatik doldur
    google.maps.event.addListener(customMarker, 'dragend', function() {
        getAddressFromMarker();
    });

    // Kişinin harita üzerine tıklayarak işaretçi ekleyebilmesi
    google.maps.event.addListener(myMap, 'click', function(event) {
        customMarker.setPosition(event.latLng);
        getAddressFromMarker();
    });

    // Konumu almak için izin isteyin
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            myMap.setCenter(pos); // Haritayı alınan konuma taşı
            customMarker.setPosition(pos); // İşaretçiyi alınan konuma taşı
            getAddressFromMarker();
        }, function () {
            handleLocationError(true, customMarker, myMap.getCenter());
        });
    } else {
        // Tarayıcı konum almayı desteklemiyor
        handleLocationError(false, customMarker, myMap.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, customMarker, pos) {
    customMarker.setPosition(pos);
    customMarker.setAnimation(google.maps.Animation.BOUNCE); // İşaretçi zıplar gibi belirecek
    alert(browserHasGeolocation ?
        'Konum alınamadı. Lütfen konum iznini kontrol edin.' :
        'Tarayıcınız konum almayı desteklemiyor.');
}

function showInfoWindow() {
    const emergencyForm = document.getElementById('emergencyForm');
    const fullName = emergencyForm.elements.fullName.value;
    const phone = emergencyForm.elements.phone.value;
    const status = emergencyForm.elements.status.value;
    const address = emergencyForm.elements.address.value;
    const message = emergencyForm.elements.message.value;
    const photo = emergencyForm.elements.photo.files[0];

    let photoUrl = null;
    if (photo) {
        photoUrl = URL.createObjectURL(photo);
    }

    const infoWindowContent = `
        <div>
            <h3>${fullName}</h3>
            <p>Telefon: ${phone}</p>
            <p>Durum: ${status}</p>
            <p>Adres: ${address}</p>
            <p>Mesaj: ${message}</p>
            <img src="${photoUrl}" alt="Fotoğraf" width="200">
        </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    infoWindow.open(myMap, customMarker);
}

function getAddressFromMarker() {
    const geocoder = new google.maps.Geocoder();
    const latLng = customMarker.getPosition();

    geocoder.geocode({ location: latLng }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                const address = results[0].formatted_address;
                document.getElementById('address').value = address;
            } else {
                console.log('Adres bulunamadı.');
            }
        } else {
            console.log('Adres alınamadı. Hata kodu: ' + status);
        }
    });
}

function returnToCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            myMap.setCenter(pos); // Haritayı anlık konuma taşı
            customMarker.setPosition(pos); // İşaretçiyi anlık konuma taşı
            getAddressFromMarker();
        }, function () {
            handleLocationError(true, customMarker, myMap.getCenter());
        });
    } else {
        // Tarayıcı konum almayı desteklemiyor
        handleLocationError(false, customMarker, myMap.getCenter());
    }
}

function clearFormFields() {
    emergencyForm.reset(); // Formu sıfırla
}

document.addEventListener('DOMContentLoaded', function() {
    emergencyForm = document.getElementById('emergencyForm');
    emergencyForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Yeni bir işaretçi eklemek için diziye öğe ekle
        const markerData = {
            position: customMarker.getPosition(),
            fullName: emergencyForm.elements.fullName.value,
            phone: emergencyForm.elements.phone.value,
            status: emergencyForm.elements.status.value,
            address: emergencyForm.elements.address.value,
            message: emergencyForm.elements.message.value,
            photo: emergencyForm.elements.photo.files[0]
        };

        markers.push(markerData);

        // Yeni bir işaretçi oluştur
        customMarker = new google.maps.Marker({
            map: myMap,
            position: markerData.position,
            animation: google.maps.Animation.DROP,
            draggable: true
        });

        // Gönderilen form bilgilerini işaretçiyle ilişkilendirilen bir anahtar altında sakla
        customMarker.markerData = markerData;

        // İşaretçiye tıklandığında, formdaki bilgileri içine yaz
        google.maps.event.addListener(customMarker, 'click', function() {
            showInfoWindow();
        });

        // İşaretçi sürüklendiğinde, adres alanını otomatik doldur
        google.maps.event.addListener(customMarker, 'dragend', function() {
            getAddressFromMarker();
        });

        // Bilgileri işaretçiyle ilişkilendirildikten sonra info penceresini aç
        showInfoWindow();

        // Formu gönderdikten sonra form alanlarını temizle
        clearFormFields();
    });
});
