var Timers = {}
var TMP 

window.onload = function(){
    sortPoint()
}

function debug(){
}

function sortPoint(){
    Sort = JSON.parse(localStorage.getItem("Sort"))
    
    for(i=0; i<2; i++){
        Point = $(".ServerList td").find("p")
        flg = false
        
        for(n=1; n<4; n++){
            if($(Point).eq(n).text() !== Sort[n-1]){
                if(flg == false){
                    befPoint = $(Point).eq(n).closest("td")
                    flg = true
                }
                else if(flg == true){
                    afterPoint = $(Point).eq(n).closest("td")
                }
            }
        }

        if(flg == true){
            movePoint(befPoint,afterPoint,"right")
        }
    }
}

//←ボタンイベント
$(document).on("click", ".left", function() {
    if($(this).closest("td").prev("td").find("p").text() != "サーバー"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").prev("td")
        movePoint(befPoint,afterPoint,"left")
    }
})

//→ボタンイベント
$(document).on("click", ".right", function() {
    befPoint = $(this).closest("td")
    afterPoint = $(this).closest("td").next("td")
    movePoint(befPoint,afterPoint,"right")
})

//移動処理
function movePoint(befPoint,AfterPoint,mode){
    switch($(befPoint).find("p").text()){
        case "ゲルヘナ幻野":
            befClass = ".ゲル"
            break;
        case "ジャリムバハ砂漠":
            befClass = ".砂漠"
            break;
        case "バルディスタ要塞":
            befClass = ".バル"
            break;
    }
    switch($(afterPoint).find("p").text()){
        case "ゲルヘナ幻野":
            afterClass = ".ゲル"
            break;
        case "ジャリムバハ砂漠":
            afterClass = ".砂漠"
            break;
        case "バルディスタ要塞":
            afterClass = ".バル"
            break;
    }

    tmp1 = document.getElementById("template1")
    Servers = tmp1.content.querySelectorAll(".Servers")
    tmp1_befPoint = tmp1.content.querySelectorAll(".Servers > " + befClass)
    tmp1_afterPoint = tmp1.content.querySelectorAll(".Servers > " + afterClass)

    if(mode == "left"){
        $(befPoint).insertBefore(afterPoint)
        Servers.item(0).insertBefore(tmp1_befPoint.item(0),tmp1_afterPoint.item(0))
        for(i=0; i<10; i++){
            $(".Servers").find(befClass).eq(i)
                .insertBefore($(".Servers").find(afterClass).eq(i))
        }
    }
    if(mode == "right"){
        $(afterPoint).insertBefore(befPoint)
        Servers.item(0).insertBefore(tmp1_afterPoint.item(0),tmp1_befPoint.item(0))
        for(i=0; i<10; i++){
            $(".Servers").find(afterClass).eq(i)
                .insertBefore($(".Servers").find(befClass).eq(i))
        }
    }
}

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    //赤ボタンクリック禁止解除
    $(this).parent().find(".btn[value=Red]").prop("disabled", false)

    //変数作成
    Server = $(this).closest("tr").find(".Server").text().slice(4)
    Point = $(this).closest("td").attr("class")
    nowTime = TimePlus(new Date(),"00:00:00")
    befTime = $(this).nextAll(".nowTime").text()
    old_befTime = $(this).nextAll(".befTime").text()
    nowColor = $(this).nextAll(".nowTime").css("background-color")
    befColor = $(this).nextAll(".befTime").css("background-color")
    memo = $(this).nextAll(".memo").val()
    TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)
        
    //前回時間書き込み・背景色変更
    if(befColor == "rgb(255, 255, 255)"){
        //前回時間がない場合、今回時間を記入する
        $(this).nextAll(".befTime")
            .text("前回:" + befTime)
            .css("background-color", nowColor)
    }
    else if(befColor !== "rgb(255, 255, 255)"){
        //前回時間がある場合、時間と背景を変更する
        $(this).nextAll(".befTime")
            .text("前回:" + befTime)
            .css("background-color", nowColor)
    }
    else if($(this).text() == "青"  && 
            nowColor == "rgb(135, 206, 235)" && befColor == "rgb(135, 206, 235)"){
        //青継続の場合、前回時間を更新しない
    }
    else if($(this).text() == "虹"  && 
            nowColor == "rgb(238, 130, 238)" &&
            befColor == "rgb(238, 130, 238)"){
        //虹継続の場合、前回時間を更新しない
    }

    //現在時間書き込み・背景色変更
    switch($(this).text()){
        case "青":
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "skyblue")
        break
        case "黄":
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "yellow")
        break
        case "赤":
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "red")

            $(this).prop("disabled", true) //赤ボタンクリック禁止
        break
        case "虹":
            $(this).nextAll(".nowTime")
                .text(nowTime)
                .css("background-color", "violet")
        break
    }

    //背景色の再取得
    nowColor = $(this).nextAll(".nowTime").css("background-color")
    befColor = $(this).nextAll(".befTime").css("background-color")

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
        Text = Server + Point + " "
                + TimePlus(befTime,"04:00:00") + " - "
                + TimePlus(nowTime,"04:00:00")

        $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
    }  

    //黄赤判定
    if(befColor == "rgb(255, 255, 0)" && nowColor == "rgb(255, 0, 0)"){
        Text = Server + Point + " "
                + TimePlus(befTime,"01:00:00") + " - "
                + TimePlus(nowTime,"01:00:00")

        $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
    }

    //初回赤判定
    if(befColor == "rgb(255, 255, 255)" && nowColor == "rgb(255, 0, 0)"){
        Text = Server + Point + " "
        + TimePlus(nowTime,"00:00:00") + " - "
        + TimePlus(nowTime,"01:00:00")

        $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
    }

    //赤判定+カウントタイマ設置
    if(nowColor == "rgb(255, 0, 0)"){
        $(this).nextAll(".memo").val("経過時間:" + "00:00:00")
        Timers[Server + Point] = setInterval(setTimer,1000,$(this))
    }

    //赤離脱判定+カウントタイマリセット
    if(nowColor != "rgb(255, 0, 0)" && befColor == "rgb(255, 0, 0)"){
        clearInterval(Timers[Server+Point])
        $(this).nextAll(".memo").css("background-color", "white")
    }
    
    save_Storage(true)
})

//サーバー追加
$(document).on("click", ".setServers", function(){
    //テーブルの初期化
    $(".ServerList tr").slice(1).remove()

    //サーバリスト名設定
    $(".ServerList").attr("id", $(this).text())

    //サーバー行追加
    num = Number($(this).val())
    tmp1 = document.getElementById("template1")
    for(i=0; i<10; i++){
        CopyTemp = tmp1.content.cloneNode(true)
        ServerList = document.getElementsByClassName("ServerList")
        ServerList[0].appendChild(CopyTemp)
        Servers = document.getElementsByClassName("Server")
        Servers[i].innerHTML += (i + num)
    }

    //ボタン追加
    tmp2 = document.getElementById("template2")
    for(i=0; i<30; i++){
        CopyTemp = tmp2.content.cloneNode(true)
        setTmp2 = document.getElementsByClassName("setTemp2")
        setTmp2[i].appendChild(CopyTemp)
    }

    //サーバ切り替え時のデータ保持
    boxName = $(".ServerList").attr("id")
    if(sessionStorage.getItem(boxName) == "true"){
        load_Storage()
    }
})

//データの復旧・バックアップ等
function OneBack(){
    if(TMP != null){
        $(".Servers").each(function(){
            if("サーバー" + TMP[0] == $(this).find(".Server").text()){
                _this = $(this).find("." + TMP[1] + ">.setTemp2>")

                _this.nextAll(".nowTime").text(TMP[2]).css("background-color", TMP[3])
                _this.nextAll(".befTime").text(TMP[4]).css("background-color", TMP[5])
                _this.nextAll(".memo").val(TMP[6])
                            
                if(TMP[3] == "rgb(255, 0, 0)"){
                    _this.nextAll(".btn[value=Red]").prop("disabled", true)
                    Timers[TMP[0] + TMP[1]] = setInterval(setTimer,1000,_this)
                }
                else if(TMP[3] != "rgb(255, 0, 0)"){
                    _this.nextAll(".btn[value=Red]").prop("disabled", false)
                    clearInterval(Timers[TMP[0] + TMP[1]])
                }
            }
        })

        TMP = null
    }
}

function load_Storage(){
    boxName = $(".ServerList").attr("id")
    Server = 0;
    Data = JSON.parse(localStorage.getItem(boxName))
    fix_blue = JSON.parse(localStorage.getItem("fix_blue"))
    fix_red = JSON.parse(localStorage.getItem("fix_red"))

    $(".Servers").each(function(){
        _this = $(this).find(".ゲル>.setTemp2>")
        _this.nextAll(".nowTime")
            .text(Data[Server][1])
            .css("background-color", Data[Server][2])
        _this.nextAll(".befTime")
            .text("前回:" + Data[Server][3])
            .css("background-color", Data[Server][4])
        _this.nextAll(".memo")
            .val(Data[Server][5])
            .css("background-color", Data[Server][6])

        if(Data[Server][2] == "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", true)
            Timers[Server + "ゲル"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][2] != "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Server + 1 + "ゲル"])
        }


        _this = $(this).find(".砂漠>.setTemp2>")
       _this.nextAll(".nowTime")
            .text(Data[Server][7])
            .css("background-color", Data[Server][8]),
        _this.nextAll(".befTime")
            .text("前回:" + Data[Server][9])
            .css("background-color", Data[Server][10]),
        _this.nextAll(".memo")
            .val(Data[Server][11])
            .css("background-color", Data[Server][12])
            
        if(Data[Server][8] == "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", true)
            Timers[Server + "砂漠"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][8] != "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Server + "砂漠"])
        }


        _this = $(this).find(".バル>.setTemp2>")
        _this.nextAll(".nowTime")
            .text(Data[Server][13])
            .css("background-color", Data[Server][14])
            _this.nextAll(".befTime")
            .text("前回:" + Data[Server][15])
            .css("background-color", Data[Server][16]),
            _this.nextAll(".memo")
            .val(Data[Server][17])
            .css("background-color", Data[Server][18])

        if(Data[Server][14] == "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", true)
            Timers[Server + "バル"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][14] != "rgb(255, 0, 0)"){
            _this.nextAll(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Server + "バル"])
        }

        Server++
    })
    
    $(".fix_blue tr").slice(1).remove()
    $(".fix_red tr").slice(1).remove()

    fix_blue.forEach(function(Text){
        $(".fix_blue").append('<tr><td class="fix">' + Text + '</td></tr>')
    })
    fix_red.forEach(function(Text){
        $(".fix_red").append('<tr><td class="fix">' + Text + '</td></tr>')
    })
}

function save_Storage(){
    var Data = []
    var fix_blue = []
    var fix_red = []
    boxName = $(".ServerList").attr("id")

    $(".Servers").each(function(){
        Data.push([
            $(this).find(".Server").text().substr(4),
            
            $(this).find(".ゲル>.setTemp2>.nowTime").text(),
            $(this).find(".ゲル>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".ゲル>.setTemp2>.befTime").text().substr(3),
            $(this).find(".ゲル>.setTemp2>.befTime").css("background-color"),
            $(this).find(".ゲル>.setTemp2>.memo").val(),
            $(this).find(".ゲル>.setTemp2>.memo").css("background-color"),

            $(this).find(".砂漠>.setTemp2>.nowTime").text(),
            $(this).find(".砂漠>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".砂漠>.setTemp2>.befTime").text().substr(3),
            $(this).find(".砂漠>.setTemp2>.befTime").css("background-color"),
            $(this).find(".砂漠>.setTemp2>.memo").val(),
            $(this).find(".砂漠>.setTemp2>.memo").css("background-color"),

            $(this).find(".バル>.setTemp2>.nowTime").text(),
            $(this).find(".バル>.setTemp2>.nowTime").css("background-color"),
            $(this).find(".バル>.setTemp2>.befTime").text().substr(3),
            $(this).find(".バル>.setTemp2>.befTime").css("background-color"),
            $(this).find(".バル>.setTemp2>.memo").val(),
            $(this).find(".バル>.setTemp2>.memo").css("background-color")
        ])
    })

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })

    sessionStorage.setItem(boxName,true)
    localStorage.setItem(boxName, JSON.stringify(Data))
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))
}

function save_Sort(){
    var Sort = []
    Sort.push(
        $(".ServerList td").eq(1).find("p").text(),
        $(".ServerList td").eq(2).find("p").text(),
        $(".ServerList td").eq(3).find("p").text()
    )
    localStorage.setItem("Sort", JSON.stringify(Sort))
}

function save_Fix(){
    var fix_blue = []
    var fix_red = []

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })
    
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))
}


//削除関連
function Cleaner(target){
    flg = confirm("本当に削除していいですか？")

    if(flg){
        if(target.value == "all"){
            clear_input()
            clear_fix()
        }
        else if(target.value == "input"){
            clear_input()
        }
        else if(target.value == "fix_blue"){
            clear_fix("fix_blue")
        }
        else if(target.value == "fix_red"){
            clear_fix("fix_red")
        }

        save_Storage()
        save_Fix()
    }
}

function clear_input(){
    $(".Servers").each(function(){
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)

        $(this).find(".nowTime").each(function(){
            $(this).text("").css("background-color", "white")
        })
        $(this).find(".befTime").each(function(){
            $(this).text("前回:").css("background-color", "white")
        })
        $(this).find(".memo").each(function(){
            $(this).val("").css("background-color", "white")
        })

        Server = $(this).find(".Server").text().slice(4)
        clearInterval(Timers[Server + "ゲル"])
        clearInterval(Timers[Server+"砂漠"])
        clearInterval(Timers[Server+"バル"])
        TMP = null
    })
}

function clear_fix(fix){
    if(fix == "fix_blue"){
        $(".fix_blue tr").slice(1).remove()
    }
    else if(fix == "fix_red"){
        $(".fix_red tr").slice(1).remove()
    }
    else{
        $(".fix_blue tr").slice(1).remove()
        $(".fix_red tr").slice(1).remove()
    }
}

$(document).on("click", ".fix", function() {
    flg = confirm("本当に削除していいですか？")

    if(flg){
        $(this).closest("tr").remove()
    }

    save_Fix()
})

function clear_Sort(){
    var Sort = []
    Sort.push("ゲルヘナ幻野","ジャリムバハ砂漠","バルディスタ要塞")
    localStorage.setItem("Sort", JSON.stringify(Sort))
    sortPoint()
}


//時間計算
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

//タイマ設置
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