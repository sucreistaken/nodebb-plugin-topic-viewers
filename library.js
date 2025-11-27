'use strict';

const plugin = {};

// Zaman formatlayıcı
function timeAgo(timestamp) {
    if (!timestamp) return "";
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "ay";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "g";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "s";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "dk";
    return "Şimdi";
}


plugin.init = async function (params) {
    const socketPlugins = require.main.require('./src/socket.io/plugins');
    const db = require.main.require('./src/database');

    if (!socketPlugins.topicViewers) socketPlugins.topicViewers = {};

    socketPlugins.topicViewers.record = async function (socket, data) {
        if (!socket.uid || socket.uid <= 0 || !data.tid) return;
        
        // Topic için kayıt
        await db.sortedSetAdd(`topic:${data.tid}:viewers`, Date.now(), socket.uid);
    };
};

//widget tanım
plugin.defineWidgets = async function(widgets) {
    widgets.push({
        widget: "topic-viewers",
        name: "Konu Görüntüleyenler (Facepile UI)",
        description: "Modern, az yer kaplayan popup'lı tasarım.",
        content: ""
    });
    return widgets;
};

// widget görüntüleme
plugin.renderWidget = async function(widget) {
    try {
        const db = require.main.require('./src/database');
        const user = require.main.require('./src/user');

        let tid = widget.templateData ? widget.templateData.tid : null;
        if (!tid) return null;

        // son 9999 kişi (Modal için)
        const viewsData = await db.getSortedSetRevRangeWithScores(`topic:${tid}:viewers`, 0, 9999);
        
        if (!viewsData || !viewsData.length) return null; // Kimse yoksa widget'ı gösterme

        const totalCount = await db.sortedSetCard(`topic:${tid}:viewers`); // Toplam sayı
        const uids = viewsData.map(item => item.value);
        const viewers = await user.getUsersFields(uids, ['uid', 'username', 'userslug', 'picture', 'icon:bgColor']);

        // preview
        //  ilk x kişiyi gösterelim
        const previewLimit = 5;
        let facepileHtml = '';
        
        viewers.slice(0, previewLimit).forEach((v, index) => {
            let avatar = v.picture 
                ? `<img src="${v.picture}" style="width:100%; height:100%; object-fit:cover;">`
                : `<div style="width:100%; height:100%; background:${v['icon:bgColor'] || '#666'}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px;">${v.username[0].toUpperCase()}</div>`;
            
            // z-index: soldaki sağdakinin üstünde dursun diye
            // margin-left: -10px -> iç içe geçme efekti
            facepileHtml += `
                <div style="
                    width: 30px; height: 30px; 
                    border-radius: 50%; 
                    overflow: hidden; 
                    border: 2px solid #fff; 
                    margin-left: ${index === 0 ? '0' : '-10px'};
                    z-index: ${10 - index};
                    position: relative;
                    background: #eee;
                ">${avatar}</div>`;
        });

        // "+X kişi" yazısı
        let moreCountText = '';
        if (totalCount > previewLimit) {
            moreCountText = `<span style="margin-left: 8px; font-size: 12px; color: #666; font-weight: 600;">+${totalCount - previewLimit} diğer</span>`;
        }

        //popup
        let modalListHtml = '<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center;">';
        viewers.forEach((v, index) => {
             let avatar = v.picture 
                ? `<img src="${v.picture}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">`
                : `<div style="width:40px; height:40px; background:${v['icon:bgColor'] || '#666'}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:bold;">${v.username[0].toUpperCase()}</div>`;
             
             let time = timeAgo(viewsData[index].score);
             
             modalListHtml += `
                <a href="/user/${v.userslug}" style="text-decoration:none; text-align:center; width: 60px;">
                    ${avatar}
                    <div style="font-size:11px; color:#333; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">${v.username}</div>
                    <div style="font-size:9px; color:#999;">${time}</div>
                </a>
             `;
        });
        modalListHtml += '</div>';

        //html
        const modalId = `viewersModal_${tid}`;
        
        widget.html = `
            <div class="topic-viewers-facepile" data-target="#${modalId}" style="
                display: flex; 
                align-items: center; 
                cursor: pointer; 
                padding: 10px;
                background: #f8f9fa;
                border-radius: 8px;
                transition: background 0.2s;
            " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                
                <div style="font-size: 11px; color: #999; margin-right: 10px; font-weight:bold;">GÖRÜNTÜLEYENLER</div>
                
                <div style="display:flex; align-items:center;">
                    ${facepileHtml}
                </div>
                ${moreCountText}
            </div>

            <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" style="font-weight:bold;">Bu konuya bakanlar</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                            ${modalListHtml}
                        </div>
                        <div class="modal-footer">
                            <small class="text-muted">Toplam ${totalCount} kişi görüntüledi</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (err) {
        console.error(err);
        widget.html = '';
    }
    return widget;
};

module.exports = plugin;