/*初回設定関連*/
//読込時の場所並び替え
function sortPoint() {
    const Sort = JSON.parse(localStorage.getItem("Sort"));
    let befPoint, afterPoint;

    if (!Sort) return 0;
    for (let i = 0; i < 2; i++) {
        const Point = $(".ServerList td").find("div.server-list-hd-text");
        let flg = false; //フラグ初期化

        for (let n = 1; n < 4; n++) {
            if ($(Point).eq(n).text() + $(Point).eq(n).next().text() !== Sort[n - 1]) {
                if (flg == false) {
                    befPoint = $(Point).eq(n).closest("td");
                    flg = true;
                }
                else if (flg == true) afterPoint = $(Point).eq(n).closest("td");
            }
        }

        if (flg == true) movePoint(afterPoint, befPoint); //右移動
    }
}

//【NaL】端っこのボタン押せなくするやつ
function setInitMoveBtn() {
    $("#server-list-hd").find(".left, .right").prop("disabled", false);           //全活性
    $("#server-list-hd").find(".left, .right").first().prop("disabled", true);    //最初のボタンを非活性
    $("#server-list-hd").find(".left, .right").last().prop("disabled", true);     //最後のボタンを非活性
}

//【NaL】[戻す]ボタンの活性切替
function setRollbackEnable() {
    let flg = true

    if (TMP.length > 0) flg = false; //TMPの中身がないときだけ非活性
    $('#btn-rollback').prop('disabled', flg);
}

//URLパラメータ抽出
function getURLData(params) {
    try { params = inflate(params) } //URLの復号化
    catch {
        $(".message").text("ERROR:不正なURLです").show();
        return 0;
    }

    ptMODE = getParam("ptMODE", params);
    const
        btnText = getParam("btnText", params),
        getData = {
            boxName: getParam("boxName", params),
            objKeys: JSON.parse(getParam("objKeys", params)),
            Storage: JSON.parse(getParam("Storage", params)),
            fix_blue: JSON.parse(getParam("fix_blue", params)),
            fix_red: JSON.parse(getParam("fix_red", params)),
        };

    //パラメータチェック
    if (
        !ptMODE || !btnText || !getData.boxName ||
        !getData.objKeys || !getData.Storage ||
        !getData.fix_blue || !getData.fix_red
    ) {
        $(".message").text("ERROR:不正なURLです").show();
        return 0;
    }
    if (ptMODE == "PT8") {
        $('.setting-box .mode-change-box input[value="PT8"]').prop('checked', true);
        modeChange();
    }

    $(".setServers").each(function () {
        if ($(this).text() == btnText) {
            get_flg = true;
            $(this).click();    //調査鯖ボタンクリック
        }
    })

    for (let key1 in getData.Storage) {
        for (let key2 in getData.Storage[key1]) {
            getData.objKeys.forEach((key3, i) => {
                getData.Storage[key1][key2][key3] = getData.Storage[key1][key2][i]
                delete getData.Storage[key1][key2][i]
            })
        }
    }

    load_Storage(getData);
}

//パラメータ値抽出
function getParam(param, params) {
    param = param.replace(/[\[\]]/g, "\\$&");
    const
        regex = new RegExp(param + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(params);

    if (!results || !results[2]) return 0;
    return results[2].replace(/\+/g, " ");
}


/*ヘッダ部関係*/
//偶数・奇数入替処理
function tSort(mode) {
    const ServerID = $(".ServerList").attr("id");

    if (ServerID) {
        $(function () {
            $('.ServerList tbody').html(
                $(".Servers").sort(function (a, b) {
                    if (mode == "default") {
                        a = $(a).find(".ServerID").text();
                        b = $(b).find(".ServerID").text();
                        return a - b;
                    }
                    if (mode == "even_odd") {
                        if (ptMODE == "PT4") {
                            a = $(a).find(".ServerID").text() % 2;
                            b = $(b).find(".ServerID").text() % 2;
                            return b - a;
                        }
                    }
                })
            );
        });
    }
}

/*メイン機能関係*/
//ポイント移動処理
//***************************見直し対象
function movePoint(befPoint, afterPoint) {
    //template内移動処理用変数
    const
        befClass = "." + $(befPoint).attr("class"),
        afterClass = "." + $(afterPoint).attr("class"),
        tmp1 = document.getElementById("template1").content,
        tmp1_befPoint = tmp1.querySelectorAll(".Servers >" + befClass),
        tmp1_afterPoint = tmp1.querySelectorAll(".Servers >" + afterClass),
        Servers = tmp1.querySelectorAll(".Servers");

    Servers[0].insertBefore(tmp1_befPoint[0], tmp1_afterPoint[0]);
    befPoint.insertBefore(afterPoint);
    for (let i = 0; i < 10; i++) {
        $(".Servers").find(befClass).eq(i)
            .insertBefore($(".Servers").find(afterClass).eq(i));
    }

    setInitMoveBtn();
}

//タイムスタンプ設定
//***************************見直し待機
function timeStamp(objBox, Data) {
    //赤離脱判定
    if (
        (Data.nowColor == "red" && Data.newColor != "red") || (
            Data.befColor == "red" &&
            Data.nowColor != "red" &&
            Data.flg == true
        ) || Data.newTime == "" || (
            objBox.find(".nowTime").attr("Color") == "red" &&
            objBox.find(".nowTime").attr("Color") != Data.nowColor
        )
    ) {
        //ボタン禁止解除・タイマ削除 メモ背景色初期化
        objBox.find(".btn[value=red]").prop("disabled", false);
        objBox.find(".memo")
            .css("background-color", "transparent")
            .attr("color", "transparent");
        clearInterval(Timers[Data.Server + Data.Point]);
        clear_fix("fix_red", Data.Server + Data.Point);
    }

    //現在時間書き込み・背景色変更
    let Time, sendTime, diffDate, memoDate, Text;
    switch (Data.newColor) {
        case "skyblue":
            //赤→青・虹→青判定
            if (Data.nowColor == "red" || Data.nowColor == "violet") {
                /*
                    if(Data.nowColor == "red") sendTime = Data.memo.slice(5)
                    else sendTime = "00:00:00"
                    sendTime = TimePlus(Data.nowDate, sendTime).Date
                    Sender(Data.Server, Data.Point, sendTime, "violet")
                */

                Time = TimePlus(Data.newDate, "01:30:00").Time.slice(0, -3);
                Data.memo = Time + "までに黄変化";
                Data.memoColor = "transparent";

                memoDate = TimePlus(Data.newDate, "01:30:00").Date;
                diffDate = memoDate - Data.newDate;
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "yellow");
            }

            //黄→青・戻り判定
            if (
                (
                    Data.nowColor == "yellow" ||
                    Data.befColor == "yellow"
                ) || (
                    (
                        Data.nowColor == "" ||
                        Data.nowColor == "transparent" ||
                        Data.nowColor == "skyblue"
                    ) && Data.befColor == "skyblue"
                )
            )
                clear_fix("fix_blue", Data.Server + Data.Point);

            break;
        case "yellow":
            //赤→黄・虹→黄判定
            if (Data.nowColor == "red" || Data.nowColor == "violet") {
                /*
                    if(Data.nowColor == "red") sendTime = Data.memo.slice(5)
                    else sendTime = "00:00:00"
                    sendTime = TimePlus(Data.nowDate, sendTime).Date
                    Sender(Data.Server, Data.Point, sendTime, "yellow")
                */

                Time = TimePlus(Data.nowDate, "01:30:00").Time.slice(0, -3);
                Data.memo = Time + "まで変化無し";
                Data.memoColor = "transparent";

                memoDate = TimePlus(Data.nowDate, "01:30:00").Date;
                if (Data.nowColor == "red")
                    memoDate = TimePlus(memoDate, objBox.find(".memo").text().slice(-8)).Date;
                diffDate = memoDate - Data.newDate;
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "yellow");
            }

            //青→黄判定
            if (Data.nowColor == "skyblue") {
                clear_fix("fix_blue", Data.Server + Data.Point);
                Text = Data.Server + Data.Point + " "
                    + TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3) + " - "
                    + TimePlus(Data.newDate, "03:00:00").Time.slice(0, -3);

                push_fix("fix_blue", Text, "all");

                Time = TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3);
                Data.memo = Time + "まで変化無し";
                Data.memoColor = "skyblue";

                clearTimeout(Timers[Data.Server + Data.Point]);
                memoDate = TimePlus(Data.nowDate, "03:00:00").Date;
                diffDate = memoDate - Data.newDate;
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "skyblue");
            }

            break;
        case "red":
            objBox.find(".btn[value=red]").prop("disabled", true);
            Data.memo = "経過時間:" + "00:00:00";
            Data.memoColor = "transparent";
            clearTimeout(Timers[Data.Server + Data.Point]);
            Timers[Data.Server + Data.Point] = setInterval(setTimer, 1000, objBox);

            //黄→赤判定
            if (Data.nowColor == "yellow") {
                if (Data.befColor == "skyblue") { //前回青判定
                    if (Data.newDate > TimePlus(Data.befDate, "04:00:00").Date) { //青黄時間より先の時間の場合
                        Text = Data.Server + Data.Point + " "
                            + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                            + TimePlus(Data.nowDate, "04:00:00").Time.slice(0, -3);
                    } else { //青黄時間より早い時間の場合 '2020/10/18 不要だけど一応残す
                        Text = Data.Server + Data.Point + " "
                            + TimePlus(Data.befDate, "04:00:00").Time.slice(0, -3) + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3);
                    }
                } else { //前回黄色判定
                    if (Data.newDate - Data.nowDate > 3600000) { //前回時間から1時間経過した場合
                        Data.nowDate = "";
                        Data.nowTime = "";
                        Data.nowColor = "transparent";
                        Text = Data.Server + Data.Point + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3);
                    } else {
                        Text = Data.Server + Data.Point + " "
                            + TimePlus(Data.nowDate, "01:00:00").Time.slice(0, -3) + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3);
                    }
                }
            } else {
                //黄→赤以外
                Text = Data.Server + Data.Point + " - "
                    + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3);
            }

            push_fix("fix_red", Text, "all");
            clear_fix("fix_blue", Data.Server + Data.Point);

            break;
        case "violet":
            /*
                if(Data.nowColor != "violet" || Data.befColor != "violet"){
                    Sender(Data.Server, Data.Point, Data.newDate, "violet")
                }
            */

            clear_fix("fix_blue", Data.Server + Data.Point);

            break;
    }

    //青もしくは虹継続以外時、前回時間更新
    if (
        Data.befColor == "transparent" ||
        !(
            Data.newColor == "skyblue" &&
            Data.nowColor == "skyblue" &&
            Data.befColor == "skyblue"
        ) && !(
            Data.newColor == "yellow" &&
            Data.nowColor == "yellow" &&
            Data.befColor == "yellow"
        ) && !(
            Data.newColor == "violet" &&
            Data.nowColor == "violet" &&
            Data.befColor == "violet"
        )
    ) {
        objBox.find(".befTime")
            .attr("Date", Data.nowDate)
            .text(Data.nowTime)
            .css("background-color", Data.nowColor)
            .attr("color", Data.nowColor);
    }

    objBox.find(".nowTime")
        .attr("Date", Data.newDate)
        .text(Data.newTime)
        .css("background-color", Data.newColor)
        .attr("color", Data.newColor);

    objBox.find(".memo")
        .attr("Date", memoDate)
        .text(Data.memo)
        .css("background-color", Data.memoColor)
        .attr("color", Data.memoColor);

    //【NaL】直近操作セルの強調表示を、直接書換からクラス切替に変更
    //$(".Servers").find("td").css("border", "1px solid rgb(153, 153, 153)")
    //objBox.parents("td").css("border", "2px solid")
    $('.Servers').find('.template2-box').removeClass('sel');
    objBox.addClass('sel');

    save_Storage(true);
}

//時間計算
function TimePlus(Time, sumTime) {
    Time = new Date(Number(Time));
    sumTime = sumTime.split(":");
    Time.setHours(Time.getHours() + Number(sumTime[0]));
    Time.setMinutes(Time.getMinutes() + Number(sumTime[1]));
    Time.setSeconds(Time.getSeconds() + Number(sumTime[2]));

    return {
        Date: Time.getTime(),
        Time: ("0" + Time.getHours()).slice(-2) + ":"
            + ("0" + Time.getMinutes()).slice(-2) + ":"
            + ("0" + Time.getSeconds()).slice(-2),
    }
}

//タイマ設置
function setTimer(objBox) {
    const
        Server = objBox.closest("tr").find(".ServerID").text(),
        Point = objBox.closest("td").attr("class"),
        newDate = new Date().getTime(),
        nowDate = objBox.find(".nowTime").attr("Date"),
        nowTime = objBox.find(".nowTime").text(),
        diffTime = newDate - nowDate,
        Hour = diffTime / (1000 * 60 * 60),
        Minute = (Hour - Math.floor(Hour)) * 60,
        Second = (Minute - Math.floor(Minute)) * 60,
        Time = ('00' + Math.floor(Hour)).slice(-2) + ':'
            + ('00' + Math.floor(Minute)).slice(-2) + ':'
            + ('00' + Math.round(Second)).slice(-2);

    if (
        Time == "00:50:00" ||
        ((1000 * 60 * 50) <= diffTime) &&
        (1000 * 60 * 60) > diffTime
    ) {
        objBox.find(".memo")
            .text("経過時間:" + Time)
            .css("background-color", "violet")
            .attr("color", "violet");
    }
    else if ((1000 * 60 * 60) <= diffTime) {
        objBox.find(".befTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", "red")
            .attr("color", "red");

        objBox.find(".nowTime")
            .attr("Date", TimePlus(nowDate, "01:00:00").Date)
            .text(TimePlus(nowDate, "01:00:00").Time)
            .css("background-color", "violet")
            .attr("color", "violet");

        objBox.find(".memo")
            .text("経過時間:01:00:00")
            .css("background-color", "transparent")
            .attr("color", "transparent");

        objBox.find(".btn[value=red]").prop("disabled", false);
        //Sender(Server, Point, newDate, "violet")
        clearInterval(Timers[Server + Point]);
        clear_fix("fix_red", Server + Point);
        //save_Storage()
    }
    else objBox.find(".memo").text("経過時間:" + Time);
}

//メモ1更新タイマ
function memoTimer(objBox, Color) {
    if (Color == "skyblue") {
        const
            newDate = new Date().getTime(),
            newTime = TimePlus(new Date().getTime(), "00:00:00").Time,
            nowDate = objBox.find(".nowTime").attr("Date"),
            nowTime = objBox.find(".nowTime").text();

        objBox.find(".befTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", "yellow")
            .attr("color", "yellow");
        objBox.find(".nowTime")
            .attr("Date", newDate)
            .text(newTime)
            .css("background-color", "yellow")
            .attr("color", "yellow");
        objBox.find(".memo")
            .css("background-color", Color)
            .attr("color", Color);
    }
    else {
        objBox.find(".memo")
            .text("")
            .css("background-color", "transparent")
            .attr("color", "transparent");
    }
}


/*サイドバー関連*/
//入力チェック
function checkTime(Time) {
    return Time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
}

//(確定/青木リスト)挿入
function push_fix(fix, Text, flg) {
    if (flg == "fix" || flg == "all")
        $("." + fix).append('<tr><td class="fix">' + Text + '</td></tr>');
    if (flg == "other" || flg == "all") {
        $(".other_" + fix).append('<tr><td class="fix">' + Text + "</td></tr>");
        if ($(".other_block_" + fix).is(":hidden")) $(".other_" + fix).find(".fix").hide();

        if (fix.indexOf("other") != -1) fix.replace("other_", "")
        if (share_flg) updateList("ADD", fix, Text);
    }
}


/*保存・削除関連*/
//[調査場所の並びを保存]
function save_Sort() {
    const Sort = [
        $(".ServerList td").eq(1).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(2).find(".server-list-hd-text").text(),
        $(".ServerList td").eq(3).find(".server-list-hd-text").text(),
    ]

    localStorage.setItem("Sort", JSON.stringify(Sort));
}

//[調査場所の並びをリセット]
function clear_Sort() {
    const Sort = ["ゲルヘナ幻野", "ジャリムバハ砂漠", "バルディスタ要塞"];

    localStorage.setItem("Sort", JSON.stringify(Sort));
    sortPoint();
}

//入力情報のクリア
function Cleaner(target) {
    const flg = confirm("ブラウザ上の入力情報と保存情報がクリアされます。よろしいですか？");

    if (flg) {
        if (target == "all") {
            clear_input()
            clear_fixs()
            localStorage.setItem("1 - 10", "")
            localStorage.setItem("11 - 20", "")
            localStorage.setItem("21 - 30", "")
            localStorage.setItem("31 - 40", "")
        }
        else if (target == "input") clear_input()
        else if (target == "sort") clear_Sort()
        else clear_fixs(target)

        save_Storage()
        save_Fix()
    }
}

//チェックリストのクリア
function clear_input() {
    $('.Servers').find('.template2-box').removeClass('sel');
    clearInterval(Timers.updateTime);
    TMP = [];
    share_flg = false;

    $(".Servers").each(function () {
        const
            Server = Number($(this).find(".ServerID").text()),
            Points = ["ゲル", "砂漠", "バル"];

        if ($(this).is(":visible")) {
            $(this).find(".btn[value=red]").each(function () {
                $(this).prop("disabled", false);
            });

            $(this).find("p").each(function () {
                if ($(this).attr("class") != "time-title") {
                    $(this)
                        .attr("Date", "")
                        .text("")
                        .css("background-color", "transparent")
                        .attr("color", "transparent");
                }
            });

            $(this).find(".memo2").each(function () {
                $(this).val("");
            });

            Points.forEach(function (Point) {
                clear_fix("fix_blue", Server + Point);
                clear_fix("fix_red", Server + Point);
                clearInterval(Timers[Server + Point]);  //タイマ初期化
            })
        }
    })
    setRollbackEnable(); //【NaL】[戻す]ボタンの活性切替
}

//[(確定/青木リスト)コピー]
function setClip(fix) {
    let Text = "";

    $("." + fix).find(".fix").each(function () {
        Text += $(this).text() + "\n";
    });

    TextCopy(Text);
}

//[(確定/青木リスト)クリア]
function clear_fixs(fix) {
    if (fix) $("." + fix + " tr").slice(1).remove();
    else {
        $(".fix_blue tr").slice(1).remove();
        $(".fix_red tr").slice(1).remove();
        $(".other_fix_blue tr").slice(1).remove();
        $(".other_fix_red tr").slice(1).remove();
        $("textarea").val("");
    }
}

//(確定/青黄リスト)選択クリア
function clear_fix(fix, Text) {
    $("." + fix).find(".fix").each(function () {
        let obj = $(this).text().split(" ");
        if (obj[0] == Text) $(this).closest("tr").remove();
    })
    $(".other_" + fix).find(".fix").each(function () {
        let obj = $(this).text().split(" ");
        if (obj[0] == Text) {
            $(this).closest("tr").remove();
            if (share_flg) updateList("DEL", fix, Text);
        }
    })
}

//(確定/青黄リスト)保存
function save_Fix() {
    let
        fix_blue = [],
        fix_red = [];

    $(".fix_blue").find(".fix").each(function () {
        fix_blue.push([$(this).text()]);
    })
    $(".fix_red").find(".fix").each(function () {
        fix_red.push([$(this).text()]);
    })

    localStorage.setItem("fix_blue", JSON.stringify(fix_blue));
    localStorage.setItem("fix_red", JSON.stringify(fix_red));
}


/*汎用関数*/
//ajax通信
function xhrSend(params, resFunc) {
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbwCz56sXENejr9tHKjg8eoG8PdiBcN4HHo7FKf6JetXj3smgBVDR68K/exec",
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

//圧縮
function deflate(val) {
    val = encodeURIComponent(val); // UTF16 → UTF8
    val = RawDeflate.deflate(val); // 圧縮
    val = btoa(val); // base64エンコード
    return val;
}

//復号
function inflate(val) {
    val = atob(val); // base64デコード
    val = RawDeflate.inflate(val); // 復号
    val = decodeURIComponent(val); // UTF8 → UTF16
    return val;
}

//コピー処理
function TextCopy(Text) {
    const promise = new Promise((resolve, reject) => resolve());

    promise.then(() => navigator.clipboard.writeText(Text));
    promise.then(function (str) {
        if (!str || typeof (str) != "string") return "";

        //strを含んだtextareaをbodyタグの末尾に設置
        $(document.body).append("<textarea id=\"tmp_copy\" style=\"position:fixed;right:100vw;font-size:16px;\">" + str + "</textarea>");

        let target = document.querySelector('#tmp_copy');
        target.contentEditable = true;
        target.readOnly = false;
        let range = document.createRange();
        range.selectNode(target);
        window.getSelection().addRange(range);
        document.execCommand("copy");

        target.remove();
    })

    alert("コピーしました");
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