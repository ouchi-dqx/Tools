var Timers = {}
var TMP

window.onload = function(){
    sortPoint()
    setInitMoveBtn();
}

function debug(){
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
}

function Sender(Server,Point,Time){
    Time = TimePlus(Time,"01:30:00","Date").substr(5).slice(0,-3) //yearとseconds削除

    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxlGCRghpYCAy7eyk0baCalwF0ZXjG_6tI-ZRVXdeiEo5kpUcw/exec",
        type: "GET",
        dataType: "jsonp",
        data: {Server: Server, Point: Point, Time: Time}
    })    
}

//←→ボタンイベント
$(document).on("click", ".left, .right", function() {
    var befPoint,afterPoint
    if($(this).attr("class") == "left"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").prev("td")
        movePoint(befPoint,afterPoint) //左移動
    }else
    if($(this).attr("class") == "right"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").next("td")
        movePoint(afterPoint,befPoint) //右移動
    }
})

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
    
    setInitMoveBtn();
}

//【NaL】端っこのボタン押せなくするやつ
function setInitMoveBtn(){
    $("#server-list-hd").find(".left,.right").prop('disabled',false);           //全活性
    $("#server-list-hd").find(".left,.right").first().prop('disabled',true);    //最初のボタンを非活性
    $("#server-list-hd").find(".left,.right").last().prop('disabled',true);     //最後のボタンを非活性
}

//ボタンクリックイベント
$(document).on("click", ".btn", function(){   
    //変数作成
    var Time,Text
    var objBox = $(this).parents(".template2-box");
    var Server = $(this).closest("tr").find(".Server").text()
    var Point = $(this).closest("td").attr("class")
    var btnColor = $(this).text()
    
    var nowDate = new Date()
    nowDate = nowDate.getFullYear() + "/" + Number(nowDate.getMonth() + 1) + "/" + nowDate.getDate() + " "
    var befDate = objBox.find(".nowTime").attr("Date")
    var old_befDate = objBox.find(".befTime").attr("Date")

    var nowTime = TimePlus(new Date(),"00:00:00","Time")    
    var befTime = objBox.find(".nowTime").text();
    var old_befTime = objBox.find(".befTime").text();
    
    var nowColor = objBox.find(".nowTime").attr("color")
    var befColor = objBox.find(".befTime").attr("color")
    var memo = objBox.find(".memo").val();

    TMP = Array(Server,Point,old_befDate,old_befTime,befColor,memo)

    //赤離脱判定
    if(nowColor == "red" && btnColor != "赤"){
        //ボタン禁止解除・タイマ削除 メモ背景色初期化
        $(this).parent().find(".btn[value=Red]").prop("disabled", false)
        objBox.find(".memo")
            .css("background-color", "white")
            .attr("color","white")
        clearInterval(Timers[Server + Point])
        clear_one_fix("fix_red",Server + Point)
    }

    //現在時間書き込み・背景色変更
    switch(btnColor){
        case "青":
            //赤青・虹青判定
            if(nowColor == "red" || nowColor == "violet"){
                Time = TimePlus(nowTime,"01:30:00","Time")
                objBox.find(".memo").val(Time.slice(0,-3) + "までに黄変化")
            }

            //青継続以外時、前回時間更新
            if(nowColor != "skyblue" || befColor != "skyblue"){
                objBox.find(".befTime")
                    .attr("Date", befDate)
                    .text(befTime)
                    .css("background-color", nowColor)
                    .attr("color",nowColor)
            }

            objBox.find(".nowTime")
                .attr("Date", nowDate)
                .text(nowTime)
                .css("background-color", "skyblue")
                .attr("color","skyblue")
        break
        case "黄":
            //赤黄・虹黄判定
            if(nowColor == "red" || nowColor == "violet"){
                //Sender(Server,Point,befDate + befTime)
                Time = TimePlus(befTime,"01:30:00","Time")
                objBox.find(".memo").val(Time.slice(0,-3) + "まで色変化無し")
            }

            //青黄判定
            if(nowColor == "skyblue"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"03:00:00","Time").slice(0,-3) + " - "
                    + TimePlus(nowTime,"03:00:00","Time").slice(0,-3)
                $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
                                                
                Time = TimePlus(befTime,"03:00:00","Time")
                objBox.find(".memo").val(Time.slice(0,-3) + "まで色変化無し")
            }
            
            objBox.find(".befTime")
                .attr("Date", befDate)
                .text(befTime)
                .css("background-color", nowColor)
                .attr("color", nowColor)
            objBox.find(".nowTime")
                .attr("Date", nowDate)
                .text(nowTime)
                .css("background-color", "yellow")
                .attr("color", "yellow")
        break
        case "赤":
            //赤ボタンクリック禁止
            $(this).prop("disabled", true) 

            //タイマーセット
            objBox.find(".memo").val("経過時間:" + "00:00:00")
            Timers[Server + Point] = setInterval(setTimer,1000,$(this))

            //黄赤判定
            if(nowColor == "yellow"){
                Text = Server + Point + " "
                    + TimePlus(befTime,"01:00:00","Time").slice(0,-3) + " - "
                    + TimePlus(nowTime,"01:00:00","Time").slice(0,-3)
            }else //黄赤以外で赤判定
            if(nowColor != "yellow"){
                Text = Server + Point + " "
                    + TimePlus(nowTime,"00:00:00","Time").slice(0,-3) + " - "
                    + TimePlus(nowTime,"01:00:00","Time").slice(0,-3)
            }
            $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")

            //青黄リストクリア
            clear_one_fix("fix_blue",Server + Point)

            objBox.find(".befTime")
                .attr("Date", befDate)
                .text(befTime)
                .css("background-color", nowColor)
                .attr("color", nowColor)
            objBox.find(".nowTime")
                .attr("Date", nowDate)
                .text(nowTime)
                .css("background-color", "red")
                .attr("color", "red")
        break
        case "虹":
            //虹継続時以外、前回時間更新
            if(nowColor != "violet" || befColor != "violet"){
                objBox.find(".befTime")
                    .attr("Date", befDate)
                    .text(befTime)
                    .css("background-color", nowColor)
                    .attr("color", nowColor)
            }

            objBox.find(".nowTime")
                .attr("Date", nowDate)
                .text(nowTime)
                .css("background-color", "violet")
                .attr("color", "violet")
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
        CopyTemp1.find(".Server").text(i + num)
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
        + sTime.val().slice(0,-3) + " - " + eTime.val().slice(0,-3)
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
        + 60 * 60 //終了時間から1時間後

    var nowTime = new Date()
    nowTime =  nowTime.getHours() * 60 * 60
        + nowTime.getMinutes() * 60

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
            $("#sTime").val(TimePlus(new Date(),"01:00:00","Time"))
        }
    }else 
    if($(this).attr("id") == "eTime"){
        if($("#eTime").val() == ""){
            $("#eTime").val(TimePlus(new Date(),"01:00:00","Time"))
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
            $(this).find(".Server").text(),
            
            $(this).find(".ゲル").find(".nowTime").attr("Date"),
            $(this).find(".ゲル").find(".nowTime").text(),
            $(this).find(".ゲル").find(".nowTime").attr("color"),
            $(this).find(".ゲル").find(".befTime").attr("Date"),
            $(this).find(".ゲル").find(".befTime").text(),
            $(this).find(".ゲル").find(".befTime").attr("color"),
            $(this).find(".ゲル").find(".memo").val(),
            $(this).find(".ゲル").find(".memo").attr("color"),

            $(this).find(".砂漠").find(".nowTime").attr("Date"),
            $(this).find(".砂漠").find(".nowTime").text(),
            $(this).find(".砂漠").find(".nowTime").attr("color"),
            $(this).find(".砂漠").find(".befTime").attr("Date"),
            $(this).find(".砂漠").find(".befTime").text(),
            $(this).find(".砂漠").find(".befTime").attr("color"),
            $(this).find(".砂漠").find(".memo").val(),
            $(this).find(".砂漠").find(".memo").attr("color"),

            $(this).find(".バル").find(".nowTime").attr("Date"),
            $(this).find(".バル").find(".nowTime").text(),
            $(this).find(".バル").find(".nowTime").attr("color"),
            $(this).find(".バル").find(".befTime").attr("Date"),
            $(this).find(".バル").find(".befTime").text(),
            $(this).find(".バル").find(".befTime").attr("color"),
            $(this).find(".バル").find(".memo").val(),
            $(this).find(".バル").find(".memo").attr("color"),
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
        //1,9,17=今回日付 2,10,18=今回時間 3,11,19=今回色
        //4,12,20=前回日付 5,13,21=前回時間 6,14,22=前回色
        //7,15,23=メモ,8,16,24=メモ背景色
        _this = $(this).find(".ゲル")
        _this.find(".nowTime")
            .attr("date",Data[Server[1]])
            .text(Data[Server][2])
            .css("background-color", Data[Server][3])
            .attr("color", Data[Server][3])
        _this.find(".befTime")
            .attr("date",Data[Server[4]])
            .text(Data[Server][5])
            .css("background-color", Data[Server][6])
            .attr("color", Data[Server][6])
        _this.find(".memo")
            .val(Data[Server][7])
            .css("background-color", Data[Server][8])
            .attr("color", Data[Server][8])
        if(Data[Server][3] == "red"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "ゲル"] = setInterval(setTimer,1000,_this.find(".btn[value=Red]"))
        }
        else if(Data[Server][3] != "red"){
            _this.find(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Data[Server][0] + "ゲル"])
        }

        _this = $(this).find(".砂漠")
        _this.find(".nowTime")
            .attr("date",Data[Server[9]])
            .text(Data[Server][10])
            .css("background-color", Data[Server][11])
            .attr("color", Data[Server][11])
        _this.find(".befTime")
            .attr("date",Data[Server[12]])
            .text(Data[Server][13])
            .css("background-color", Data[Server][14])
            .attr("color", Data[Server][14])
        _this.find(".memo")
            .val(Data[Server][15])
            .css("background-color", Data[Server][16])
            .attr("color", Data[Server][16])
        if(Data[Server][11] == "red"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "砂漠"] = setInterval(setTimer,1000,_this.find(".btn[value=Red]"))
        }
        else if(Data[Server][11] != "red"){
            _this.find(".btn[value=Red]").prop("disabled", false)
            clearInterval(Timers[Data[Server][0] + "砂漠"])
        }

        _this = $(this).find(".バル")
        _this.find(".nowTime")
            .attr("date",Data[Server[17]])
            .text(Data[Server][18])
            .css("background-color", Data[Server][19])
            .attr("color", Data[Server][19])
        _this.find(".befTime")
            .attr("date",Data[Server[20]])
            .text(Data[Server][21])
            .css("background-color", Data[Server][22])
            .attr("color", Data[Server][22])
        _this.find(".memo")
            .val(Data[Server][23])
            .css("background-color", Data[Server][24])
            .attr("color", Data[Server][24])
        if(Data[Server][19] == "red"){
            _this.find(".btn[value=Red]").prop("disabled", true)
            Timers[Data[Server][0] + "バル"] = setInterval(setTimer,1000,_this.find(".btn[value=Red]"))
        }
        else if(Data[Server][19] != "red"){
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
        $(".ServerList td").eq(1).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(2).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(3).find(".server-list-hd-text").text()
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
    var _this,nowColor,befDate,befTime,befColor,Text

    if(TMP != null){
        $(".Servers").each(function(){
            //              0      1       2            3         4      5
            //TMP = Array(Server,Point,old_befDate,old_befTime,befColor,memo)
            if(TMP[0] == $(this).find(".Server").text()){
                //変数セット
                _this = $(this).find("." + TMP[1]).find(".template2-box")
                nowColor = _this.find(".nowTime").attr("color")
                befDate = _this.find(".befTime").attr("Date")
                befTime = _this.find(".befTime").text()
                befColor = _this.find(".befTime").attr("color")
                
                //赤離脱判定
                if(nowColor == "red" && befColor != "red"){
                    //ボタン禁止解除・タイマ削除 メモ背景色初期化
                    _this.find(".btn[value=Red]").prop("disabled", false)
                    clearInterval(Timers[TMP[0] + TMP[1]])
                    _this.find(".memo")
                        .css("background-color", "white")
                        .attr("color","white")
                    clear_one_fix("fix_red",TMP[0] + TMP[1])
                }

                //リスト追加削除処理
                switch(befColor){
                    case "skyblue" :
                        if(nowColor == "yellow"){ //青木リスト削除
                            clear_one_fix("fix_blue",TMP[0] + TMP[1])
                        }
                    break
                    case "yellow" :
                        if(TMP[4] == "skyblue"){ //青黄リスト追加
                            Text = TMP[0] + TMP[1] + " "
                                + TimePlus(TMP[3],"03:00:00","Time").slice(0,-3) + " - "
                                + TimePlus(befTime,"03:00:00","Time").slice(0,-3)
                            $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
                        }
                    break
                    case "red" :
                        _this.find(".btn[value=Red]").prop("disabled", true)
                        Timers[TMP[0] + TMP[1]] = setInterval(setTimer,1000,_this.find(".btn[value=Red]"))
                        
                        if(TMP[3] == ""){ //前回時間空判定
                            Text = TMP[0] + TMP[1] + " "
                                + TimePlus(befTime,"00:00:00","Time") + " - "
                                + TimePlus(befTime,"01:00:00","Time")
                        }else
                        if(TMP[4] == "yellow"){ //黄赤判定
                            Text = TMP[0] + TMP[1] + " "
                                + TimePlus(TMP[3],"01:00:00","Time") + " - "
                                + TimePlus(befTime,"01:00:00","Time")
                        }else
                        if(TMP[4] != "yellow"){ //黄赤以外で赤判定
                            Text = TMP[0] + TMP[1] + " "
                                + TimePlus(TMP[3],"00:00:00","Time") + " - "
                                + TimePlus(befTime,"01:00:00","Time")
                        }
                        $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                    break
                }

                //時間ロールバック
                _this.find(".nowTime")
                    .attr("Date", befDate)
                    .text(befTime)
                    .css("background-color", befColor)
                    .attr("color", befColor)
                _this.find(".befTime")
                    .attr("Date", TMP[2])
                    .text(TMP[3])
                    .css("background-color", TMP[4])
                    .attr("color", TMP[4])
                _this.find(".memo").val(TMP[5])
            }
        })

        TMP = null //初期化
    }
}

function setClip(fix){
    var CopyText = ""
    if(fix.value == "fix_blue"){
        $(".fix_blue").find(".fix").each(function(){
            CopyText += $(this).text() + "\n"
        })
    }
    else if(fix.value == "fix_red"){
        $(".fix_red").find(".fix").each(function(){
            CopyText += $(this).text() + "\n"
        })
    }

    //iPhone用処理追加予定
    navigator.clipboard.writeText(CopyText)
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
        $(this).find(".btn[value=Red]").prop("disabled", false)

        $(this).find(".nowTime").each(function(){
            $(this).text("").css("background-color", "transparent").attr("color", "transparent")
        })
        $(this).find(".befTime").each(function(){
            $(this).text("").css("background-color", "transparent").attr("color", "transparent")
        })
        $(this).find(".memo").each(function(){
            $(this).val("").css("background-color", "white").attr("color", "white")
        })
        
        //タイマー等初期化
        var Server = $(this).find(".Server").text()
        clearInterval(Timers[Server + "ゲル"])
        clearInterval(Timers[Server + "砂漠"])
        clearInterval(Timers[Server + "バル"])
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
function TimePlus(Time,sumTime,mode){
    if(Time.length != undefined){
        if(mode == "Date"){
            Time = new Date(Time)
        }else
        if(mode == "Time"){
            Time = new Date("2020/01/01 " + Time)
        }
    }

    sumTime = sumTime.split(":")
    Time.setHours(Time.getHours() + Number(sumTime[0]))
    Time.setMinutes(Time.getMinutes() + Number(sumTime[1]))
    Time.setSeconds(Time.getSeconds() + Number(sumTime[2]))
    
    var Text
    if(mode == "Date"){
        Text = Time.getFullYear() + "/" + Number(Time.getMonth() + 1) + "/" + Time.getDate() + " "
            + ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2) + ":"
            + ("0" + Time.getSeconds()).slice(-2)
        return Text
    }else
    if(mode == "Time"){
        //時間の0詰め
        Text = ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2) + ":"
            + ("0" + Time.getSeconds()).slice(-2)
        return Text
    }
}

//タイマ設置
function setTimer(_this){
    var objBox = _this.parents(".template2-box");
    var Server = _this.closest("tr").find(".Server").text()
    var Point = _this.closest("td").attr("class")

    var nowDate = new Date()
    nowDate = nowDate.getFullYear() + "/" + Number(nowDate.getMonth() + 1) + "/" + nowDate.getDate() + " "
    var befDate = objBox.find(".nowTime").attr("Date")
    
    var nowTime = TimePlus(new Date(),"00:00:00","Time")
    var befTime = objBox.find(".nowTime").text()
    var Time = objBox.find(".memo").val().slice(5) //「経過時間 」削除

    if(Time == "00:10:00" || Time == "00:20:00" || Time == "00:30:00" || Time == "00:40:00"){
        objBox.find(".befTime")
            .attr("Date", befDate)
            .text(befTime)
            .css("background-color", "red")
            .attr("color", "red")
        objBox.find(".nowTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", "red")
            .attr("color", "red")
        Time = TimePlus(Time,"00:00:01","Time")
        objBox.find(".memo").val("経過時間:" + Time)
        save_Storage()
    }else
    if(Time == "00:50:00"){    
        Time = TimePlus(Time,"00:00:01","Time")
        objBox.find(".memo")
            .val("経過時間:" + Time)
            .css("background-color", "violet")
            .attr("color", "violet")
    }else 
    if(Time == "01:00:00"){
        objBox.find(".befTime")
            .attr("Date", befDate)
            .text(befTime)
            .css("background-color", "red")
            .attr("color", "red")
        objBox.find(".nowTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", "red")
            .attr("color", "red")
        objBox.find(".memo")
            .val("！！！！虹！！！！")
            .css("background-color", "red")
            .attr("color", "red")
        clearInterval(Timers[Server + Point])
        save_Storage()
    }else{
        Time = TimePlus(Time,"00:00:01","Time")
        objBox.find(".memo").val("経過時間:" + Time)
    }
}