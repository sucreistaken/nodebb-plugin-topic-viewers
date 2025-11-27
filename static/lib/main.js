'use strict';

$(window).on('action:ajaxify.end', function (ev, data) {
    // 1. Kayıt Mantığı (Sadece konu sayfasında)
    if (ajaxify.data.template.name === 'topic') {
        socket.emit('plugins.topicViewers.record', { tid: ajaxify.data.tid });
    }

    // 2. Modal Açma Mantığı (Global çalışabilir)
    // Widget'a tıklandığında Bootstrap Modal'ı aç
    $('body').on('click', '.topic-viewers-facepile', function() {
        var targetModal = $(this).data('target');
        $(targetModal).modal('show');
    });
});