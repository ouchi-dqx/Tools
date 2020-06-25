var Timers = {}
var TMP

window.onload = function(){
    sortPoint()
}

function debug(){    
}

function Sender(Server,Point,Time){
    var t = new Date()
    Time = Time.split(":")
    t = new Date(t.getFullYear(),t.getMonth(),t.getDate(),Time[0],Time[1],Time[2])
    t.setHours(t.getHours() + 1)
    t.setMinutes(t.getMinutes() + 30)
    Time = ("0" + (t.getMonth() + 1)).slice(-2) + "/"
            + ("0" + t.getDate()).slice(-2) + " "
            + ("0" + t.getHours()).slice(-2) + ":"
            + ("0" + t.getMinutes()).slice(-2)
/*
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxlGCRghpYCAy7eyk0baCalwF0ZXjG_6tI-ZRVXdeiEo5kpUcw/exec",
        type: "GET",
        dataType: "jsonp",
        data: {Server: Server, Point: Point, Time: Time}
    })
*/    
}

function sortPoint(){
    var i,n,flg //カウンタ・フラグ変数
    var Point,befPoint,afterPoint //jQuery変数
    var Sort = JSON.parse(localStorage.getItem("Sort"))

    for(i=0; i<2; i++){
        Point = $(".ServerList td").find(".server-list-hd-text")
        flg = false //フラグ初期化
        
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
            movePoint(afterPoint,befPoint) //右移動
        }
    }
    //【NaL】端っこのボタン押せなくするやつ
    setInitMoveBtn();
}

//←→ボタンイベント
$(document).on("click", ".left, .right", function() {
    var befPoint,afterPoint
    if($(this).attr("class") == "left"){
        //【NaL】表記文字変えたい願望
        if($(this).closest("td").prev("td").index() > 0){
        //if($(this).closest("td").prev("td").find("p").text() != "サーバー"){
            befPoint = $(this).closest("td")
            afterPoint = $(this).closest("td").prev("td")
            movePoint(befPoint,afterPoint) //左移動
        }
    }else
    if($(this).attr("class") == "right"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").next("td")
        movePoint(afterPoint,befPoint) //右移動
    }
    //【NaL】端っこのボタン押せなくするやつ
    setInitMoveBtn();
})
//【NaL】端っこのボタン押せなくするやつ
function setInitMoveBtn(){
    $("#server-list-hd").find(".left,.right").prop('disabled',false);           //全活性
    $("#server-list-hd").find(".left,.right").first().prop('disabled',true);    //最初のボタンを非活性
    $("#server-list-hd").find(".left,.right").last().prop('disabled',true);     //最後のボタンを非活性
}

//移動処理
function movePoint(befPoint,afterPoint){
    //jQuery用クラス変数
    var befClass = "." + $(befPoint).attr("class")
    var afterClass = "." + $(afterPoint).attr("class")
    
    //template内移動処理用変数
    var tmp1 = document.getElementById("template1")
    var Servers = tmp1.content.querySelectorAll(".Servers")
    var tmp1_befPoint = tmp1.content.querySelectorAll(".Servers >" + befClass)
    var tmp1_afterPoint = tmp1.content.querySelectorAll(".Servers >" + afterClass)
    Servers.item(0).insertBefore(tmp1_befPoint.item(0),tmp1_afterPoint.item(0))

    befPoint.insertBefore(afterPoint)
    for(var i=0; i<10; i++){
        $(".Servers").find(befClass).eq(i)
            .insertBefore($(".Servers").find(afterClass).eq(i))
    }
}

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    
    var objBox = $(this).parents(".template2-box");
    
    //変数作成
    var Time,Text
    var Server = $(this).closest("tr").find(".Server").text().slice(4)
    var Point = $(this).closest("td").attr("class")
    var btnColor = $(this).text()
    var nowTime = TimePlus(new Date(),"00:00:00")

    var befTime = objBox.find(".nowTime").text();
    var old_befTime = objBox.find(".befTime").text();
    var nowColor = objBox.find(".nowTime").css("background-color");
    var befColor = objBox.find(".befTime").css("background-color");
    var memo = objBox.find(".memo").val();

    TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)

    //赤離脱判定
    if(nowColor == "rgb(255, 0, 0)" && btnColor != "赤"){
        //ボタン禁止解除・タイマ削除 メモ背景色初期化
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)
        clearInterval(Timers[Server+Point])
        objBox.find(".memo").css("background-color", "white")        
        clear_one_fix("fix_red",Server + Point)
    }

    //現在時間書き込み・背景色変更
    switch(btnColor){
        case "青":
            //赤青・虹青判定
            if(nowColor == "rgb(255, 0, 0)" || nowColor == "rgb(238, 130, 238)"){
                Time = TimePlus(nowTime,"01:30:00")
                objBox.find(".memo").val(Time.slice(0,-3) + "までに黄変化")
            }

            //青継続以外時、前回時間更新
            if(nowColor != "rgb(135, 206, 235)" || befColor != "rgb(135, 206, 235)"){
                objBox.find(".befTime")
                    .text(befTime)
                    .css("background-color", nowColor)
            }

            objBox.find(".nowTime")
                .text(nowTime)
                .css("background-color", "skyblue")
        break
        case "黄":
            //赤黄・虹黄判定
            if(nowColor == "rgb(255, 0, 0)" || nowColor == "rgb(238, 130, 238)"){
                Sender(Server,Point,befTime)
                Time = TimePlus(befTime,"01:30:00")
                objBox.find(".memo").val(Time.slice(0,-3) + "まで色変化無し")
            }

            //青黄判定
            if(nowColor == "rgb(135, 206, 235)"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"03:00:00") + " - "
                    + TimePlus(nowTime,"03:00:00")
                $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
                                                
                Time = TimePlus(befTime,"03:00:00")
                objBox.find(".memo").val(Time.slice(0,-3) + "まで色変化無し")
            }
            
            objBox.find(".befTime")
                .text(befTime)
                .css("background-color", nowColor)
            objBox.find(".nowTime")
                .text(nowTime)
                .css("background-color", "yellow")
        break
        case "赤":
            //赤ボタンクリック禁止
            $(this).prop("disabled", true) 

            //タイマーセット
            objBox.find(".memo").val("経過時間:" + "00:00:00")
            Timers[Server + Point] = setInterval(setTimer,1000,$(this))

            //黄赤判定
            if(nowColor == "rgb(255, 255, 0)"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"01:00:00") + " - "
                    + TimePlus(nowTime,"01:00:00")
            }else //黄赤以外で赤判定
            if(nowColor != "rgb(255, 255, 0)"){
                Text = Server + Point + " "
                    + TimePlus(nowTime,"00:00:00") + " - "
                    + TimePlus(nowTime,"01:00:00")
            }
            $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")

            clear_one_fix("fix_blue",Server + Point)

            objBox.find(".befTime")
                .text(befTime)
                .css("background-color", nowColor)
            objBox.find(".nowTime")
                .text(nowTime)
                .css("background-color", "red")
        break
        case "虹":
            //虹継続時以外、前回時間更新
            if(nowColor != "rgb(238, 130, 238)" || befColor != "rgb(238, 130, 238)"){
                objBox.find(".befTime")
                    .text(befTime)
                    .css("background-color", nowColor)
            }

            objBox.find(".nowTime")
                .text(nowTime)
                .css("background-color", "violet")
        break
    }

    save_Storage(true)
})

//サーバー追加
$(document).on("click", ".setServers", function(){
    $(".ServerList tr").slice(1).remove() //テーブルの初期化
    $(".ServerList").attr("id", $(this).text()) //サーバリストID設定
  
    //サーバー行追加
    var CopyTemp1,CopyTemp2
    var num = Number($(this).val())
    for(var i=0; i<10; i++){
        CopyTemp1 = $($("#template1").html()).clone()
        CopyTemp1.find(".Server").text((i + num))
        CopyTemp1.find(".setTemp").each(function(){
            CopyTemp2 = $($("#template2").html()).clone()
            $(this).append(CopyTemp2)
        })
        $(".ServerList").append(CopyTemp1)
    }

    //サーバ切り替え時のデータ保持
    var boxName = $(".ServerList").attr("id")
    if(sessionStorage.getItem(boxName) == "true"){
        load_Storage()
    }
})


//確定時間追加
function push_fix(){
    var fix
    var Data = []
    var Server = $("#Server")
    var Point = $("#Point")
    var sTime = $("#sTime")
    var eTime = $("#eTime")

    //入力チェック
    if(Server.val() == "" || sTime.val() == "" || eTime.val() == ""){
        return //空要素あれば終了
    }
    if(Server.val() < 1 || Server.val() > 40){
        return //サーバーが1未満もしくは40を超えるなら終了
    }
    if(!checkTime(sTime.val()) || !checkTime(eTime.val())){
        return //入力規則に合わなければ終了
    }

    var Text = Server.val() + Point.val() + " "
        + sTime.val() + " - " + eTime.val()
    $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
    
    $(".fix_red").find(".fix").each(function(){
        fix = $(this).text().split(" ")
        Data.push(fix)
    })
    
    $(".fix_red tr").slice(1).remove()

    Data.sort(function(a,b){
        return (a[3] > b[3] ? 1 : -1)
    })

    Data.forEach(function(fix){
        Text = fix.join(" ")
        $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
    })

    var afterTime = eTime.val().split(":")
    afterTime = Number(afterTime[0]) * 60 * 60 
        + Number(afterTime[1]) * 60
        + Number(afterTime[2]) + 60 * 60 //終了時間から1時間後

    var nowTime = new Date()
    nowTime =  nowTime.getHours() * 60 * 60
        + nowTime.getMinutes() * 60
        + nowTime.getSeconds()

    Timers[Server.val() + Point.val() + "fix"] = setTimeout(function(){
        clear_one_fix("fix_red",Server.val() + Point.val())
    },(afterTime - nowTime) * 1000)
    
    //初期化
    Server.val("1")
    Point.val("ゲル")
    sTime.val("")
    eTime.val("")
}

function checkTime(Time) {
    return Time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/) !== null;
}

$(document).on("click", "#sTime, #eTime", function() {
    if($(this).attr("id") == "sTime"){
        if($("#sTime").val() == ""){
            $("#sTime").val(TimePlus(new Date(),"01:00:00"))
        }
    }else 
    if($(this).attr("id") == "eTime"){
        if($("#eTime").val() == ""){
            $("#eTime").val(TimePlus(new Date(),"01:00:00"))
        }
    }
})


//データの復旧・バックアップ等
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

function load_Storage(){
    var boxName = $(".ServerList").attr("id")
    var Server = 0;
    var Data = JSON.parse(localStorage.getItem(boxName))
    var fix_blue = JSON.parse(localStorage.getItem("fix_blue"))
    var fix_red = JSON.parse(localStorage.getItem("fix_red"))
    var _this

    $(".Servers").each(function(){
        //0=サーバー
        //1,7,13=今回時間 2,8,14=今回色 3,9,15=前回時間 4,10,16=前回色
        //5,11,17=メモ,6,12,18=メモ背景色
        _this = $(this).find(".ゲル>.setTemp")        
        _this.find(".nowTime")
            .text(Data[Server][1])
            .css("background-color", Data[Server][2])
        _this.find(".befTime")
            .text(Data[Server][3])
            .css("background-color", Data[Server][4])
        _this.find(".memo")
            .val(Data[Server][5])
            .css("background-color", Data[Server][6])
        if(Data[Server][2] == "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "ゲル"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][2] != "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Data[Server][0] + "ゲル"])
        }

        _this = $(this).find(".砂漠>.setTemp")
        _this.find(".nowTime")
            .text(Data[Server][7])
            .css("background-color", Data[Server][8]),
        _this.find(".befTime")
            .text(Data[Server][9])
            .css("background-color", Data[Server][10]),
        _this.find(".memo")
            .val(Data[Server][11])
            .css("background-color", Data[Server][12])
        if(Data[Server][8] == "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "砂漠"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][8] != "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Data[Server][0] + "砂漠"])
        }

        _this = $(this).find(".バル>.setTemp")
        _this.find(".nowTime")
            .text(Data[Server][13])
            .css("background-color", Data[Server][14])
            _this.find(".befTime")
            .text(Data[Server][15])
            .css("background-color", Data[Server][16]),
            _this.find(".memo")
            .val(Data[Server][17])
            .css("background-color", Data[Server][18])
        if(Data[Server][14] == "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "バル"] = setInterval(setTimer,1000,_this)
        }
        else if(Data[Server][14] != "rgb(255, 0, 0)"){
            _this.find(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Data[Server][0] + "バル"])
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

function OneBack(){
    var Text,_this,nowColor

    if(TMP != null){
        $(".Servers").each(function(){
            if(TMP[0] == $(this).find(".Server").text()){
                _this = $(this).find("." + TMP[1] + ">.setTemp>.template2-box")
                nowColor = _this.find(".nowTime").css("background-color")
                _this.find(".nowTime").text(TMP[2]).css("background-color", TMP[3])
                _this.find(".befTime").text(TMP[4]).css("background-color", TMP[5])
                _this.find(".memo").val(TMP[6])
                
                //赤判定
                //TMP = Array(Server,Point,befTime,nowColor,old_befTime,befColor,memo)
                if(TMP[3] == "rgb(255, 0, 0)"){
                    _this.find(".btn[value=Red]").prop("disabled", true)
                    Timers[TMP[0] + TMP[1]] = setInterval(setTimer,1000,_this)

                    //タイマー復元
                    if(TMP[4] == ""){ //初回判定
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[2],"00:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }else if(TMP[5] == "rgb(255, 255, 0)"){ //赤判定
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[4].slice(3),"01:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }else{ //赤以外
                        Text = TMP[0] + TMP[1] + " "
                            + TimePlus(TMP[4].slice(3),"00:00:00") + " - "
                            + TimePlus(TMP[2],"01:00:00")
                    }
                    $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                }else if(TMP[3] != "rgb(255, 0, 0)"){
                    _this.find(".btn[value=Red]").prop("disabled", false)
                    clearInterval(Timers[TMP[0] + TMP[1]])
                    if(nowColor == "rgb(255, 0, 0)"){
                        clear_one_fix("fix_red",TMP[0] + TMP[1]) //確定リスト削除処理
                    }else
                    if(nowColor == "rgb(255, 255, 0)" && TMP[3] == "rgb(135, 206, 235)"){
                        clear_one_fix("fix_blue",TMP[0] + TMP[1]) //青黄リスト削除処理
                    }
                }
            }
        })

        TMP = null //初期化
    }
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
    $(".Servers").each(function(){
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)

        $(this).find(".nowTime").each(function(){
            $(this).text("").css("background-color", "transparent")
        })
        $(this).find(".befTime").each(function(){
            $(this).text("").css("background-color", "transparent")
        })
        $(this).find(".memo").each(function(){
            $(this).val("").css("background-color", "transparent")
        })
        
        //タイマー等初期化
        var Server = $(this).find(".Server").text().slice(4)
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

function clear_one_fix(fix,Text){
    if(fix == "fix_blue"){
        $(".fix_blue").find(".fix").each(function(){
            fix = $(this).text().split(" ")
            if(fix[0] == Text){ 
                    $(this).parent().remove()
            }
        })
    }
    else if(fix == "fix_red"){
        $(".fix_red").find(".fix").each(function(){
            fix = $(this).text().split(" ")
            if(fix[0] == Text){ 
                    $(this).parent().remove()
            }
        })
    }
}

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
    Time = ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2) + ":"
            + ("0" + Time.getSeconds()).slice(-2)

    return Time
}

//タイマ設置
function setTimer(_this){
    var objBox = _this.parents(".template2-box");
    var Time = objBox.find(".memo").val().slice(5)
    var nowTime = objBox.find(".nowTime").text()
    var Server = _this.closest("tr").find(".Server").text().slice(4)
    var Point = _this.closest("td").attr("class")
    
    if(Time == "00:10:00" || Time == "00:20:00" || Time == "00:30:00" || Time == "00:40:00"){
        objBox.find(".befTime")
            .text(nowTime)
            .css("background-color", "red")
        objBox.find(".nowTime")
            .text(TimePlus(nowTime,"00:10:00"))
            .css("background-color", "red")

        Time = TimePlus(Time,"00:00:01")
        objBox.find(".memo").val("経過時間:" + Time)
        save_Storage()
    }else
    if(Time == "00:50:00"){    
        Time = TimePlus(Time,"00:00:01")
        objBox.find(".memo").val("経過時間:" + Time)
        objBox.find(".memo").css("background-color", "violet")
    }else 
    if(Time == "01:00:00"){
        objBox.find(".befTime")
            .text(nowTime)
            .css("background-color", "red")
        objBox.find(".nowTime")
            .text(TimePlus(nowTime,"01:00:00"))
            .css("background-color", "red")
        objBox.find(".memo")
            .val("！！！！虹！！！！")
            .css("background-color", "red")
            
        clearInterval(Timers[Server+Point])
        save_Storage()
    }else{
        Time = TimePlus(Time,"00:00:01")
        objBox.find(".memo").val("経過時間:" + Time)
    }
}