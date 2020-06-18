var Timers = {}
var TMP 

window.onload = function(){
    sortPoint()
}

function debug(){    
}

function sortPoint(){
    var i,n,flg
    var Point,befPoint,afterPoint
    var Sort = JSON.parse(localStorage.getItem("Sort"))

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
                    afterPoint = befPoint.closest("td").next("td")
                }
            }
        }

        if(flg == true){
            movePoint(afterPoint,befPoint)
        }
    }
}

//←ボタンイベント
$(document).on("click", ".left", function() {
    if($(this).closest("td").prev("td").find("p").text() != "サーバー"){
        var befPoint = $(this).closest("td")
        var afterPoint = $(this).closest("td").prev("td")
        movePoint(befPoint,afterPoint)
    }
})

//→ボタンイベント
$(document).on("click", ".right", function() {
    var befPoint = $(this).closest("td")
    var afterPoint = $(this).closest("td").next("td")
    movePoint(afterPoint,befPoint)
})

//移動処理
function movePoint(befPoint,afterPoint){
    var i

    var befClass = "." + $(befPoint).attr("class")
    var afterClass = "." + $(afterPoint).attr("class")
    
    var tmp1 = document.getElementById("template1")
    var Servers = tmp1.content.querySelectorAll(".Servers")
    var tmp1_befPoint = tmp1.content.querySelectorAll(".Servers >" + befClass)
    var tmp1_afterPoint = tmp1.content.querySelectorAll(".Servers >" + afterClass)

    befPoint.insertBefore(afterPoint)
    Servers.item(0).insertBefore(tmp1_befPoint.item(0),tmp1_afterPoint.item(0))
    for(i=0; i<10; i++){
        $(".Servers").find(befClass).eq(i)
            .insertBefore($(".Servers").find(afterClass).eq(i))
    }
}

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    //変数作成
    var fix,Time,Text

    var Server = $(this).closest("tr").find(".Server").text().slice(4)
    var Point = $(this).closest("td").attr("class")
    var btnColor = $(this).text()
    var nowTime = TimePlus(new Date(),"00:00:00")
    var befTime = $(this).nextAll(".nowTime").text()
    var old_befTime = $(this).nextAll(".befTime").text()
    var nowColor = $(this).nextAll(".nowTime").css("background-color")
    var befColor = $(this).nextAll(".befTime").css("background-color")
    var memo = $(this).nextAll(".memo").val()
    TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)
    
    //赤離脱判定
    if(nowColor == "rgb(255, 0, 0)" && btnColor != "赤"){
        //ボタン禁止解除・タイマ削除　メモ背景白・リスト削除        
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)
        clearInterval(Timers[Server+Point])
        $(this).nextAll(".memo").css("background-color", "white")

        $(".fix_red").find(".fix").each(function(){
            fix = $(this).text().split(" ")
            if(fix[0] == Server + Point &&
            fix[3] == TimePlus(befTime,"01:00:00")){
                if(old_befTime == "前回:" &&
                fix[1] == TimePlus(befTime,"00:00:00")){
                    $(this).parent().remove()
                }else if(old_befTime != "前回:" &&
                (fix[1] == TimePlus(old_befTime.slice(3),"01:00:00") ||
                fix[1] == TimePlus(befTime,"00:00:00"))){
                    $(this).parent().remove()
                }
            }
        })
    }

    //現在時間書き込み・背景色変更
    switch(btnColor){
        case "青":
            //赤青・虹青判定
            if((nowColor == "rgb(255, 0, 0)" || nowColor == "rgb(238, 130, 238)")
            && btnColor == "青"){
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
            //赤黄・虹黄判定
            if((nowColor == "rgb(255, 0, 0)" || nowColor == "rgb(238, 130, 238)")
            && btnColor == "黄"){
                Time = TimePlus(befTime,"01:30:00").slice(0,-3)
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
        setTmp2 = document.getElementsByClassName("setTemp")
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
    var Text
    var _this

    if(TMP != null){
        $(".Servers").each(function(){
            if("サーバー" + TMP[0] == $(this).find(".Server").text()){
                _this = $(this).find("." + TMP[1] + ">.setTemp>")
                _this.nextAll(".nowTime").text(TMP[2]).css("background-color", TMP[3])
                _this.nextAll(".befTime").text(TMP[4]).css("background-color", TMP[5])
                _this.nextAll(".memo").val(TMP[6])
                            
                if(TMP[3] == "rgb(255, 0, 0)"){
                    _this.nextAll(".btn[value=Red]").prop("disabled", true)
                    Timers[TMP[0] + TMP[1]] = setInterval(setTimer,1000,_this)

                    if(TMP[4] == "前回:"){
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[2],"00:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }else if(TMP[5] == "rgb(255, 255, 0)"){
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[4].slice(3),"01:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }else{
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[4].slice(3),"00:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }

                    $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                }else if(TMP[3] != "rgb(255, 0, 0)"){
                    _this.nextAll(".btn[value=Red]").prop("disabled", false)
                    clearInterval(Timers[TMP[0] + TMP[1]])
                }
            }
        })

        TMP = null
    }
}

function load_Storage(){
    var boxName = $(".ServerList").attr("id")
    var Server = 0;
    var Data = JSON.parse(localStorage.getItem(boxName))
    var fix_blue = JSON.parse(localStorage.getItem("fix_blue"))
    var fix_red = JSON.parse(localStorage.getItem("fix_red"))
    var _this

    $(".Servers").each(function(){
        _this = $(this).find(".ゲル>.setTemp>")
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


        _this = $(this).find(".砂漠>.setTemp>")
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


        _this = $(this).find(".バル>.setTemp>")
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
    var boxName = $(".ServerList").attr("id")

    $(".Servers").each(function(){
        Data.push([
            $(this).find(".Server").text().substr(4),
            
            $(this).find(".ゲル>.setTemp>.nowTime").text(),
            $(this).find(".ゲル>.setTemp>.nowTime").css("background-color"),
            $(this).find(".ゲル>.setTemp>.befTime").text().substr(3),
            $(this).find(".ゲル>.setTemp>.befTime").css("background-color"),
            $(this).find(".ゲル>.setTemp>.memo").val(),
            $(this).find(".ゲル>.setTemp>.memo").css("background-color"),

            $(this).find(".砂漠>.setTemp>.nowTime").text(),
            $(this).find(".砂漠>.setTemp>.nowTime").css("background-color"),
            $(this).find(".砂漠>.setTemp>.befTime").text().substr(3),
            $(this).find(".砂漠>.setTemp>.befTime").css("background-color"),
            $(this).find(".砂漠>.setTemp>.memo").val(),
            $(this).find(".砂漠>.setTemp>.memo").css("background-color"),

            $(this).find(".バル>.setTemp>.nowTime").text(),
            $(this).find(".バル>.setTemp>.nowTime").css("background-color"),
            $(this).find(".バル>.setTemp>.befTime").text().substr(3),
            $(this).find(".バル>.setTemp>.befTime").css("background-color"),
            $(this).find(".バル>.setTemp>.memo").val(),
            $(this).find(".バル>.setTemp>.memo").css("background-color")
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
    var flg = confirm("本当に削除していいですか？")

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
    var Server
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
    var flg = confirm("本当に削除していいですか？")

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
    var Time = _this.nextAll(".memo").val().slice(5)

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