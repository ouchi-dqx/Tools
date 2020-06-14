var Timers = {}
function debug(){
}


$(".ServerList").slick({
    arrows: false
})

//サーバー追加
$(document).on("click", ".setServers", function(){
    //サーバリスト名設定
    $(".ServerList").attr("id", $(this).text())

    //サーバー行追加
    num = Number($(this).val())
    tmp1 = document.getElementById("template1")
    for(i=0; i<10; i++){
        CopyTemp = tmp1.content.cloneNode(true)
        Servers = CopyTemp.querySelectorAll(".Server")
        Servers.item(0).innerHTML += (i + num)
        $('.ServerList').slick('slickAdd', CopyTemp);
    }

    //ボタン追加
    tmp2 = document.getElementById("template2")
    for(i=0; i<33; i++){
        CopyTemp = tmp2.content.cloneNode(true)
        setTmp2 = document.getElementsByClassName("setTemp")
        setTmp2[i].appendChild(CopyTemp)
    }

    //サーバ切り替え時のデータ保持
    boxName = $(".ServerList").attr("id")
    if(sessionStorage.getItem(boxName) == "true"){
        load_Storage()
    }
})

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    //赤ボタンクリック禁止解除
    $(this).parent().find(".btn[value=Red]").prop("disabled", false)
    
    //変数作成
    var Server = $(this).parent().parent().parent().find(".Server").text()
    var Point = $(this).parent().parent().attr("class")
    var nowTime = new Date()
    var befTime = $(this).nextAll(".nowTime").text()
    var old_befTime = $(this).nextAll(".befTime").text()
    var nowColor = $(this).nextAll(".nowTime").css("background-color")
    var befColor = $(this).nextAll(".befTime").css("background-color")
    
    //変数の変換
    //「サーバー」置換
    Server = Server.replace("サーバー","")
    //現在時間の0詰め
    nowTime = TimePlus(nowTime,"00:00:00")    
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