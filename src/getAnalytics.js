function debug() {
    let Time = new Date();
    Time.setDate(Time.getDate() - 1)
    Time = Time.getFullYear() + "/" +
        ("0" + (Time.getMonth() + 1)).slice(-2) + "/" +
        ("0" + Time.getDate()).slice(-2)

    const params = {
        mode: "getAnalytics",
        getDate: Time
    }

    xhrSend(params, (res) => {
        const myData = document.getElementById('AnalyticsChart');

        let Times = [];
        for (let i = 0; i <= 23; i++) Times.push(i + "時");

        const chart = new Chart(myData, {
            type: "line",
            data: {
                labels: Times,
                datasets: [
                    {
                        label: '昨日のユーザー数',
                        backgroundColor: "rgb(10, 150, 190)",
                        borderColor: "rgb(10, 150, 190)",
                        data: res[0].Data.split(","),
                        lineTension: 0,
                        fill: false,
                    },
                    {
                        label: '一昨日のユーザー数',
                        backgroundColor: "rgb(10, 150, 190)",
                        borderColor: "rgb(10, 150, 190)",
                        borderDash: [5, 3],
                        data: [0],
                        lineTension: 0,
                        fill: false,
                        hidden: true,
                    }
                ]
            },
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "時"
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: "人"
                        }
                    }]
                },
                tooltips: {
                    filter: (item, Data) => {
                        const label = Data.datasets[item.datasetIndex].label;
                        if (label == "昨日のユーザー数") return true;
                        if (label == "一昨日のユーザー数") return true;//false
                    },
                    callbacks: {
                        afterLabel: (item, Data) => {
                            //return "test"
                        },
                    }
                }
            }
        })
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