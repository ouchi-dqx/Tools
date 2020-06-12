var Timers = {}
var TMP 

function debug(){
}

function OneBack(){
    $(".Servers").each(function(){
        if(TMP[0] == $(this).find(".Server").text()){
            $(this).find("." + TMP[1] + ">.setTemp2>.nowTime")
            .text(TMP[2]).css("background-color", TMP[3]),
            $(this).find("." + TMP[1] + ">.setTemp2>.befTime")
            .text(TMP[4]).css("background-color", TMP[5]),
            $(this).find("." + TMP[1] + ">.setTemp2>.memo").val(TMP[6])
            $(this).parent().find(".btn[value=Red]").prop("disabled", false)
            
            nowColor = $(this).find("." + TMP[1] + ">.setTemp2>.nowTime").css("background-color")
            switch(TMP[1]){
                case "geru":
                    TMP[1] = TMP[1].replace("geru","ゲル");
                    break;
                case "suna":
                    TMP[1] = TMP[1].replace("suna","砂漠");
                    break;
                case "baru":
                    TMP[1] = TMP[1].replace("baru","バル")
                    break;
            }
            if(nowColor != "rgb(255, 0, 0)"){
                clearInterval(Timers[TMP[0].slice(4) + TMP[1]])
            }
        }
    })
}

function clear_all(){
    var boxName = $(".ServerList").attr("id")
    flg = confirm("本当に削除していいですか？")

    if(flg){
        $(".Servers").each(function(){
            var Server = $(this).find(".Server").text().slice(4)
            
            $(this).find(".geru>.setTemp2>.nowTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".geru>.setTemp2>.befTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".geru>.setTemp2>.memo").val(""),
            clearInterval(Timers[Server + "ゲル"])

            $(this).find(".suna>.setTemp2>.nowTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".suna>.setTemp2>.befTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".suna>.setTemp2>.memo").val(""),
            clearInterval(Timers[Server+"砂漠"])

            $(this).find(".baru>.setTemp2>.nowTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".baru>.setTemp2>.befTime")
                .text("")
                .css("background-color", "white"),
            $(this).find(".baru>.setTemp2>.memo")
                .val("")
                .css("background-color", "white")
            clearInterval(Timers[Server+"バル"])
                
            $(this).parent().find(".btn[value=Red]").prop("disabled", false)
        })
    }
}

function fix_clear(val){
    flg = confirm("本当に削除していいですか？")

    if(val.value == "blue"　&& flg){
        $(".fix_blue").find(".fix").each(function(){
            $(this).closest("tr").remove()
        })
    }
    if(val.value == "red" && flg){
        $(".fix_red").find(".fix").each(function(){
            $(this).closest("tr").remove()
        })
    }
}

$(document).on('click', ".fix", function() {
    var fix_blue = []
    var fix_red = []

    flg = confirm("本当に削除していいですか？")
    if(flg){
        $(this).closest("tr").remove()
    }

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })
    
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))
})

$('.left').on('click', function() {
    if($(this).closest("td").prev("td").find("p").text() != "サーバー"){
        Point = $(this).closest("td").find("p").text()
        befPoint = $(this).closest("td").prev("td").find("p").text()

        switch(Point){
            case "ゲルヘナ幻野":
                Point = ".geru"
                break;
            case "ジャリムバハ砂漠":
                Point = ".suna"
                break;
            case "バルディスタ要塞":
                Point = ".baru"
                break;
        }
        switch(befPoint){
            case "ゲルヘナ幻野":
                befPoint = ".geru"
                break;
            case "ジャリムバハ砂漠":
                befPoint = ".suna"
                break;
            case "バルディスタ要塞":
                befPoint = ".baru"
                break;
        }

        if($(".ServerList").attr("id") == ""){
            $(this).closest("td").insertBefore($(this).closest("td").prev("td"))

            tmp1 = document.getElementById("template1")
            tmp2 = tmp1.content.querySelectorAll(".Servers")
            Point = tmp1.content.querySelectorAll(".Servers > " + Point)
            befPoint = tmp1.content.querySelectorAll(".Servers > " + befPoint)
            tmp2.item(0).insertBefore(Point.item(0),befPoint.item(0))
        }else{
            $(this).closest("td").insertBefore($(this).closest("td").prev("td"))

            for(i=0; i<10; i++){
                $(".Servers").find(Point).eq(i).insertBefore($(".Servers").find(befPoint).eq(i))
            }
        }
    }
})

$('.right').on('click', function() {
    Point = $(this).closest("td").find("p").text()
    afterPoint = $(this).closest("td").next("td").find("p").text()

    switch(Point){
        case "ゲルヘナ幻野":
            Point = ".geru"
            break;
        case "ジャリムバハ砂漠":
            Point = ".suna"
            break;
        case "バルディスタ要塞":
            Point = ".baru"
            break;
    }
    switch(afterPoint){
        case "ゲルヘナ幻野":
            afterPoint = ".geru"
            break;
        case "ジャリムバハ砂漠":
            afterPoint = ".suna"
            break;
        case "バルディスタ要塞":
            afterPoint = ".baru"
            break;
    }

    if($(".ServerList").attr("id") == ""){
        $(this).closest("td").insertAfter($(this).closest("td").next("td"))

        tmp1 = document.getElementById("template1")
        tmp2 = tmp1.content.querySelectorAll(".Servers")
        Point = tmp1.content.querySelectorAll(".Servers > " + Point)
        afterPoint = tmp1.content.querySelectorAll(".Servers > " + afterPoint)
        
        tmp2.item(0).insertBefore(afterPoint.item(0),Point.item(0))
    }else{
        $(this).closest("td").insertAfter($(this).closest("td").next("td"))

        for(i=0; i<10; i++){
            $(".Servers").find(Point).eq(i).insertAfter($(".Servers").find(afterPoint).eq(i))
        }
    }
})

function getStorage(flg){
    var boxName = $(".ServerList").attr("id")
    var Server = 0;

    $(".fix_blue tr").slice(1).remove()
    $(".fix_red tr").slice(1).remove()

    Data = JSON.parse(localStorage.getItem(boxName))
    blue_Data = JSON.parse(localStorage.getItem("fix_blue"))
    red_Data = JSON.parse(localStorage.getItem("fix_red"))

    $(".Servers").each(function(){
        $(this).find(".geru>.setTemp2>.nowTime")
        .text(Data[Server][1]).css("background-color", Data[Server][2]),
        $(this).find(".geru>.setTemp2>.befTime")
        .text("前回:" + Data[Server][3]).css("background-color", Data[Server][4]),
        $(this).find(".geru>.setTemp2>.memo").val(Data[Server][5]),
        
        $(this).find(".suna>.setTemp2>.nowTime")
        .text(Data[Server][6]).css("background-color", Data[Server][7]),
        $(this).find(".suna>.setTemp2>.befTime")
        .text("前回:" + Data[Server][8]).css("background-color", Data[Server][9]),
        $(this).find(".suna>.setTemp2>.memo").val(Data[Server][10]),

        $(this).find(".baru>.setTemp2>.nowTime")
        .text(Data[Server][11]).css("background-color", Data[Server][12]),
        $(this).find(".baru>.setTemp2>.befTime")
        .text("前回:" + Data[Server][13]).css("background-color", Data[Server][14]),
        $(this).find(".baru>.setTemp2>.memo").val(Data[Server][15])
        Server++
    })
    
    blue_Data.forEach(function(Text){
        $(".fix_blue").append('<tr><td class="fix">' + Text + '</td></tr>')
    })
    red_Data.forEach(function(Text){
        $(".fix_red").append('<tr><td class="fix">' + Text + '</td></tr>')
    })

    if(flg != true){
        $("#web_status").text("done!")
    }
}

function setStorage(flg){
    var Array = []
    var fix_blue = []
    var fix_red = []
    var boxName = $(".ServerList").attr("id")
    
    $(".Servers").each(function(){
        Array.push([
            $(this).find(".Server").text().substr(4),
            $(this).find(".geru>.setTemp2>.nowTime").text(),
            $(this).find(".geru>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".geru>.setTemp2>.befTime").text().substr(3),
            $(this).find(".geru>.setTemp2>.befTime").css("background-color"),
            $(this).find(".geru>.setTemp2>.memo").val(),
            $(this).find(".suna>.setTemp2>.nowTime").text(),
            $(this).find(".suna>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".suna>.setTemp2>.befTime").text().substr(3),
            $(this).find(".suna>.setTemp2>.befTime").css("background-color"),
            $(this).find(".suna>.setTemp2>.memo").val(),
            $(this).find(".baru>.setTemp2>.nowTime").text(),
            $(this).find(".baru>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".baru>.setTemp2>.befTime").text().substr(3),
            $(this).find(".baru>.setTemp2>.befTime").css("background-color"),
            $(this).find(".baru>.setTemp2>.memo").val()
        ])
    })

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })

    sessionStorage.setItem(boxName,true)
    localStorage.setItem(boxName, JSON.stringify(Array))
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))

    if(flg != true){
        $("#web_status").text("done!")
    }
}

//サーバー追加
$(document).on("click", ".setServers", function(){
    //テーブルの初期化
    $("#setTemp1 tr").slice(1).remove()

    //サーバリスト名設定
    $(".ServerList").attr("id", $(this).text())

    //サーバー行追加
    num = Number($(this).val())
    var temp = document.getElementById("template1")
    for(i=0; i<10; i++){
        var CopyTemp = temp.content.cloneNode(true)
        document.getElementById("setTemp1").appendChild(CopyTemp)
        tmp = document.getElementsByClassName("Server")
        tmp[i].innerHTML = "サーバー" + (i + num)
    }

    //ボタン追加
    var temp = document.getElementById("template2")
    for(i=0; i<30; i++){
        var CopyTemp = temp.content.cloneNode(true)
        var tmp = document.getElementsByClassName("setTemp2")
        tmp[i].appendChild(CopyTemp)
    }

    //サーバ切り替え時のデータ保持
    var boxName = $(".ServerList").attr("id")
    if(sessionStorage.getItem(boxName) == "true"){
        getStorage(true)
    }
})

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    //赤ボタンクリック禁止解除
    $(this).parent().find(".btn[value=Red]").prop("disabled", false)

    //変数作成
    var Server = $(this).parent().parent().parent().find(".Server").text()
    var Point = $(this).parent().parent().attr("class")
    var nowTime = TimePlus(new Date(),"00:00:00")
    var befTime = $(this).nextAll(".nowTime").text()
    var old_befTime = $(this).nextAll(".befTime").text()
    var nowColor = $(this).nextAll(".nowTime").css("background-color")
    var befColor = $(this).nextAll(".befTime").css("background-color")
    var memo = $(this).nextAll(".memo").val()
    TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)
    
    //変数の変換
    //「サーバー」置換
    Server = Server.replace("サーバー","")
    //「場所」置換
    switch(Point){
        case "geru":
            Point = Point.replace("geru","ゲル");
            break;
        case "suna":
        Point = Point.replace("suna","砂漠");
            break;
        case "baru":
            Point = Point.replace("baru","バル")
            break;
    }
    
    //前回時間書き込み・背景色変更
    if(old_befTime == ""){
        //前回時間がない場合、前回:を記入する
        $(this).nextAll(".befTime").text("前回:" + befTime)
    }
    else if($(this).text() == "青"  && 
            nowColor == "rgb(135, 206, 235)" &&
            befColor == "rgb(135, 206, 235)"){
        //青継続の場合、前回時間を更新しない
    }
    else if($(this).text() == "虹"  && 
            nowColor == "rgb(238, 130, 238)" &&
            befColor == "rgb(238, 130, 238)"){
        //虹継続の場合、前回時間を更新しない
    }
    else if(old_befTime != ""){
        //前回時間がある場合、時間と背景を変更する
        $(this).nextAll(".befTime")
            .text("前回:" + befTime)
            .css("background-color", nowColor)
    }

    //現在時間書き込み・背景色変更
    switch($(this).text()){
        case "青":
            $(this).nextAll(".nowTime").text(nowTime).css(
                "background-color", "skyblue"
            )
            break
        case "黄":
            $(this).nextAll(".nowTime").text(nowTime).css(
                "background-color", "yellow"
            )
            break
        case "赤":
            $(this).nextAll(".nowTime").text(nowTime).css(
                "background-color", "red"
            )
            $(this).prop("disabled", true);//赤ボタンクリック禁止
            break
        case "虹":
            $(this).nextAll(".nowTime").text(nowTime).css(
                "background-color", "violet"
            )
            break
    }

    //背景色の再取得
    var nowColor = $(this).nextAll(".nowTime").css("background-color")
    var befColor = $(this).nextAll(".befTime").css("background-color")

    //虹青判定
    if(befColor == "rgb(238, 130, 238)" && nowColor == "rgb(135, 206, 235)"){
        Time = TimePlus(nowTime,"01:30:00").slice(0,-3)
        $(this).nextAll(".memo").val(Time + "までに黄変化")
    }

    //虹黄判定
    if(befColor == "rgb(238, 130, 238)" && nowColor == "rgb(255, 255, 0)"){
        Time = TimePlus(nowTime,"01:30:00").slice(0,-3)
        $(this).nextAll(".memo").val(Time + "まで調査不要")
    }

    //青黄判定
    if(befColor == "rgb(135, 206, 235)" && nowColor == "rgb(255, 255, 0)"){
        Text = Server
                + Point + " "
                + TimePlus(befTime,"04:00:00") + " - "
                + TimePlus(nowTime,"04:00:00")

        $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
    }  

    //黄赤判定
    if(befColor == "rgb(255, 255, 0)" && nowColor == "rgb(255, 0, 0)"){
        Text = Server
                + Point + " "
                + TimePlus(befTime,"01:00:00") + " - "
                + TimePlus(nowTime,"01:00:00")

        $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
    }

    //赤判定+カウントタイマ設置
    if(nowColor == "rgb(255, 0, 0)"){
        $(this).nextAll(".memo").val("経過時間:" + "00:00:00")
        Timers[Server + Point] = setInterval(setTimer,1000,$(this))
        if(old_befTime == "" || old_befTime == "前回:"){
            Text = Server
            + Point + " "
            + TimePlus(nowTime,"00:00:00") + " - "
            + TimePlus(nowTime,"01:00:00")

            $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
        }
    }

    //赤離脱判定+カウントタイマリセット
    if(nowColor != "rgb(255, 0, 0)" && befColor == "rgb(255, 0, 0)"){
        clearInterval(Timers[Server+Point])
        $(this).nextAll(".memo").css("background-color", "white")
    }
    
    setStorage(true)
})

//時間処理
function TimePlus(Time,Dates){
    if(Time.length == 8){
        Time = new Date("2020/01/01 " + Time)
    }

    Dates = Dates.split(":")
    Time.setHours(Time.getHours() + Number(Dates[0]))
    Time.setMinutes(Time.getMinutes() + Number(Dates[1]))
    Time.setSeconds(Time.getSeconds() + Number(Dates[2]))

    //時間の0詰め
    Time = ("0"+(Time.getHours())).slice(-2) + ":"
            + ("0"+(Time.getMinutes())).slice(-2) + ":"
            + ("0"+(Time.getSeconds())).slice(-2)

    return Time
}

function setTimer(_this){
    Time = _this.nextAll(".memo").val().slice(5)
    if(Time == "00:50:00"){    
        Time = TimePlus(Time,"00:00:01")
        _this.nextAll(".memo").val("経過時間:" + Time)
        _this.nextAll(".memo").css("background-color", "violet")
    }else if(Time == "01:00:00"){
        _this.nextAll(".memo").css("background-color", "red")  
    }else{
        Time = TimePlus(Time,"00:00:01")
        _this.nextAll(".memo").val("経過時間:" + Time)
    }
}