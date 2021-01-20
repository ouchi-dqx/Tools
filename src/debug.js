var Timers = {}
var TMP = []
var ptMODE = ""
var even_oddMODE = ""
var get_flg = false
//var sendFlg = ""

window.onload = function(){
    sortPoint()
    modeChange();
    setInitMoveBtn();       //【NaL】調査マップ入替ボタンの活性切替
    setRollbackEnable();    //【NaL】[戻す]ボタンの活性切替
    $(".other_block").hide()
    if(location.search.substring(1) !== "") getURLData()

    /*
        sendFlg = localStorage.getItem("sendMode")
        even_oddMODE = localStorage.getItem("even_oddMode")

        if(sendFlg == "ON"){
            $('#chk-send-info').next('.btn-tgl').html('提供 ON');
            $('#chk-send-info').prop('checked', true);
            sendFlg = true
        }
        else if(sendFlg == "OFF"){
            $('#chk-send-info').next('.btn-tgl').html('提供OFF');
            $('#chk-send-info').prop('checked', false);
            sendFlg = false
        }
    */
}

function debug(){}

/*最新コード*/
    function getURLData(){
        $(".debugArea").html(
            "params=" + location.search.substring(1) + "<br>"
        )

        try{
            ptMODE = getParam("ptMODE")
            const btnText =  getParam("btnText")
            const getData = {
                boxName : getParam("boxName"),
                Storage : JSON.parse(getParam("Storage")),
                fix_blue : JSON.parse(getParam("fix_blue")),
                fix_red : JSON.parse(getParam("fix_red")),
            }
        }
        catch(e){
            $(".debugArea").html(
                "params=" + location.search.substring(1) + "<br>" +
                "error=" + e
            )
        }

        ptMODE = getParam("ptMOsDE")
        const btnText =  getParam("btnText")
        const getData = {
            boxName : getParam("boxName"),
            Storage : JSON.parse(getParam("Storage")),
            fix_blue : JSON.parse(getParam("fix_blue")),
            fix_red : JSON.parse(getParam("fix_red")),
        }

        $(".debugArea").html(
            "params=" + location.search.substring(1) + "<br>" +
            "decode=" + JSON.stringify(getData)
        )

        if(getData.boxName == "" || getData.Storage == ""){
            alert("不正なURLです")
            return false
        }

        if(ptMODE == "PT8"){
            $('.setting-box .mode-change-box input[value="PT8"]').prop('checked', true);
            modeChange()
        }

        $(".setServers").each(function(){
            if($(this).text() == btnText){
                get_flg = true
                $(this).click()
            }
        })

        load_Storage(getData)
    }

    function getShortURL(){
        if($(".ServerList").find('.Servers').length <= 1){
            alert("先に調査サーバーを選択してください。");
            return 0
        }

        const boxName = $(".ServerList").attr("id")
        const Storage = localStorage.getItem(boxName)
        const fix_blue = localStorage.getItem("fix_blue")
        const fix_red = localStorage.getItem("fix_red")
        const btnText = $(".ServerID:visible").first().text() + " - " + $(".ServerID:visible").last().text()
        const params = LZString.compressToEncodedURIComponent(
            "ptMODE=" + ptMODE
                + "&btnText=" + btnText
                + "&boxName=" + boxName
                + "&Storage=" + Storage
                + "&fix_blue=" + fix_blue
                + "&fix_red=" + fix_red
        )
        $(".nowGetURL").show()

        $.ajax({
            async:true,
            url: "https://script.google.com/macros/s/AKfycbwCz56sXENejr9tHKjg8eoG8PdiBcN4HHo7FKf6JetXj3smgBVDR68K/exec",
            type: "GET",
            dataType: "jsonp",
            data: {params: params, mode: "shortURL"},
            beforeSend:function(xhr){
                if (window.navigator.userAgent.toLowerCase().indexOf('safari') != -1)
                xhr.setRequestHeader("If-Modified-Since", new Date().toUTCString())
            },
            success: res => {
                $(".URL").val(res.URL)
                $(".nowGetURL").hide()
                $(".ShortURL").show()
            },
            error:function(XMLHttpRequest, textStatus, errorThrown) {
                $(".nowGetURL").html(
                    "ERROR!!<br>" +
                    "XMLHttpRequest.status:" + XMLHttpRequest.status + "<br>" +
                    "XMLHttpRequest.statusText:" + XMLHttpRequest.statusText + "<br>" +
                    "textStatus:" + textStatus + "<br>" +
                    "errorThrown:" + errorThrown.message
                );
            }
        })
    }

    function getParam(params) {
        const url = LZString.decompressFromEncodedURIComponent(location.search.substring(1));
        params = params.replace(/[\[\]]/g, "\\$&");
        const regex = new RegExp(params + "(=([^&#]*)|&|#|$)");
        const param = regex.exec(url);
        return param[2].replace(/\+/g, " ");
    }

    function copyURL(){
        const CopyText = $(".URL").val()
        const promise = new Promise((resolve, reject) => resolve())
        promise.then(() => navigator.clipboard.writeText(CopyText))
        promise.then(() => copy(CopyText))
    }


/*ヘッダ部機能(リンク)*/
    //関係者向け
    function LoginCheck(){
        const pass = window.prompt("パスワードを入力してください")
        if(pass){
            $.ajax({
                url: "https://script.google.com/macros/s/AKfycbxGwBzlzS2wA8zcnoyG9iCRY048zGrLuuPQAi-cBB3oVGuTi0nb/exec",
                type: "GET",
                dataType: "jsonp",
                data: {mode: "login", pass: pass},
                success: res => {
                    if(res.HTMLData){
                        const script = document.createElement('script');
                        script.src = res.ScriptData;
                        $("head").append(script);
                        $("body").prepend(res.HTMLData);
                    }
                    else alert("パスワードが違います");
                }
            })
        }
    }

    //調査鯖おみくじ
    function omikuji(){
        const omikuji = ["1-10","11-20","21-30","31-40"]
        const rnd = Math.floor(Math.random() * omikuji.length)
        $(".omikuji").text("サーバー" + omikuji[rnd])
    }


/*ヘッダ部機能(ボタン)*/
    //[モード変更]
    function modeChange(){
        //【NaL】モード切替スイッチ追加に伴う変更
        ptMODE = $('.mode-change-box input[name=opt-tgl]:checked').val();
        if(ptMODE == "PT4") $(".even_odd").prop("disabled", false)
        if(ptMODE == "PT8") $(".even_odd").prop("disabled", true)
        $('.select-mode').hide();               //一旦すべて非表示
        $('.select-mode' + '.'+ptMODE).show();    //選択モードのみ表示
    }

    //サーバー追加
    $(document).on("click", ".setServers", function(){
        const boxName = $(this).attr("boxName")
        const num = $(this).val()
        const Start = $(this).attr("Start")
        const End = $(this).attr("End")
        TMP = [] //初期化

        $(".ServerList tr").slice(1).remove() //テーブルの初期化
        $(".ServerList").attr("id", boxName) //サーバリストID設定

        for(let i=0; i<10; i++){
            const CopyTemp1 = $($("#template1").html()).clone()
            CopyTemp1.find(".ServerID").text(i + Number(num))
            CopyTemp1.find(".setTemp").each(function(){
                const CopyTemp2 = $($("#template2").html()).clone()
                $(this).append(CopyTemp2)
            })
            $(".ServerList tbody").append(CopyTemp1)
        }

        if($(this).text() == "9 - 10" || ptMODE == "PT8"){
            $(".Servers").each(function(){
                const Server = Number($(this).find(".ServerID").text())
                if(Server < Start || Server > End) $(this).hide()
            })
        }
        if(even_oddMODE == "ON") tSort("even_odd")

        //サーバ切り替え時のデータ保持処理
        if(sessionStorage.getItem(boxName) == "true" && get_flg == false) load_Storage()

        setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替
    })

    //偶数奇数切替
    $(document).on("click", ".even_odd", function() {
        if($(this).text() == "標準モード"){
            $(this).text("偶数奇数モード")
            even_oddMODE = "ON"
            localStorage.setItem("even_oddMODE", "ON")
            tSort("even_odd")
        }
        else if($(this).text() == "偶数奇数モード"){
            $(this).text("標準モード")
            even_oddMODE = "OFF"
            localStorage.setItem("even_oddMODE", "OFF")
            tSort("default")
        }
    })
    function tSort(mode){
        const ServerID = $(".ServerList").attr("id")

        if(ServerID != ""){
            $(function(){
                $('.ServerList tbody').html(
                    $(".Servers").sort(function(a, b){
                        if(mode == "default") return $(a).find(".ServerID").text() - $(b).find(".ServerID").text();
                        if(mode == "even_odd"){
                            if(ptMODE == "PT4") return $(b).find(".ServerID").text() % 2 -$(a).find(".ServerID").text() % 2;
                        }
                    })
                );
            });
        }
    }

    //[データ復旧]
    function load_Storage(getData){
        let break_flg = false
        let boxName, Storage, fix_blue, fix_red

        //先にサーバ選択させる
        if($(".ServerList").find('.Servers').length <= 1){
            alert("先に調査サーバーを選択してください。");
            break_flg = true
        }

        $(".Servers").each(function(){
            if($(this).find(".nowTime").text() != ""){
                alert("既にデータが復元されています。")
                break_flg = true
            }
        })

        if(break_flg == true) return 0;

        if(getData != null){
            boxName = getData.boxName
            Storage = getData.Storage
            fix_blue = getData.fix_blue
            fix_red = getData.fix_red
        }
        else{
            boxName = $(".ServerList").attr("id")
            Storage = JSON.parse(localStorage.getItem(boxName))
            fix_blue = JSON.parse(localStorage.getItem("fix_blue"))
            fix_red = JSON.parse(localStorage.getItem("fix_red"))
        }
        let n = 0

        if(Storage != null){
            const Point = ["ゲル", "砂漠", "バル"]

            $(".Servers").each(function(){
                const Data = Storage[n]
                const Servers = $(this)
                const Server = Servers.find(".ServerID").text()

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
                        .css("background-color", Data[Server + Point[i]].memoColor)
                        .attr("color", Data[Server + Point[i]].memoColor)

                    $(Servers).find("." + Point[i]).find(".memo2")
                        .val(Data[Server + Point[i]].memo2)

                    if(Data[Server + Point[i]].nowColor == "red"){
                        objBox.find(".btn[value=red]").prop("disabled", true)
                        Timers[Server + Point[i]] = setInterval(setTimer, 1000, objBox)
                    }else{
                        if(Data[Server + Point[i]].memoDate != ""){
                            let diffTime = Data[Server + Point[i]].memoDate - new Date().getTime()
                            if(Data[Server + Point[i]].befColor == "skyblue") Timers[Server + Point[i]] = setTimeout(memoTimer, diffTime, objBox, "skyblue")
                            else Timers[Server + Point[i]] = setTimeout(memoTimer, diffTime, objBox, Data[Server + Point[i]].nowColor)
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


/*メイン画面機能*/
    //←→ボタン移動
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
        save_Sort()
    })
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
    //全更新ボタンクリックイベント
    $(document).on("click", ".btn_all", function(){
        $(this).closest("tr").find(".template2-box").each(function(){
            const Data = {
                Server: $(this).closest("tr").find(".ServerID").text(),
                Point: $(this).closest("td").attr("class"),
                newDate: new Date().getTime(),
                newTime: TimePlus(new Date().getTime(), "00:00:00").Time,
                newColor: "",
                nowDate: $(this).find(".nowTime").attr("Date"),
                nowTime: $(this).find(".nowTime").text(),
                nowColor: $(this).find(".nowTime").attr("color"),
                befDate: $(this).find(".befTime").attr("Date"),
                befTime: $(this).find(".befTime").text(),
                befColor: $(this).find(".befTime").attr("color"),
                memo: $(this).find(".memo").text(),
                memoColor: $(this).find(".memo").attr("color")
            }

            if(
                Data.nowColor != "" &&
                Data.nowColor != "transparent" &&
                Data.nowColor != "red" &&
                !(Data.befColor == "skyblue" && Data.nowColor == "yellow") &&
                !(Data.befColor == "red" && Data.nowColor == "yellow") &&
                !(Data.befColor == "violet" && Data.nowColor == "yellow")
            ){
                Data.newColor = Data.nowColor
                TMP.push({
                    Server: Data.Server,
                    Point: Data.Point,
                    befDate: Data.befDate,
                    befTime: Data.befTime,
                    befColor: Data.befColor,
                    nowDate: Data.nowDate,
                    nowTime: Data.nowTime,
                    nowColor: Data.nowColor,
                    memo: Data.memo,
                    memoColor: $(this).find(".memo").attr("color"),
                    memoDate: $(this).find(".memo").attr("Date")
                })

                if(6 < TMP.length){
                    TMP.shift()
                }
                setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替

                timeStamp($(this), Data)
            }
        })
    })

    //ボタンクリックイベント
    $(document).on("click", ".btn", function(){
        const objBox = $(this).parents(".template2-box");
        const Data = {
            Server: $(this).closest("tr").find(".ServerID").text(),
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
            memo: objBox.find(".memo").text(),
            memoColor: objBox.find(".memo").attr("color")
        }

        TMP.push({
            Server: Data.Server,
            Point: Data.Point,
            befDate: Data.befDate,
            befTime: Data.befTime,
            befColor: Data.befColor,
            nowDate: Data.nowDate,
            nowTime: Data.nowTime,
            nowColor: Data.nowColor,
            memo: Data.memo,
            memoColor: objBox.find(".memo").attr("color"),
            memoDate: objBox.find(".memo").attr("Date")
        })

        if(5 < TMP.length){
            TMP.shift()
        }
        setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替

        timeStamp(objBox, Data)
    })

    //タイムスタンプ設定
    function timeStamp(objBox, Data){
        //赤離脱判定
        if((Data.nowColor == "red" && Data.newColor != "red")
            || (Data.befColor == "red" && Data.nowColor != "red" && Data.flg == true)
            || Data.newTime == ""
            || (objBox.find(".nowTime").attr("Color") == "red" && objBox.find(".nowTime").attr("Color") != Data.nowColor)){
            //ボタン禁止解除・タイマ削除 メモ背景色初期化
            objBox.find(".btn[value=red]").prop("disabled", false)
            objBox.find(".memo")
                .css("background-color", "transparent")
                .attr("color", "transparent")
            clearInterval(Timers[Data.Server + Data.Point])
            clear_one_fix("fix_red", Data.Server + Data.Point)
            clear_one_fix("other_fix_red", Data.Server + Data.Point)
        }

        //現在時間書き込み・背景色変更
        let Time, sendTime, diffDate, memoDate, Text
        switch(Data.newColor){
            case "skyblue":
                //赤青・虹青判定
                if(Data.nowColor == "red" || Data.nowColor == "violet"){

                    /*
                        if(Data.nowColor == "red") sendTime = Data.memo.slice(5)
                        else sendTime = "00:00:00"
                        sendTime = TimePlus(Data.nowDate, sendTime).Date
                        Sender(Data.Server, Data.Point, sendTime, "violet")
                    */

                    Time = TimePlus(Data.newDate, "01:30:00").Time.slice(0, -3)
                    Data.memo = Time + "までに黄変化"
                    Data.memoColor = "transparent"

                    memoDate = TimePlus(Data.newDate, "01:30:00").Date
                    diffDate = memoDate - Data.newDate
                    Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "yellow")
                }

                if(Data.nowColor == "yellow" || Data.befColor == "yellow")
                    clear_one_fix("fix_blue", Data.Server + Data.Point)

                if(
                    (
                        Data.nowColor == "transparent" == "" ||
                        Data.nowColor == "transparent" ||
                        Data.nowColor == "skyblue"
                    ) && Data.befColor == "skyblue"
                )
                    clear_one_fix("fix_blue", Data.Server + Data.Point)

            break
            case "yellow":
                //赤黄・虹黄判定
                if(Data.nowColor == "red" || Data.nowColor == "violet"){

                    /*
                        if(Data.nowColor == "red") sendTime = Data.memo.slice(5)
                        else sendTime = "00:00:00"
                        sendTime = TimePlus(Data.nowDate, sendTime).Date
                        Sender(Data.Server, Data.Point, sendTime, "yellow")
                    */

                    Time = TimePlus(Data.nowDate, "01:30:00").Time.slice(0, -3)
                    Data.memo = Time + "まで変化無し"
                    Data.memoColor = "transparent"

                    memoDate = TimePlus(Data.nowDate, "01:30:00").Date
                    if(Data.nowColor == "red") memoDate = TimePlus(memoDate, objBox.find(".memo").text().slice(-8)).Date
                    diffDate = memoDate - Data.newDate
                    Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "yellow")
                }

                //青黄判定
                if(Data.nowColor == "skyblue"){
                    clear_one_fix("fix_blue", Data.Server + Data.Point)
                    Text = Data.Server + Data.Point + " "
                        + TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3) + " - "
                        + TimePlus(Data.newDate, "03:00:00").Time.slice(0, -3)
                    $(".fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")

                    Time = TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3)
                    Data.memo = Time + "まで変化無し"
                    Data.memoColor = "skyblue"

                    clearTimeout(Timers[Data.Server + Data.Point])
                    memoDate = TimePlus(Data.nowDate, "03:00:00").Date
                    diffDate = memoDate - Data.newDate
                    Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "skyblue")
                }
            break
            case "red":
                objBox.find(".btn[value=red]").prop("disabled", true)
                Data.memo = "経過時間:" + "00:00:00"
                Data.memoColor = "transparent"
                clearTimeout(Timers[Data.Server + Data.Point])
                Timers[Data.Server + Data.Point] = setInterval(setTimer, 1000, objBox)

                //黄赤判定
                if(Data.nowColor == "yellow"){
                    if(Data.befColor == "skyblue"){ //前回青判定
                        if(Data.newDate > TimePlus(Data.befDate, "04:00:00").Date){ //青黄時間より先の時間の場合
                            Text = Data.Server + Data.Point + " "
                                + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                                + TimePlus(Data.nowDate, "04:00:00").Time.slice(0, -3)
                        }else{ //青黄時間より早い時間の場合 '2020/10/18 不要だけど一応残す
                            Text = Data.Server + Data.Point + " "
                                + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                                + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                        }
                    }else { //前回黄色判定
                        if(Data.newDate - Data.nowDate > 3600000){ //前回時間から1時間経過した場合
                            Data.nowDate = ""
                            Data.nowTime = ""
                            Data.nowColor = "transparent"
                            Text = Data.Server + Data.Point + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                        }else{
                            Text = Data.Server + Data.Point + " "
                                + TimePlus(Data.nowDate, "01:00:00").Time.slice(0, -3) + " - "
                                + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                        }
                    }
                }else{
                    //黄赤以外で赤判定
                    Text = Data.Server + Data.Point + " - "
                        + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                }

                $(".fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                    $(".other_fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                    if($(".other_block").is(":hidden")) $(".other_fix_red").find(".fix").hide()
                clear_one_fix("fix_blue", Data.Server + Data.Point)
            break
            case "violet":
                /*
                    if(Data.nowColor != "violet" || Data.befColor != "violet"){
                        Sender(Data.Server, Data.Point, Data.newDate, "violet")
                    }
                */
                clear_one_fix("fix_blue", Data.Server + Data.Point)
            break
        }

        //青もしくは虹継続以外時、前回時間更新
        if(
            Data.befColor == "transparent" ||
            !(Data.newColor == "skyblue" && Data.nowColor == "skyblue" && Data.befColor == "skyblue") &&
            !(Data.newColor == "violet" && Data.nowColor == "violet" && Data.befColor == "violet") &&
            !(Data.newColor == "yellow" && Data.nowColor == "yellow" && Data.befColor == "yellow")
        ){
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
            .css("background-color", Data.memoColor)
            .attr("color", Data.memoColor)

        //【NaL】直近操作セルの強調表示を、直接書換からクラス切替に変更
        //$(".Servers").find("td").css("border", "1px solid rgb(153, 153, 153)")
        //objBox.parents("td").css("border", "2px solid")
        $('.Servers').find('.template2-box').removeClass('sel');
        objBox.addClass('sel');

        save_Storage(true)
    }


/*サイド画面*/
    //[入力の保存]
    function save_Storage(){
        const Point = ["ゲル", "砂漠", "バル"]
        let boxName = $(".ServerList").attr("id")
        let Storage = []
        let fix_blue = []
        let fix_red = []

        $(".Servers").each(function(){
            const Server = $(this).find(".ServerID").text()
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

        if(even_oddMODE == "ON"){
            let copyStorage = Storage.concat()
            for(let cnt=0,i=0, n=5; cnt<Storage.length-1;cnt++){
                if(cnt % 2 == 0){
                    Storage[cnt] = copyStorage[i]
                    i++
                }
                else{
                    Storage[cnt] = copyStorage[n]
                    n++
                }
            }
        }

        $(".fix_blue").find(".fix").each(function(){
            fix_blue.push([$(this).text()])
        })
        $(".fix_red").find(".fix").each(function(){
            fix_red.push([$(this).text()])
        })

        if(boxName == "1 - 10" || boxName == "9 - 10"){
            boxName = "1 - 10"
            sessionStorage.setItem("9 - 10", true)
        }

        sessionStorage.setItem(boxName, true)
        localStorage.setItem(boxName, JSON.stringify(Storage))
        localStorage.setItem("fix_blue", JSON.stringify(fix_blue))
        localStorage.setItem("fix_red", JSON.stringify(fix_red))
    }

    //[直前の状態に戻す]
    function Rollback(){
        if(TMP.length != 0){
            const n = TMP.length - 1

            $(".Servers").each(function(){
                if(TMP[n].Server == $(this).find(".ServerID").text()){
                    const objBox = $(this).find("." + TMP[n].Point).find(".template2-box")
                    const Data = {
                        Server: TMP[n].Server,
                        Point: TMP[n].Point,
                        newDate: TMP[n].nowDate,
                        newTime: TMP[n].nowTime,
                        newColor: TMP[n].nowColor,
                        nowDate: TMP[n].befDate,
                        nowTime: TMP[n].befTime,
                        nowColor: TMP[n].befColor,
                        befDate: objBox.find(".befTime").attr("Date"),
                        befTime: objBox.find(".befTime").text(),
                        befColor: objBox.find(".befTime").attr("color"),
                        memo: TMP[n].memo,
                        memoColor: TMP[n].memoColor,
                        memoDate: TMP[n].memoDate,
                        flg: true
                    }

                    timeStamp(objBox, Data, true)
                    TMP.pop()
                    return false
                }
            })
        }
        setRollbackEnable(); //【NaL】[戻す]ボタンの活性切替
    }


/*青木・確定リスト*/
    //(確定/青木リスト)クリックコピー・削除
    $(document).on("click", ".fix", function() {
        const flg = confirm("コピー/削除を行いますか？\nOK=コピー キャンセル=削除")
        if(flg){
            const CopyText = $(this).text() + "\n"

            const promise = new Promise((resolve, reject) => resolve())
            promise.then(() => navigator.clipboard.writeText(CopyText))
            promise.then(() => copy(CopyText))
        }
        else{
            const flg = confirm("本当に削除していいですか？")
            if(flg){
                $(this).closest("tr").remove()
            }
        }
        save_Fix()
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

    //確定リストの入力チェック
    function checkTime(Time) {
        return Time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
    }

    //確定時間セット
    $(document).on("click", "#sTime, #eTime", function() {
        if($(this).attr("id") == "sTime"){
            if($("#sTime").val() == ""){
                $("#sTime").val(TimePlus(new Date(),"01:00:00").Time.slice(0,-3))
            }
        }else
        if($(this).attr("id") == "eTime"){
            if($("#eTime").val() == ""){
                $("#eTime").val(TimePlus(new Date(),"01:00:00").Time.slice(0,-3))
            }
        }
    })

    //外部確定リスト表示切替
    $(document).on("click", ".other_fix_red_head", function() {
        $(".other_fix_red").find(".fix").toggle()
        $(".other_block").toggle()
    });

    //[外部確定リスト追加]
    function pushFixs(){
        const Fixs = $(".push_fixs").val().split(/\r\n|\r|\n/)
        let fix, Text
        let Data = []

        Fixs.forEach(function(fix){
            if(fix != ""){
                $(".other_fix_red").append('<tr><td class="fix">' + fix + "</td></tr>")
            }
        })

        $(".other_fix_red").find(".fix").each(function(){
            fix = $(this).text().split(" ")
            Data.push(fix)
        })

        $(".other_fix_red tr").slice(1).remove()

        Data.sort(function(a,b){
            return (a[3] > b[3] ? 1 : -1)
        })

        Data.forEach(function(fix){
            Text = fix.join(" ")
            $(".other_fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
        })

        $(".push_fixs").val("")
    }


/*関数群*/

/*初回設定関連*/
    //読込時の場所並び替え
    function sortPoint(){
        let befPoint, afterPoint
        const Sort = JSON.parse(localStorage.getItem("Sort"))
        if(!Sort){ return 0 } //Storage内のSortデータ存在判定

        for(let i=0; i<2; i++){
            const Point = $(".ServerList td").find("div.server-list-hd-text")
            let flg = false //フラグ初期化

            for(let n=1; n<4; n++){
                if($(Point).eq(n).text() + $(Point).eq(n).next().text() !== Sort[n - 1]){
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

    //【NaL】端っこのボタン押せなくするやつ
    function setInitMoveBtn(){
        $("#server-list-hd").find(".left, .right").prop("disabled", false);           //全活性
        $("#server-list-hd").find(".left, .right").first().prop("disabled", true);    //最初のボタンを非活性
        $("#server-list-hd").find(".left, .right").last().prop("disabled", true);     //最後のボタンを非活性
    }

    //【NaL】[戻す]ボタンの活性切替
    function setRollbackEnable(){
        var flg = true
        //TMPの中身がないときだけ非活性
        if ( TMP.length > 0 ){ flg = false; }
        $('#btn-rollback').prop('disabled', flg);
    }


/*メイン機能関連*/
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
        const Server = objBox.closest("tr").find(".ServerID").text()
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
            //Sender(Server, Point, newDate, "violet")
            clearInterval(Timers[Server + Point])
            clear_one_fix("fix_red",Server + Point)
            clear_one_fix("other_fix_red",Server + Point)
            //save_Storage()
        }else{
            objBox.find(".memo").text("経過時間:" + Time)
        }
    }

    function memoTimer(objBox, Color){
        if(Color == "skyblue"){
            const newDate = new Date().getTime()
            const newTime = TimePlus(new Date().getTime(), "00:00:00").Time
            const nowDate = objBox.find(".nowTime").attr("Date")
            const nowTime = objBox.find(".nowTime").text()
            objBox.find(".befTime")
                .attr("Date", nowDate)
                .text(nowTime)
                .css("background-color", "yellow")
                .attr("color", "yellow")
            objBox.find(".nowTime")
                .attr("Date", newDate)
                .text(newTime)
                .css("background-color", "yellow")
                .attr("color", "yellow")
            objBox.find(".memo")
                .css("background-color", Color)
                .attr("color", Color)
        }else{
            objBox.find(".memo")
                .text("")
                .css("background-color", "transparent")
                .attr("color", "transparent")
        }
    }


/*保存・削除関連*/
    //[調査場所の並びを保存]
    function save_Sort(){
        const Sort = [
            $(".ServerList td").eq(1).find(".server-list-hd-text").text(),
            $(".ServerList td").eq(2).find(".server-list-hd-text").text(),
            $(".ServerList td").eq(3).find(".server-list-hd-text").text()
        ]
        localStorage.setItem("Sort", JSON.stringify(Sort))
    }

    //[調査場所の並びをリセット]
    function clear_Sort(){
        const Sort = ["ゲルヘナ幻野", "ジャリムバハ砂漠", "バルディスタ要塞"]
        localStorage.setItem("Sort", JSON.stringify(Sort))
        sortPoint()
}

    //入力情報のクリア
    function Cleaner(target){
        const flg = confirm("ブラウザ上の入力情報と保存情報がクリアされます。よろしいですか？")

        if(flg){
            if(target.value == "all"){
                clear_input()
                clear_fix()
                localStorage.setItem("1 - 10", "")
                localStorage.setItem("11 - 20", "")
                localStorage.setItem("21 - 30", "")
                localStorage.setItem("31 - 40", "")
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
            else if(target.value == "other_fix_red"){
                clear_fix("other_fix_red")
            }
            else if(target.value == "sort"){
                clear_Sort()
            }

            save_Storage()
            save_Fix()
        }
    }

    //チェックリストのクリア
    function clear_input(){
        //$(".Servers").find("td").css("border", "1px solid rgb(153, 153, 153)")
        $('.Servers').find('.template2-box').removeClass('sel');

        $(".Servers").each(function(){
            const Server = Number($(this).find(".ServerID").text())
            const Point = ["ゲル", "砂漠", "バル"]

            if($(this).is(":visible")){
                $(this).find(".nowTime").each(function(){
                    $(this)
                        .attr("Date", "")
                        .text("")
                        .css("background-color", "transparent")
                        .attr("color", "transparent")
                })

                $(this).find(".befTime").each(function(){
                    $(this)
                        .attr("Date", "")
                        .text("")
                        .css("background-color", "transparent")
                        .attr("color", "transparent")
                })

                $(this).find(".memo").each(function(){
                    $(this)
                            .attr("Date", "")
                            .text("")
                            .css("background-color", "transparent")
                            .attr("color", "transparent")
                })

                $(this).find(".memo2").each(function(){
                    $(this).val("")
                })

                $(this).find(".btn[value=red]").each(function(){
                    $(this).prop("disabled", false)
                })

                Point.forEach(function(Text){
                    clear_one_fix("fix_blue", Server + Text)
                    clear_one_fix("fix_red", Server + Text)
                })
                //タイマー等初期化
                clearInterval(Timers[Server + "ゲル"])
                clearInterval(Timers[Server + "砂漠"])
                clearInterval(Timers[Server + "バル"])
                TMP = []
            }
        })
        setRollbackEnable(); //【NaL】[戻す]ボタンの活性切替
    }

    //[(確定/青木リスト)コピー]
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
        else if(fix.value == "other_fix_red"){
            $(".other_fix_red").find(".fix").each(function(){
                CopyText += $(this).text() + "\n"
            })
        }

        const promise = new Promise((resolve, reject) => resolve())
        promise.then(() => navigator.clipboard.writeText(CopyText))
        promise.then(() => copy(CopyText))
    }

    //[(確定/青木リスト)クリア]
    function clear_fix(fix){
        if(fix == "fix_blue"){
            $(".fix_blue tr").slice(1).remove()
        }
        else if(fix == "fix_red"){
            $(".fix_red tr").slice(1).remove()
        }
        else if(fix == "other_fix_red"){
            $(".other_fix_red tr").slice(1).remove()
            $(".push_fixs").val("")
        }
        else{
            $(".fix_blue tr").slice(1).remove()
            $(".fix_red tr").slice(1).remove()
            $(".other_fix_red tr").slice(1).remove()
            $(".push_fixs").val("")
        }
    }

    //(確定/青黄リスト)保存
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

    //(確定/青黄リスト)選択クリア
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
        else if(fix == "other_fix_red"){
            $(".other_fix_red").find(".fix").each(function(){
                fix = $(this).text().split(" ")
                if(fix[0] == Text){
                        $(this).parent().remove()
                }
            })
        }
    }

    //コピー機能
    function copy(str) {
        if(!str || typeof(str) != "string") return "";

        //strを含んだtextareaをbodyタグの末尾に設置
        $(document.body).append("<textarea id=\"tmp_copy\" style=\"position:fixed;right:100vw;font-size:16px;\">" + str + "</textarea>");

        let target = document.querySelector('#tmp_copy');
        target.contentEditable  = true;
        target.readOnly = false;
        let range = document.createRange();
        range.selectNode(target);
        window.getSelection().addRange(range);
        document.execCommand("copy");

        target.remove()
    }

/*封印*/
//虹黄情報送信機能
/*
    //【NaL】情報提供モード切替
    function setSendFlg(p_flg){
        sendFlg = p_flg;
    }
*/

/*
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
*/
