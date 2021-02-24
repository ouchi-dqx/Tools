function debug() {
    const params = {
        mode: "getAnalytics",
        getDate: "2021/02/22",
    }

    xhrSend(params, (res) => {
        $(".message").text(res[0].Data)
    })
}

function xhrSend(params, resFunc) {
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycby0mRAp5wucNNkiM72RdMowNc-JRDQyE5ip46pC7uw/dev",
        async: false,
        cache: false,
        type: "GET",
        dataType: "jsonp",
        data: params,
        beforeSend: XMLHttpRequest => {
            //iPhone周りのエラー対策
            if (window.navigator.userAgent.toLowerCase().indexOf('safari') != -1)
                XMLHttpRequest.setRequestHeader("If-Modified-Since", new Date().toUTCString())
        },
        success: res => resFunc(res),
        error: (XMLHttpRequest, textStatus, errorThrown) => {
            $(".message").html(
                "ERROR!!<br>" +
                "XMLHttpRequest.status:" + XMLHttpRequest.status + "<br>" +
                "XMLHttpRequest.statusText:" + XMLHttpRequest.statusText + "<br>" +
                "textStatus:" + textStatus + "<br>" +
                "errorThrown:" + errorThrown.message
            );
        }
    })
}