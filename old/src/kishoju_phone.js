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

    for(i=0; i<10; i++){
        $('.ServerList').slick('slickRemove',true)
    }

    //サーバー行追加
    num = Number($(this).val())
    tmp1 = document.getElementById("template1")
    for(i=0; i<10; i++){
        CopyTemp = tmp1.content.cloneNode(true)
        Servers = CopyTemp.querySelectorAll(".Server")
        Servers.item(0).innerHTML += (i + num)
        $('.ServerList').slick('slickAdd', CopyTemp)
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
    //変数作成
    Server = $(this).closest("tr").find(".Server").text().slice(4)
    Point = $(this).closest("td").attr("class")
    btnColor = $(this).text()
    nowTime = TimePlus(new Date(),"00:00:00")
    befTime = $(this).nextAll(".nowTime").text()
    old_befTime = $(this).nextAll(".befTime").text()
    nowColor = $(this).nextAll(".nowTime").css("background-color")
    befColor = $(this).nextAll(".befTime").css("background-color")
    memo = $(this).nextAll(".memo").val()
    TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)

    //赤離脱判定
    if(nowColor == "rgb(255, 0, 0)" && btnColor != "赤"){
        //ボタン禁止解除・タイマ削除　メモ背景白・リスト削除
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)
        clearInterval(Timers[Server+Point])
        $(this).nextAll(".memo").css("background-color", "white")

        $(".fix_red").find(".fix").each(function(){
            fix = $(this).text().split(" ")
            if(old_befTime == "前回:"){
                if(fix[0] == Server + Point &&
                fix[1] == TimePlus(befTime,"00:00:00") &&
                fix[3] == TimePlus(befTime,"01:00:00")){
                    $(this).parent().remove()
                }
            }else if(old_befTime != "前回"){
                if(fix[0] == Server + Point &&
                (fix[1] == TimePlus(old_befTime.slice(3),"01:00:00") ||
                 fix[1] == TimePlus(befTime,"00:00:00")) &&
                fix[3] == TimePlus(befTime,"01:00:00")){
                    $(this).parent().remove()
                }
            }
        })
    }

    //現在時間書き込み・背景色変更
    switch(btnColor){
        case "青":
            //虹青判定
            if(nowColor == "rgb(238, 130, 238)" && btnColor == "青"){
                Time = TimePlus(nowTime,"01:30:00").slice(0,-3)
                $(this).nextAll(".memo").val(Time + "までに黄変化")
            }

            //青継続以外時、前回時間更新
            if(nowColor != "rgb(135, 206, 235)"){
                $(this).nextAll(".befTime")
                    .text("前回:" + befTime)
                    .css("background-color", nowColor)
            }

            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "skyblue")
        break
        case "黄":
            //虹黄判定
            if(nowColor == "rgb(238, 130, 238)" && btnColor == "黄"){
                Time = TimePlus(nowTime,"01:30:00").slice(0,-3)
                $(this).nextAll(".memo").val(Time + "まで調査不要")
            }

            //青黄判定
            if(nowColor == "rgb(135, 206, 235)" && btnColor == "黄"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"04:00:00") + " - "
                    + TimePlus(nowTime,"04:00:00")
                $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
            }

            $(this).nextAll(".befTime")
                .text("前回:" + befTime)
                .css("background-color", nowColor)
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "yellow")
        break
        case "赤":

            //赤ボタンクリック禁止
            $(this).prop("disabled", true)

            //タイマーセット
            $(this).nextAll(".memo").val("経過時間:" + "00:00:00")
            Timers[Server + Point] = setInterval(setTimer,1000,$(this))

            //黄赤判定
            if(nowColor == "rgb(255, 255, 0)" && btnColor =="赤"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"01:00:00") + " - "
                    + TimePlus(nowTime,"01:00:00")
                $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
            }

            //黄赤以外で赤判定
            if(nowColor != "rgb(255, 255, 0)" && btnColor == "赤"){
                Text = Server + Point + " "
                    + TimePlus(nowTime,"00:00:00") + " - "
                    + TimePlus(nowTime,"01:00:00")
                $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
            }

            $(this).nextAll(".befTime")
                .text("前回:" + befTime)
                .css("background-color", nowColor)
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "red")
        break
        case "虹":
            //虹継続時以外、前回時間更新
            if(nowColor != "rgb(238, 130, 238)"){
                $(this).nextAll(".befTime")
                    .text("前回:" + befTime)
                    .css("background-color", nowColor)
            }

            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "violet")
        break
    }

    save_Storage(true)
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