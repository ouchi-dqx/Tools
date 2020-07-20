var Timers = {}
var TMP = []
var sendFlg = true

window.onload = function(){
    setInitMoveBtn();
    sortPoint()
}

function debug(){
}

//読込時の場所並び替え
function sortPoint(){
    let befPoint, afterPoint
    const Sort = JSON.parse(localStorage.getItem("Sort"))
    if(!Sort){ return 0 } //Storage内のSortデータ存在判定

    for(let i=0; i<2; i++){
        const Point = $(".ServerList td").find(".server-list-hd-text")
        let flg = false //フラグ初期化

        for(let n=1; n<4; n++){
            if($(Point).eq(n).text() !== Sort[n - 1]){
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
            movePoint(afterPoint, befPoint) //右移動
        }
    }
}

//←→ボタンイベント
$(document).on("click", ".left, .right", function() {
    let befPoint, afterPoint
    if($(this).attr("class") == "left"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").prev("td")
        movePoint(befPoint, afterPoint) //左移動
    }else
    if($(this).attr("class") == "right"){
        befPoint = $(this).closest("td")
        afterPoint = $(this).closest("td").next("td")
        movePoint(afterPoint, befPoint) //右移動
    }
})

//サーバー追加
$(document).on("click", ".setServers", function(){
    let i, max, num
    num = $(this).val()

    $(".ServerList tr").slice(1).remove() //テーブルの初期化
    $(".ServerList").attr("id", $(this).text()) //サーバリストID設定

    if(num == "9-10"){
        i = 9
        max = 11
        num = 0
    }else{
        i = 0
        max = 10
    }

    for(i; i<max; i++){
        const CopyTemp1 = $($("#template1").html()).clone()
        CopyTemp1.find(".Server").text(i + Number(num))
        CopyTemp1.find(".setTemp").each(function(){
            const CopyTemp2 = $($("#template2").html()).clone()
            $(this).append(CopyTemp2)
        })
        $(".ServerList").append(CopyTemp1)
    }

    //サーバ切り替え時のデータ保持処理
    const boxName = $(".ServerList").attr("id")
    if(sessionStorage.getItem(boxName) == "true"){
        load_Storage()
    }
})

//ボタンクリックイベント
$(document).on("click", ".btn", function(){
    const objBox = $(this).parents(".template2-box");
    const Data = {
        Server: $(this).closest("tr").find(".Server").text(),
        Point: $(this).closest("td").attr("class"),
        newDate: new Date().getTime(),
        newTime: TimePlus(new Date().getTime(), "00:00:00").Time,
        newColor: $(this).val(),
        nowDate: objBox.find(".nowTime").attr("Date"),
        nowTime: objBox.find(".nowTime").text(),
        nowColor: objBox.find(".nowTime").attr("color"),
        befDate: objBox.find(".befTime").attr("Date"),
        befTime: objBox.find(".befTime").text(),
        befColor: objBox.find(".befTime").attr("color"),
        memo: objBox.find(".memo").text()
    }

    TMP.push({
        Server: Data.Server,
        Point: Data.Point,
        Date: Data.befDate,
        Time: Data.befTime,
        Color: Data.befColor,
        memo: Data.memo,
        memoDate: objBox.find(".memo").attr("Date")
    })

    if(5 < TMP.length){
        TMP.shift()
    }

    timeStamp(objBox, Data)
})

//確定時間追加 見直し待機
function push_fix(){
    let fix
    let Data = []
    const Server = $("#Server")
    const Point = $("#Point")
    const sTime = $("#sTime")
    const eTime = $("#eTime")

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

//確定時間セット
$(document).on("click", "#sTime, #eTime", function() {
    if($(this).attr("id") == "sTime"){
        if($("#sTime").val() == ""){
            $("#sTime").val(TimePlus(new Date(),"01:00:00","Time").slice(0,-3))
        }
    }else
    if($(this).attr("id") == "eTime"){
        if($("#eTime").val() == ""){
            $("#eTime").val(TimePlus(new Date(),"01:00:00","Time").slice(0,-3))
        }
    }
})

//(確定/青木リスト)クリッククリア
$(document).on("click", ".fix", function() {
    const flg = confirm("本当に削除していいですか？")
    if(flg){
        $(this).closest("tr").remove()
    }
    save_Fix()
})

//[(確定/青木リスト)コピー]]
function setClip(fix){
    let CopyText = ""
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

//[(確定/青木リスト)クリア]
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

//[入力の保存]
function save_Storage(){
    const Point = ["ゲル", "砂漠", "バル"]
    let boxName = $(".ServerList").attr("id")
    let Storage = []
    let fix_blue = []
    let fix_red = []

    $(".Servers").each(function(){
        const Server = $(this).find(".Server").text()
        let Data = [] //配列初期化

        for(let i=0; i<3; i++){
            Data.push({
                nowDate: $(this).find("." + Point[i]).find(".nowTime").attr("Date"),
                nowTime: $(this).find("." + Point[i]).find(".nowTime").text(),
                nowColor: $(this).find("." + Point[i]).find(".nowTime").attr("color"),
                befDate: $(this).find("." + Point[i]).find(".befTime").attr("Date"),
                befTime: $(this).find("." + Point[i]).find(".befTime").text(),
                befColor: $(this).find("." + Point[i]).find(".befTime").attr("color"),
                memo: $(this).find("." + Point[i]).find(".memo").text(),
                memoDate: $(this).find("." + Point[i]).find(".memo").attr("Date"),
                memoColor: $(this).find("." + Point[i]).find(".memo").attr("color"),
                memo2: $(this).find("." + Point[i]).find(".memo2").val()
            })
        }

        Storage.push({
            [Server + Point[0]]: Data[0],
            [Server + Point[1]]: Data[1],
            [Server + Point[2]]: Data[2]
        })
    })

    if(boxName == "9 - 10"){
        boxName = "1 - 10"
        let tmp = JSON.parse(localStorage.getItem(boxName))

        if(!tmp){
            tmp = []

            for(let Server=1; Server<9; Server++){
                let tmpData = [] //初期化
                for(let i=0; i<3; i++){
                    tmpData.push({
                        nowDate: "", nowTime: "", nowColor: "",
                        befDate: "", befTime: "", befColor: "",
                        memo: "", memoDate: "", memoColor: "", memo2: ""
                    })
                }

                tmp.push({
                    [Server + Point[0]]: tmpData[0],
                    [Server + Point[1]]: tmpData[1],
                    [Server + Point[2]]: tmpData[2]
                })
            }
        }else{
            tmp.splice(8, 2)
        }

        Storage = tmp.concat(Storage)
        sessionStorage.setItem("1 - 10", true)
    }

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })

    if(boxName == "1 - 10"){
        sessionStorage.setItem("9 - 10", true)
    }
    sessionStorage.setItem(boxName, true)
    localStorage.setItem(boxName, JSON.stringify(Storage))
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))
}

//[データ復旧]
function load_Storage(){
    const boxName = $(".ServerList").attr("id")
    const fix_blue = JSON.parse(localStorage.getItem("fix_blue"))
    const fix_red = JSON.parse(localStorage.getItem("fix_red"))
    let Storage = JSON.parse(localStorage.getItem(boxName))
    let n = 0

    if(boxName == "9 - 10"){
        Storage = JSON.parse(localStorage.getItem("1 - 10"))
        n = 8
    }

    if(Storage != null){
        const Point = ["ゲル", "砂漠", "バル"]

        $(".Servers").each(function(){
            const Data = Storage[n]
            const Servers = $(this)
            const Server = Servers.find(".Server").text()

            for(let i=0; i<3; i++){
                const objBox = $(Servers).find("." + Point[i]).find(".template2-box")
                $(Servers).find("." + Point[i]).find(".nowTime")
                    .attr("Date", Data[Server + Point[i]].nowDate)
                    .text(Data[Server + Point[i]].nowTime)
                    .css("background-color", Data[Server + Point[i]].nowColor)
                    .attr("color", Data[Server + Point[i]].nowColor)

                $(Servers).find("." + Point[i]).find(".befTime")
                    .attr("Date", Data[Server + Point[i]].befDate)
                    .text(Data[Server + Point[i]].befTime)
                    .css("background-color", Data[Server + Point[i]].befColor)
                    .attr("color", Data[Server + Point[i]].befColor)

                $(Servers).find("." + Point[i]).find(".memo")
                    .text(Data[Server + Point[i]].memo)
                    .attr("Date", Data[Server + Point[i]].memoDate)
                    .attr("color", Data[Server + Point[i]].memoColor)

                $(Servers).find("." + Point[i]).find(".memo2")
                    .val(Data[Server + Point[i]].memo2)

                if(Data[Server + Point[i]].nowColor == "red"){
                    objBox.find(".btn[value=red]").prop("disabled", true)
                    Timers[Server + Point[i]] = setInterval(setTimer, 1000, objBox)
                }else{
                    if(Data[Server + Point[i]].memoDate != ""){
                        let diffTime = Data[Server + Point[i]].memoDate - new Date().getTime()
                        Timers[Server + Point[i]] = setTimeout(memoClearTimer, diffTime, objBox)
                    }
                    objBox.find(".btn[value=red]").prop("disabled", false)
                }
            }
            n++
        })
    }

    $(".fix_blue tr").slice(1).remove()
    $(".fix_red tr").slice(1).remove()

    fix_blue.forEach(function(Text){
        $(".fix_blue").append('<tr><td class="fix">' + Text + '</td></tr>')
    })
    fix_red.forEach(function(Text){
        $(".fix_red").append('<tr><td class="fix">' + Text + '</td></tr>')
    })
}

//[直前の状態に戻す]
function Rollback(){
    if(TMP.length != 0){
        const n = TMP.length - 1

        $(".Servers").each(function(){
            if(TMP[n].Server == $(this).find(".Server").text()){
                const objBox = $(this).find("." + TMP[n].Point).find(".template2-box")
                const Data = {
                    Server: TMP[n].Server,
                    Point: TMP[n].Point,
                    newDate: objBox.find(".befTime").attr("Date"),
                    newTime: objBox.find(".befTime").text(),
                    newColor: objBox.find(".befTime").attr("color"),
                    nowDate: TMP[n].Date,
                    nowTime: TMP[n].Time,
                    nowColor: TMP[n].Color,
                    befDate: objBox.find(".nowTime").attr("Date"),
                    befTime: objBox.find(".nowTime").text(),
                    befColor: objBox.find(".nowTime").attr("color"),
                    memo: TMP[n].memo,
                    memoDate: TMP[n].memoDate,
                    flg: true
                }

                timeStamp(objBox, Data)
                TMP.pop()
            }
        })
    }
}

//[調査場所の並びを保存]
function save_Sort(){
    const Sort = [
        $(".ServerList td").eq(1).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(2).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(3).find(".server-list-hd-text").text()
    ]
    localStorage.setItem("Sort", JSON.stringify(Sort))
}

//入力情報のクリア
function Cleaner(target){
    const flg = confirm("本当に削除していいですか？")

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
        }else if(target.value == "sort"){
            clear_Sort()
        }

        save_Storage()
        save_Fix()
    }
}

//[チェックリスト]
function clear_input(){
    $(".Servers").find(".nowTime")
            .attr("Date", "")
            .text("")
            .css("background-color", "transparent")
            .attr("color", "transparent")

    $(".Servers").find(".befTime")
            .attr("Date", "")
            .text("")
            .css("background-color", "transparent")
            .attr("color", "transparent")

    $(".Servers").find(".memo")
            .attr("Date", "")
            .text("")
            .css("background-color", "transparent")
            .attr("color", "transparent")

    $(".Servers").find(".btn[value=red]").prop("disabled", false)
    $(".Servers").find("td").css("border", "1px solid rgb(153, 153, 153)")
    $(".Servers").find(".memo2").val("")

    //タイマー等初期化
    $(".Servers").each(function(){
        const Server = $(this).find(".Server").text()
        clearInterval(Timers[Server + "ゲル"])
        clearInterval(Timers[Server + "砂漠"])
        clearInterval(Timers[Server + "バル"])
        TMP = []
    })
}

//[調査場所の並びをリセット]
function clear_Sort(){
    const Sort = ["ゲルヘナ幻野", "ジャリムバハ砂漠", "バルディスタ要塞"]
    localStorage.setItem("Sort", JSON.stringify(Sort))
    sortPoint()
}

/*            ここから関数群            */
//移動処理
function movePoint(befPoint, afterPoint){
    //template内移動処理用変数
    const befClass = "." + $(befPoint).attr("class")
    const afterClass = "." + $(afterPoint).attr("class")
    const tmp1 = document.getElementById("template1")
    const tmp1_befPoint = tmp1.content.querySelectorAll(".Servers >" + befClass)
    const tmp1_afterPoint = tmp1.content.querySelectorAll(".Servers >" + afterClass)
    const Servers = tmp1.content.querySelectorAll(".Servers")

    Servers.item(0).insertBefore(tmp1_befPoint.item(0), tmp1_afterPoint.item(0))
    befPoint.insertBefore(afterPoint)
    for(let i=0; i<10; i++){
        $(".Servers").find(befClass).eq(i)
            .insertBefore($(".Servers").find(afterClass).eq(i))
    }

    setInitMoveBtn();
}

//【NaL】端っこのボタン押せなくするやつ
function setInitMoveBtn(){
    $("#server-list-hd").find(".left, .right").prop("disabled", false);           //全活性
    $("#server-list-hd").find(".left, .right").first().prop("disabled", true);    //最初のボタンを非活性
    $("#server-list-hd").find(".left, .right").last().prop("disabled", true);     //最後のボタンを非活性
}

//確定リストの入力チェック
function checkTime(Time) {
    return Time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
}

//(確定/青木リスト)保存
function save_Fix(){
    let fix_blue = []
    let fix_red = []

    $(".fix_blue").find(".fix").each(function(){
        fix_blue.push([$(this).text()])
    })
    $(".fix_red").find(".fix").each(function(){
        fix_red.push([$(this).text()])
    })

    localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
    localStorage.setItem("fix_red", JSON.stringify(fix_red))
}

//(確定/青木リスト)選択クリア
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

//タイムスタンプ設定
function timeStamp(objBox, Data){
    //赤離脱判定
    if((Data.nowColor == "red" && Data.newColor != "red")
        || (Data.befColor == "red" && Data.nowColor != "red" && Data.flg == true)
        || Data.newTime == ""){
        //ボタン禁止解除・タイマ削除 メモ背景色初期化
        objBox.find(".btn[value=red]").prop("disabled", false)
        objBox.find(".memo")
            .css("background-color", "transparent")
            .attr("color", "transparent")
        clearInterval(Timers[Data.Server + Data.Point])
        clear_one_fix("fix_red", Data.Server + Data.Point)
    }

    //現在時間書き込み・背景色変更
    let Time, sendTime, diffDate, memoDate, Text
    switch(Data.newColor){
        case "skyblue":
            //赤青・虹青判定
            if(Data.nowColor == "red" || Data.nowColor == "violet"){
                if(Data.nowColor == "red"){
                    sendTime = Data.memo.slice(5)
                }else{
                    sendTime = "00:00:00"
                }
                sendTime = TimePlus(Data.nowDate, sendTime).Date
                Sender(Data.Server, Data.Point, sendTime, "violet")

                Time = TimePlus(Data.newDate, "01:30:00").Time.slice(0, -3)
                Data.memo = Time + "までに黄変化"

                memoDate = TimePlus(Data.newDate, "01:30:00").Date
                diffDate = memoDate - Data.newDate
                Timers[Data.Server + Data.Point] = setTimeout(memoClearTimer, diffDate, objBox)
            }

            if(Data.nowColor == "yellow" || Data.befColor == "yellow"){
                clear_one_fix("fix_blue", Data.Server + Data.Point)
            }
        break
        case "yellow":
            //赤黄・虹黄判定
            if(Data.nowColor == "red" || Data.nowColor == "violet"){
                if(Data.nowColor == "red"){
                    sendTime = Data.memo.slice(5)
                }else{
                    sendTime = "00:00:00"
                }
                sendTime = TimePlus(Data.nowDate, sendTime).Date
                Sender(Data.Server, Data.Point, sendTime, "yellow")

                Time = TimePlus(Data.nowDate, "01:30:00").Time.slice(0, -3)
                Data.memo = Time + "まで変化無し"

                memoDate = TimePlus(Data.newDate, "01:30:00").Date
                diffDate = memoDate - Data.newDate
                Timers[Data.Server + Data.Point] = setTimeout(memoClearTimer, diffDate, objBox)
            }

            //青黄判定
            if(Data.nowColor == "skyblue"){
                Text = Data.Server + Data.Point + " "
                    + TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3) + " - "
                    + TimePlus(Data.newDate, "03:00:00").Time.slice(0, -3)
                $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")

                Time = TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3)
                Data.memo = Time + "まで変化無し"

                clearTimeout(Timers[Data.Server + Data.Point])
                memoDate = TimePlus(Data.newDate, "03:00:00").Date
                diffDate = memoDate - Data.newDate
                Timers[Data.Server + Data.Point] = setTimeout(memoClearTimer, memoDate, objBox)
            }
        break
        case "red":
            objBox.find(".btn[value=red]").prop("disabled", true)
            Data.memo = "経過時間:" + "00:00:00"
            clearTimeout(Timers[Data.Server + Data.Point])
            Timers[Data.Server + Data.Point] = setInterval(setTimer, 1000, objBox)

            //黄赤判定
            if(Data.nowColor == "yellow"){
                if(Data.befColor == "skyblue"){ //前回青判定
                    if(Data.newDate > Data.nowDate){ //青黄時間より先の時間の場合
                        Text = Data.Server + Data.Point + " "
                            + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                            + TimePlus(Data.nowDate, "04:00:00").Time.slice(0, -3)
                    }else{ //青木時間より早い時間の場合
                        Text = Data.Server + Data.Point + " "
                        + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                        + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                    }
                }else{
                    Text = Data.Server + Data.Point + " "
                        + TimePlus(Data.nowDate, "01:00:00").Time.slice(0, -3) + " - "
                        + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                }
            }else{
                //黄赤以外で赤判定
                Text = Data.Server + Data.Point + " - "
                    + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
            }
            $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")

            clear_one_fix("fix_blue", Data.Server + Data.Point)
        break
        case "violet":
            if(Data.nowColor != "violet" || Data.befColor != "violet"){
                Sender(Data.Server, Data.Point, Data.newDate, "violet")
            }

            clear_one_fix("fix_blue", Data.Server + Data.Point)
        break
    }

    //青もしくは虹継続以外時、前回時間更新
    if((Data.nowColor != "skyblue" || Data.befColor != "skyblue") && (Data.nowColor != "violet" || Data.befColor != "violet")){
        objBox.find(".befTime")
            .attr("Date", Data.nowDate)
            .text(Data.nowTime)
            .css("background-color", Data.nowColor)
            .attr("color", Data.nowColor)
    }

    objBox.find(".nowTime")
        .attr("Date", Data.newDate)
        .text(Data.newTime)
        .css("background-color", Data.newColor)
        .attr("color", Data.newColor)

    objBox.find(".memo")
        .attr("Date", memoDate)
        .text(Data.memo)

    $(".Servers").find("td").css("border", "1px solid rgb(153, 153, 153)")
    objBox.parents("td").css("border", "2px solid")

    save_Storage(true)
}

//時間計算
function TimePlus(Time, sumTime){
    Time = new Date(Number(Time))
    sumTime = sumTime.split(":")
    Time.setHours(Time.getHours() + Number(sumTime[0]))
    Time.setMinutes(Time.getMinutes() + Number(sumTime[1]))
    Time.setSeconds(Time.getSeconds() + Number(sumTime[2]))

    return {
        Date: Time.getTime(),
        Time: ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2) + ":"
            + ("0" + Time.getSeconds()).slice(-2)
    }
}

//タイマ設置
function setTimer(objBox){
    const Server = objBox.closest("tr").find(".Server").text()
    const Point = objBox.closest("td").attr("class")

    const newDate = new Date().getTime()
    const nowDate = objBox.find(".nowTime").attr("Date")
    const nowTime = objBox.find(".nowTime").text()

    const diffTime = newDate - nowDate
    const Hour = diffTime / (1000 * 60 *60)
    const Minute = (Hour - Math.floor(Hour)) * 60
    const Second = (Minute - Math.floor(Minute)) * 60
    const Time = ('00' + Math.floor(Hour)).slice(-2) + ':'
            + ('00' + Math.floor(Minute)).slice(-2) + ':'
            + ('00' + Math.round(Second)).slice(-2)

    if(Time == "00:50:00" || ((1000 * 60 * 50) <= diffTime ) && (1000 * 60 * 60) > diffTime){
        objBox.find(".memo")
            .text("経過時間:" + Time)
            .css("background-color", "violet")
            .attr("color", "violet")
    }else
    if((1000 * 60 * 60) <= diffTime) {
        objBox.find(".befTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", "red")
            .attr("color", "red")

        objBox.find(".nowTime")
            .attr("Date", TimePlus(nowDate, "01:00:00").Date)
            .text(TimePlus(nowDate, "01:00:00").Time)
            .css("background-color", "violet")
            .attr("color", "violet")

        objBox.find(".memo")
            .text("経過時間:01:00:00")
            .css("background-color", "transparent")
            .attr("color", "transparent")

        objBox.find(".btn[value=red]").prop("disabled", false)
        Sender(Server, Point, newDate, "violet")
        clearInterval(Timers[Server + Point])
        clear_one_fix("fix_red",Server + Point)
    }else{
        objBox.find(".memo").text("経過時間:" + Time)
    }
}

function memoClearTimer(objBox){
    objBox.find(".memo")
        .text("")
        .css("background-color", "transparent")
        .attr("color", "transparent")
}

//データ送信
function Sender(Server, Point, Time, Color){
    if(sendFlg){
        if(Color == "yellow"){
            Time = TimePlus(Time, "01:30:00").Date
        }else{
            Time = TimePlus(Time, "00:00:00").Date
        }

        Time = new Date(Number(Time))
        Time = ("0" + Number(Time.getMonth() + 1)).slice(-2) + "/"
            + ("0" + Time.getDate()).slice(-2) + " "
            + ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2)

        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbxlGCRghpYCAy7eyk0baCalwF0ZXjG_6tI-ZRVXdeiEo5kpUcw/exec",
            type: "GET",
            dataType: "jsonp",
            data: {Server: Server, Point: Point, Time: Time, Color: Color, mode: "write"}
        })
    }
}