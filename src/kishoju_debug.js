//定数
const version = "1.4";  //バージョン管理変数

//グローバル変数
var
    settings = {},          //オプション設定フラグ
    get_flg = false,        //URL取得モードフラグ
    share_flg = false,      //データ共有フラグ
    share_ID = "",          //データ共有用パス
    ver_flg = false,        //バージョンチェックフラグ(初回のみ)
    ptMODE = "",            //PTモード変数
    TMP = [],               //履歴変数
    Timers = {},            //タイマーリスト変数
    side_mode = "default",  //サイドリストモード変数
    check_flg = false;      //タイマーチェックフラグ

//テスト用関数
function debug() {
    alert("テスト中");
}

//クラスの実験中
class Cells {
    constructor(objBox, newColor) {
        this.objBox = objBox;

        this.TMP = {
            Server: objBox.closest("tr").find(".ServerID").text(),
            Point: objBox.closest("td").attr("class"),
            nowDate: objBox.find(".nowTime").attr("Date"),
            nowTime: objBox.find(".nowTime").text(),
            nowColor: objBox.find(".nowTime").attr("color"),
            befDate: objBox.find(".befTime").attr("Date"),
            befTime: objBox.find(".befTime").text(),
            befColor: objBox.find(".befTime").attr("color"),
            memoDate: objBox.find(".memo").attr("Date"),
            memo: objBox.find(".memo").text(),
            memoColor: objBox.find(".memo").attr("color"),
            memoflg: objBox.find(".memo").attr("memoflg"),
            memofix: objBox.find(".memo").attr("memofix"),
        }

        this.Data = Object.assign({}, this.TMP);    //配列コピー
        this.Data.newDate = new Date().getTime();
        this.Data.newTime = TimePlus(new Date().getTime(), "00:00:00").Time;
        this.Data.newColor = newColor;
    }

    Data() { return this.Data; }
    TMP() { return this.TMP; }

    setTimeStamp(obj, Date, Time, Color) {
        obj = this.objBox.find("." + obj)[0]
        obj.setAttribute("Date", this.Data[Date]);
        obj.textContent = this.Data[Time];
        obj.style.background = this.Data[Color];
        obj.setAttribute("color", this.Data[Color]);
    }
}

//初回読込時設定
alert("テスト中です");
try {
    window.onload = function () {
        $(".message").text("テスト中。。。").show();
        $(".slider-title").click();
        modeChange();           //4PT/8PT切替(デフォルト4PT)
        setInitMoveBtn();       //【NaL】調査マップ入替ボタンの活性切替
        setRollbackEnable();    //【NaL】[戻す]ボタンの活性切替
        load_settings();
        setObServer();

        //if (location.search.substring(1)) getURLData(location.search.substring(1));
        //else sortPoint();
    }
}
catch (e) { $(".message").text("Error:" + e.stack).show(); }

/********************ヘッダ部機能(リンク)********************/
//[共有表を作成]
function addShare() {
    const flg = confirm("青黄・確定の共有表を作成しますか？");
    if (flg) {
        const List = $(".other_fix_blue tr, .other_fix_red tr");
        if (List.length > 2) {
            $(".other_fix_blue").find(".fix").show();
            $(".other_block_fix_blue").show();
            $(".other_fix_red").find(".fix").show();
            $(".other_block_fix_red").show();

            const flg2 = confirm(
                "外部青黄・確定リストに既に内容が存在しています"
                + "\n 上書きしますか？"
            );
            if (!flg2) return 0;
        }

        const params = {
            mode: "addShare",
        };

        $(".message").text("共有表を作成中...").show();
        xhrSend(params, (res) => {
            if (res) {
                if (res.err && res.err == "retry") {
                    alert(
                        "サーバー側で処理がタイムアウトしました" + "\n"
                        + "もう一度実行してください"
                    )
                    return 0;
                }
                else if (res.err) {
                    alert(res.err);
                    $(".message").text("Error:" + res.err);
                    return 0;
                }

                share_flg = true;
                share_ID = res.share_ID;

                $(".message").hide();
                $(".connectArea").show();
                $(".disconnect").show();
                $(".copyText").val(share_ID);
                $(".copyArea").show();
                $(".other_fix_blue").find(".fix").show();
                $(".other_block_fix_blue").show();
                $(".other_fix_red").find(".fix").show();
                $(".other_block_fix_red").show();

                updateList("GET");
                clearInterval(Timers.updateTime);
                Timers.updateTime = setInterval(updateList, 180000, "GET");
            }
        })
    }
}

//[共通表に参加]
function connectShare() {
    share_ID = window.prompt("パスワードを入力してください", share_ID);
    if (share_ID) {
        if (share_ID.indexOf(" ") != -1) {
            alert("パスワードに空白が含まれています");
            return 0;
        }

        const List = $(".other_fix_blue tr, .other_fix_red tr");
        if (List.length > 2) {
            $(".other_fix_blue").find(".fix").show();
            $(".other_block_fix_blue").show();
            $(".other_fix_red").find(".fix").show();
            $(".other_block_fix_red").show();

            const flg2 = confirm(
                "外部青黄・確定リストに既に内容が存在しています"
                + "\n 上書きしますか？"
            );
            if (!flg2) return 0;
        }

        const params = {
            mode: "connectShare",
            share_ID: share_ID,
        };

        $(".message").text("共有表にアクセス中...").show();
        xhrSend(params, (res) => {
            if (res) {
                if (res.err && res.err == "retry") {
                    alert(
                        "サーバー側で処理がタイムアウトしました" + "\n"
                        + "もう一度実行してください"
                    )
                    return 0;
                }
                else if (res.err) {
                    alert(res.err);
                    $(".message").text("Error:" + res.err);
                    return 0;
                }

                share_flg = true;
                share_ID = res.share_ID;

                $(".message").html("接続に成功しました<br />リストからデータを取得しています....");
                $(".connectArea").show();
                $(".disconnect").show();
                $(".other_fix_blue").find(".fix").show();
                $(".other_block_fix_blue").show();
                $(".other_fix_red").find(".fix").show();
                $(".other_block_fix_red").show();

                updateList("GET");
                clearInterval(Timers.updateTime);
                Timers.updateTime = setInterval(updateList, 180000, "GET");
            }
        })
    }
}

function updateList(mode, fix, Text) {
    if (share_flg) {
        const params = {
            mode: mode,
            share_ID: share_ID,
            fix: fix,
            Text: Text,
        };

        xhrSend(params, (res) => {
            if (res) {
                if (res.ver == "古いバージョンです") {
                    if (!ver_flg) {
                        alert(
                            res.ver
                            + "\n (注)未修正の不具合がある可能性があります"
                            + "\n 最新のページに更新することを推奨します"
                        );
                        ver_flg = true;
                    }
                }

                if (res.err) {
                    if (res.err == "共有表が存在しません") {
                        clearInterval(Timers.updateTime);

                        alert(res.err + "\n 接続を切断しました");
                        $(".message").html(
                            "Error:" + res.err + "<br />" +
                            "接続を切断しました"
                        ).show();
                        $(".connectArea").hide();
                        $(".disconnect").hide();

                        return 0;
                    }
                    else if (res.err == "retry") {
                        setTimeout(updateList, 5000, mode, fix, Text);
                        //updateList(mode, fix, Text);    //再試行
                        return 0;
                    }
                    else if (res.err == "メンテナンス中") {
                        alert("メンテナンス中です");
                        clearInterval(Timers.updateTime);
                        return 0;
                    }
                    else {
                        const flg = confirm(
                            "不明なエラーです！"
                            + "\n " + res.err
                            + "\n 再試行しますか？"
                        );

                        if (flg) {
                            updateList(mode, fix, Text);
                            return 0;
                        }
                        else return 0;
                    }
                }

                $(".message").hide();
                $(".connectCount").text(res.connectCount);

                const
                    fix_blue = res.fix_blue.split(","),
                    fix_red = res.fix_red.split(",");

                $(".other_fix_blue tr").slice(1).remove();
                $(".other_fix_red tr").slice(1).remove();

                fix_blue.forEach(Text => {
                    Text = Text.split("#");
                    $(".other_fix_blue").append('<tr><td class="fix">' + Text[0] + "</td></tr>");
                })
                fix_red.forEach(Text => {
                    Text = Text.split("#");
                    $(".other_fix_red").append('<tr><td class="fix">' + Text[0] + "</td></tr>");
                })
            }
        })
    }
}

function disconnect() {
    if (share_flg) {
        const params = {
            mode: "disconnect",
            share_ID: share_ID,
        };

        $(".message").text("共有表から切断中...").show();
        xhrSend(params, (res) => {
            if (res) {
                share_ID = "";

                clearInterval(Timers.updateTime);
                $(".message").text("接続を切断しました");
                $(".connectArea").hide();
                $(".disconnect").hide();
            }
        })
    }
}

//[関係者向け]#廃止予定
function LoginCheck() {
    const pass = window.prompt("パスワードを入力してください")
    if (pass) {
        const params = {
            mode: "login",
            pass: pass,
        };

        xhrSend(params, (res) => {
            if (res.err) {
                alert(res.err);
                $(".message").text("Error:" + res.err).show();
                return 0;
            }

            if (res.HTMLData) {
                const script = document.createElement('script');
                script.src = res.ScriptData;
                $("head").append(script);
                $("body").prepend(res.HTMLData);
            }
            else alert("パスワードが違います");
        })
    }
}

//[調査鯖おみくじ]
function omikuji() {
    const
        omikuji = ["1-10", "11-20", "21-30", "31-40"],
        Text = $(".omikuji").text();
    let rnd;
    for (; ;) {
        rnd = Math.floor(Math.random() * omikuji.length);
        if ("サーバー" + omikuji[rnd] !== Text) break;
    }
    $(".omikuji").text("サーバー" + omikuji[rnd]);
}

//[調査データをURL化]
function getShortURL() {
    alert("メンテナンス中です。。。");
    return 0;

    if ($(".ServerList").find('.Servers').length < 1) {
        alert("先に調査サーバーを選択してください。");
        return 0;
    }
    if (ptMODE == "PTselect") {
        alert("調査サーバー選択が選択モードの時は使用できません。")
        return 0;
    }

    const
        boxName = $(".ServerList").attr("id"),
        fix_blue = localStorage.getItem("fix_blue"),
        fix_red = localStorage.getItem("fix_red"),
        btnText =
            $(".ServerID:visible").first().text() + " - "
            + $(".ServerID:visible").last().text();
    let
        Storage = JSON.parse(localStorage.getItem(boxName)),
        objKeys;

    for (let key1 in Storage) {
        for (let key2 in Storage[key1]) {
            objKeys = Object.keys(Storage[key1][key2]);
            Storage[key1][key2] = Object.values(Storage[key1][key2]);
        }
    }

    const params = {
        mode: "shortURL",
        params: deflate(
            "ptMODE=" + ptMODE
            + "&btnText=" + btnText
            + "&boxName=" + boxName
            + "&objKeys=" + JSON.stringify(objKeys)
            + "&Storage=" + JSON.stringify(Storage)
            + "&fix_blue=" + fix_blue
            + "&fix_red=" + fix_red
        )
    };

    $(".message").text("URLを取得中...").show();
    xhrSend(params, (res) => {
        if (res.err) {
            alert(res.err);
            $(".message").text("Error:" + res.err).show();
            return 0;
        }

        $(".message").hide();
        $(".copyText").val(res.URL);
        $(".copyArea").show();
    })
}


/********************ヘッダ部機能(ボタン)********************/

//分散モード変更
$(document).on("change", ".setting-box .mode-change-box input[name=opt-tgl]", function () {
    modeChange();
});

//[1 - 10]等#サーバー追加
$(document).on("click", ".setServers", function () {
    if (
        settings.splitMODE == "ON" &&
        !(
            $(this).text() == "1 - 10" ||
            $(this).text() == "11 - 20" ||
            $(this).text() == "21 - 30" ||
            $(this).text() == "31 - 40"
        )
    ) {
        alert("分割モード中は使えません");
        return 0;
    }

    const
        boxName = $(this).attr("boxName"),
        num = $(this).val(),
        Start = $(this).attr("Start"),
        End = $(this).attr("End");
    TMP = [] //初期化

    //テーブルの初期化・サーバリストID設定
    if (settings.splitMODE == "ON") {
        $(".ServerList tr").slice(1).remove();
        $(".ServerList2 tr").slice(1).remove();
        $(".ServerList, .ServerList2").attr("id", boxName);
    }
    else {
        $(".ServerList tr").slice(1).remove();
        $(".ServerList").attr("id", boxName);
    }

    for (let i = 0; i < 10; i++) {
        const CopyTemp1 = $($("#template1").html()).clone();
        CopyTemp1.find(".ServerID").text(i + Number(num));
        CopyTemp1.find(".setTemp").each(function () {
            const CopyTemp2 = $($("#template2").html()).clone();
            $(this).append(CopyTemp2);
        })

        if (settings.splitMODE == "ON") {
            if (i < 5) $(".ServerList tbody").append(CopyTemp1);
            else $(".ServerList2 tbody").append(CopyTemp1);
        }
        else $(".ServerList tbody").append(CopyTemp1);
    }

    if (
        $(this).text() == "9 - 10" ||
        ptMODE == "PT8" ||
        settings.splitMODE != "ON"
    ) {
        $(".Servers").each(function () {
            const Server = Number($(this).find(".ServerID").text());
            if (Server < Start || Server > End) $(this).hide();
        })
    }
    if (
        settings.even_oddMODE == "ON" &&
        settings.splitMODE != "ON"
    ) tSort("even_odd");
    if (settings.memo2_display == "show") $(".memo2").css("display", "inline-block");

    //サーバ切り替え時のデータ保持処理
    if (
        sessionStorage.getItem(boxName) == "true" &&
        get_flg == false
    ) load_Storage();

    setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替
})

//調査サーバー選択式
$(document).on('change', '.select-mode.PTselect input', function () {
    if (settings.splitMODE == "ON") {
        alert("分割モード中は使えません");
        return 0;
    }

    const num = $(this).val();

    if ($(".ServerList").attr("id") != "select") {
        $(".ServerList tr").slice(1).remove();  //テーブルの初期化
        TMP = []; //初期化
    }
    $(".ServerList").attr("id", "select");      //サーバリストID設定

    if ($(this).prop('checked')) {
        const CopyTemp1 = $($("#template1").html()).clone();
        CopyTemp1.find(".ServerID").text(num);
        CopyTemp1.find(".setTemp").each(function () {
            const CopyTemp2 = $($("#template2").html()).clone();
            $(this).append(CopyTemp2);
        })
        $(".ServerList tbody").append(CopyTemp1);
    }
    else {
        $(".Servers").each(function () {
            const Server = $(this).find(".ServerID").text();
            if (Server == num) $(this).remove();
        })
    }

    if (settings.memo2_display == "show")
        $(".memo2").css("display", "inline-block");
})

//[前回の続きから]#データ復旧
//***************************見直し対象
function load_Storage(getData) {
    let flg, boxName, Storage, fix_blue, fix_red;

    //サーバー選択・データ読込チェック
    if ($(".ServerList").find('.Servers').length <= 1) {
        alert("先に調査サーバーを選択してください。");
        return 0;
    }
    $(".Servers").each(function () {
        if ($(this).find(".nowTime").text()) {
            alert("既にデータが復元されています。");
            flg = true;
            return false; //break
        }
    })
    if (flg) return 0;

    if (getData) {
        //URL取得モード
        boxName = getData.boxName;
        Storage = getData.Storage;
        fix_blue = getData.fix_blue;
        fix_red = getData.fix_red;
    }
    else {
        boxName = $(".ServerList").attr("id");
        Storage = JSON.parse(localStorage.getItem(boxName));
        fix_blue = JSON.parse(localStorage.getItem("fix_blue"));
        fix_red = JSON.parse(localStorage.getItem("fix_red"));
    }

    let n = 0;
    if (Storage) {
        const Points = ["ゲル", "砂漠", "バル"];

        $(".Servers").each(function () {
            const
                Datas = Storage[n],
                Servers = $(this),
                Server = $(this).find(".ServerID").text();

            for (let i = 0; i < 3; i++) {
                const
                    objBox = $(Servers).find("." + Points[i]).find(".template2-box"),
                    Data = Datas[Server + Points[i]];

                objBox.find(".befTime")
                    .attr("Date", Data.befDate)
                    .text(Data.befTime)
                    .css("background-color", Data.befColor)
                    .attr("color", Data.befColor);
                objBox.find(".nowTime")
                    .attr("Date", Data.nowDate)
                    .text(Data.nowTime)
                    .css("background-color", Data.nowColor)
                    .attr("color", Data.nowColor);
                objBox.find(".memo")
                    .text(Data.memo)
                    .attr("Date", Data.memoDate)
                    .css("background-color", Data.memoColor)
                    .attr("color", Data.memoColor)
                    .attr("memoflg", Data.memoflg)
                    .attr("memofix", Data.memofix);
                objBox.find(".memo2").val(Data.memo2);

                if (Data.nowColor == "red") {
                    objBox.find(".btn[value=red]").prop("disabled", true);
                    Timers[Server + Points[i]] = setInterval(setTimer, 1000, objBox);
                }
                if (Data.memoflg) {
                    const diffTime = Data.memoDate - new Date().getTime();

                    if (diffTime > 0) {
                        switch (Data.memoflg) {
                            case "red_blue":
                                Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, "red_blue");
                                break;
                            case "red_yellow":
                                Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, "red_yellow");
                                break;
                            case "blue_yellow":
                                Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, "blue_yellow");
                                break;
                            case "yellow_red":
                                Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, "yellow_red");
                                break;
                        }
                        checkTimer();
                    }
                    else {
                        const
                            newDate = new Date().getTime() + diffTime,
                            newTime = TimePlus(newDate, "00:00:00").Time,
                            newColor = (Data.memoflg == "red_blue") ?
                                "blue" : (Data.memoflg == "yellow_red") ?
                                    "red" : "yellow";

                        objBox.find(".befTime")
                            .attr("Date", Data.nowDate)
                            .text(Data.nowTime)
                            .css("background-color", Data.nowColor)
                            .attr("color", Data.nowColor);
                        objBox.find(".nowTime")
                            .attr("Date", newDate)
                            .text(newTime)
                            .css("background-color", newColor)
                            .attr("color", newColor);
                        objBox.find(".memo")
                            .text("")
                            .attr("Date", "")
                            .css("background-color", "transparent")
                            .attr("color", "transparent")
                            .attr("memoflg", "");
                        objBox.find(".memo2").val(Data.memo2);
                    }
                }
            }
            n++;
        })
    }

    //リスト初期化・挿入
    $(".fix_blue tr").slice(1).remove();
    fix_blue.forEach(function (Text) { push_fix("fix_blue", Text, "fix"); })
    $(".fix_red tr").slice(1).remove();
    fix_red.forEach(function (Text) { push_fix("fix_red", Text, "fix"); })
}


/********************メインテーブル画面機能********************/
//[← →]#ポイント移動
$(document).on("click", ".left, .right", function () {
    let
        befPoint = $(this).closest("td"),
        afterPoint;

    if ($(this).attr("class") == "left") {
        afterPoint = $(this).closest("td").prev("td");
        movePoint(befPoint, afterPoint);    //左移動
    }
    else if ($(this).attr("class") == "right") {
        afterPoint = $(this).closest("td").next("td");
        movePoint(afterPoint, befPoint);    //右移動
    }

    save_Sort();
})

//[全更新]
$(document).on("click", ".btn_all", function () {
    const Rows = $(this).closest("tr").find(".template2-box")

    Rows.each(function () {
        const
            Cell = new Cells($(this)),
            Data = Cell.Data;

        if (
            Data.nowColor != "" &&
            Data.nowColor != "transparent" &&
            Data.nowColor != "red" &&
            !(Data.befColor == "skyblue" && Data.nowColor == "yellow") &&
            !(Data.befColor == "red" && Data.nowColor == "yellow") &&
            !(Data.befColor == "violet" && Data.nowColor == "yellow")
        ) {
            Data.newColor = Data.nowColor       //色継承

            TMP.push(Cell.TMP)
            if (5 < TMP.length) TMP.shift()     //5個以上の保存データは末尾から削除
            setRollbackEnable();                //【NaL】[戻す]ボタンの活性切替
            timeStamp($(this), Data)
        }
    })
})

//[青～虹]
$(document).on("click", ".btn", function () {
    const
        objBox = $(this).parents(".template2-box"),
        Cell = new Cells(objBox, $(this).val()),
        Data = Cell.Data;

    TMP.push(Cell.TMP)
    if (5 < TMP.length) TMP.shift();    //5個以上の保存データは末尾から削除
    setRollbackEnable();                //【NaL】[戻す]ボタンの活性切替
    timeStamp(objBox, Data);
})


/********************サイド画面********************/
//[保存]
function save_Storage() {
    if (ptMODE == "PTselect") return 0;

    const Points = ["ゲル", "砂漠", "バル"];
    let
        boxName = $(".ServerList").attr("id"),
        Storage = [],
        fix_blue = [],
        fix_red = [];

    $(".Servers").each(function () {
        const Server = $(this).find(".ServerID").text();
        let Data = []; //初期化

        for (let i = 0; i < 3; i++) {
            const
                objBox = $(this).find("." + Points[i]).find(".template2-box"),
                Cell = new Cells(objBox)

            Data.push(Cell.TMP);
        }

        Storage.push({
            [Server + Points[0]]: Data[0],
            [Server + Points[1]]: Data[1],
            [Server + Points[2]]: Data[2],
        });
    })

    //偶数奇数モードON時、標準の並びに直す
    if (settings.even_oddMODE == "ON") {
        let copyStorage = Storage.concat(); //配列コピー
        for (let cnt = 0, i = 0, n = 5; cnt < Storage.length - 1; cnt++) {
            if (cnt % 2 == 0) {
                Storage[cnt] = copyStorage[i];
                i++;
            }
            else {
                Storage[cnt] = copyStorage[n];
                n++;
            }
        }
    }

    $(".fix_blue").find(".fix").each(function () {
        fix_blue.push([$(this).text()]);
    })
    $(".fix_red").find(".fix").each(function () {
        fix_red.push([$(this).text()]);
    })

    if (boxName == "1 - 10" || boxName == "9 - 10") {
        boxName = "1 - 10";
        sessionStorage.setItem("9 - 10", true);
    }

    sessionStorage.setItem(boxName, true);
    localStorage.setItem(boxName, JSON.stringify(Storage));
    localStorage.setItem("fix_blue", JSON.stringify(fix_blue));
    localStorage.setItem("fix_red", JSON.stringify(fix_red));
}

//[戻す]#直前の状態に戻す
function Rollback() {
    if (TMP.length > 0) {
        const n = TMP.length - 1;

        $(".Servers").each(function () {
            if (TMP[n].Server == $(this).find(".ServerID").text()) {
                const objBox = $(this).find("." + TMP[n].Point).find(".template2-box"),
                    Data = {
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
                        memoflg: TMP[n].memoflg,
                        memofix: TMP[n].memofix,
                        flg: true,
                    };

                timeStamp(objBox, Data, true);
                TMP.pop();
                return false;   //break;
            }
        })
    }
    setRollbackEnable(); //【NaL】[戻す]ボタンの活性切替
}


/********************青木・確定リスト********************/
//(確定/青木）テーブルクリックイベント#コピー/削除
$(document).on("click", ".fix", function () {
    let flg = confirm("コピーor削除を行いますか？\nOK=コピー キャンセル=削除");

    if (flg) TextCopy($(this).text() + "\n")
    else {
        flg = confirm("本当に削除していいですか？");
        if (flg) {
            const
                obj = $(this).closest("table").attr("class").replace("other_", ""),
                Text = $(this).text().split(" ");

            clear_fix(obj, Text[0]);
        }
    }
    save_Fix();
})

//InputBoxテキストセット
$(document).on("click", "#sTime, #eTime", function () {
    if ($(this).attr("id") == "sTime") {
        if ($("#sTime").val() == "") {
            $("#sTime").val(TimePlus(new Date(), "01:00:00").Time.slice(0, -3))
        }
    } else
        if ($(this).attr("id") == "eTime") {
            if ($("#eTime").val() == "") {
                $("#eTime").val(TimePlus(new Date(), "01:00:00").Time.slice(0, -3))
            }
        }
})

//[追加]#確定リスト追加処理
//******************見直し対象
function push_fix_old() {
    const
        Server = $("#Server"),
        Point = $("#Point"),
        sTime = $("#sTime"),
        eTime = $("#eTime");
    let
        fix,
        Data = [];

    //入力チェック(空要素・サーバ番号・入力規則)
    if (!Server.val() || !sTime.val() || !eTime.val()) return 0;
    if (Server.val() < 1 || Server.val() > 40) return 0;
    if (!checkTime(sTime.val()) || !checkTime(eTime.val())) return 0;

    var Text = [Server.val() + Point.val() + " "
        + sTime.val() + " - " + eTime.val(), ""];
    if (share_ID) push_fix("fix_red", Text, "all");
    else push_fix("fix_red", Text, "fix");

    $(".fix_red").find(".fix").each(function () {
        fix = $(this).text().split(" ")
        Data.push(fix)
    })

    $(".fix_red tr").slice(1).remove()

    Data.sort((a, b) => a[3] > b[3] ? 1 : -1)

    Data.forEach(function (fix) {
        Text = [fix.join(" "), ""];
        push_fix("fix_red", Text, "fix");
    })

    var afterTime = eTime.val().split(":")
    afterTime = Number(afterTime[0]) * 60 * 60
        + Number(afterTime[1]) * 60
        + 60 * 60 //終了時間から1時間後

    var nowTime = new Date()
    nowTime = nowTime.getHours() * 60 * 60
        + nowTime.getMinutes() * 60

    Timers[Server.val() + Point.val() + "fix"] = setTimeout(
        () => clear_fix("fix_red", Server.val() + Point.val()),
        (afterTime - nowTime) * 1000
    )

    //初期化
    Server.val("1")
    Point.val("ゲル")
    sTime.val("")
    eTime.val("")
}

//リスト表示切替
$(document).on(
    "click",
    ".fix_blue_head, .fix_red_head, .other_fix_blue_head, .other_fix_red_head",
    function () {
        if ($(this).attr("class") == "fix_blue_head") {
            $(".fix_blue").find(".fix").toggle();
            $(".block_fix_blue").toggle();
        }
        else if ($(this).attr("class") == "fix_red_head") {
            $(".fix_red").find(".fix").toggle();
            $(".block_fix_red").toggle();
        }
        else if ($(this).attr("class") == "other_fix_blue_head") {
            $(".other_fix_blue").find(".fix").toggle();
            $(".other_block_fix_blue").toggle();
            if ($(".other_block_fix_blue").is(":visible")) {
                $(".other_fix_blue tbody").css("display", "block");

                if ($(".other_fix_blue .fix").length >= 6)
                    $(".other_fix_blue tbody").css("display", "block");
                else
                    $(".other_fix_blue tbody").css("display", "");

            }
            else {
                $(".other_fix_blue tbody").css("display", "");
                $(".other_fix_blue tbody").css("overflow-y", "hidden");
            }

        }
        else if ($(this).attr("class") == "other_fix_red_head") {
            $(".other_fix_red").find(".fix").toggle();
            $(".other_block_fix_red").toggle();
            if ($(".other_block_fix_red").is(":visible")) {
                $(".other_fix_red tbody").css("overflow-y", "scroll");

                if ($(".other_fix_red .fix").length >= 6)
                    $(".other_fix_red tbody").css("display", "block");
                else
                    $(".other_fix_red tbody").css("display", "");
            }
            else {
                $(".other_fix_red tbody").css("overflow-y", "hidden");
                $(".other_fix_red tbody").css("display", "");

            }
        }
    }
);

//[外部確定リスト追加]
$(document).on("click", ".push_fixs", function () {
    const TextObj = $(this).parents("div[class^=other_block_fix_]").find("textarea");
    let fixObj = $(this).parent("div").attr("target");

    if (!TextObj.val()) return 0;

    let fixs = TextObj.val().split(/\r\n|\r|\n/);
    fixs = fixs
        .sort((a, b) => {
            a = a.split(" ");
            b = b.split(" ");
            if (a.length == 3 && b.length == 3) return (a[2] > b[2] ? 1 : -1);
            if (a.length == 3 && b.length == 4) return (a[2] > b[3] ? 1 : -1);
            if (a.length == 4 && b.length == 4) return (a[3] > b[3] ? 1 : -1);
            if (a.length == 4 && b.length == 3) return (a[3] > b[2] ? 1 : -1);
        })
        .filter(Text => Text !== "");
    fixs.forEach(Text => $("." + fixObj).append('<tr><td class="fix">' + Text + "</td></tr>"))
    fixs = fixs.join(",");

    fixObj = fixObj.replace("other_", "");
    if (share_flg) updateList("ADD", fixObj, fixs);
    TextObj.val("");
})

//外部リストスクロール幅変更
$(document).on("click", ".chk-tgl-span button", function () {
    const
        scroll_mode = $(this).attr("class"),
        obj = $(this).parents(".function-btn-box-mini").attr("target"),
        maxlength = ($("." + obj + " tr").length - 1) * 24,
        before_height = Number($("." + obj + " tbody").css("height").replace("px", ""));

    if (scroll_mode == "up") {
        if (before_height - 24 >= 24 * 3) {
            $("." + obj + " tbody").css("height", before_height - 24 + "px");
            settings.ListSetting[obj].scrollHeight = before_height - 24;
        }
        else return 0;
    }
    else if (scroll_mode == "down") {
        if (maxlength - 24 > before_height) {
            $("." + obj + " tbody").css("height", before_height + 24 + "px");
            settings.ListSetting[obj].scrollHeight = before_height + 24;
        }
        else return 0;
    }

    localStorage.setItem("settings", JSON.stringify(settings));
});

//外部リスト表示モード切替
$(document).on("click", ".chk-Box", function () {
    const
        bFlg = $(this).prop("checked"),
        obj = $(this).val(),
        List = $("." + obj + " tr");

    if (bFlg === true) {
        $(this).next().html("全部表示する");
        settings.ListSetting[obj].scrollMode = "ON";

        if (List.length > 2)
            $("." + obj + " tbody").css("display", "");
    }
    else {
        $(this).next().html("全部表示しない");
        settings.ListSetting[obj].scrollMode = "OFF";

        if (List.length > 2)
            $("." + obj + " tbody").css("display", "block");
    }

    localStorage.setItem("settings", JSON.stringify(settings));
});

//外部リスト変更イベント
function setObServer() {
    const
        observer = new MutationObserver((elem) => {
            elem.forEach(elem => {
                if (elem.type == "childList") {
                    if (elem.target.className != "fix") {
                        const
                            obj_tbody = elem.target.offsetParent.className,
                            obj_block = "scroll_" + obj_tbody,
                            scroll_flg = $("." + obj_block).find(".chk-Box").prop("checked"),
                            length = elem.target.childElementCount,
                            visible = $("." + obj_block).is(":visible");

                        if (length >= 6 && !scroll_flg && visible) {
                            $("." + obj_tbody + " tbody").css("display", "block");
                            $("." + obj_block).find(".chk-tgl-span button").prop("disabled", false);
                        }
                        else {
                            $("." + obj_tbody + " tbody").css("display", "");
                            $("." + obj_block).find(".chk-tgl-span button").prop("disabled", true);
                        }
                    }
                }
            })
        }),
        config = {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        };

    observer.observe($(".fix_blue tbody")[0], config);
    observer.observe($(".fix_red tbody")[0], config);
    observer.observe($(".other_fix_blue tbody")[0], config);
    observer.observe($(".other_fix_red tbody")[0], config);
}


/********************関数群********************/

/********************初回設定関連********************/
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
    $(".ServerList #server-list-hd").find(".left, .right").prop("disabled", false);           //全活性
    $(".ServerList #server-list-hd").find(".left, .right").first().prop("disabled", true);    //最初のボタンを非活性
    $(".ServerList #server-list-hd").find(".left, .right").last().prop("disabled", true);     //最後のボタンを非活性
    $(".ServerList2 #server-list-hd").find(".left, .right").prop("disabled", false);           //全活性
    $(".ServerList2 #server-list-hd").find(".left, .right").first().prop("disabled", true);    //最初のボタンを非活性
    $(".ServerList2 #server-list-hd").find(".left, .right").last().prop("disabled", true);     //最後のボタンを非活性
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

//オプション設定読込み
function load_settings() {
    const
        objList = ["fix_blue", "fix_red", "other_fix_blue", "other_fix_red"],
        Mode = ["red_blue", "red_yellow", "blue_yellow", "yellow_red"];
    settings = JSON.parse(localStorage.getItem("settings"));

    if (settings) {
        //分割モードフラグ
        if (settings.splitMODE && settings.splitMODE == "ON")
            $(document).find(".split").click();

        //偶数奇数モードフラグ
        if (settings.even_oddMODE && settings.even_oddMODE == "ON")
            $(document).find(".even_odd").prop("checked", true);

        //メモ欄2表示モードフラグ
        if (settings.memo2_display && settings.memo2_display == "show")
            $(document).find(".tgl_memo2").prop("checked", true);

        //自動更新モードフラグ
        Mode.forEach(Mode => {
            if (["auto"] in settings && [Mode] in settings["auto"]) {
                if (settings.auto[Mode] == "ON")
                    $(document).find(".auto." + Mode).prop("checked", true);
            }
        })

        //青黄確定リストモードフラグ
        $(".chk-tgl-span button").prop("disabled", true);   //スクロール幅変更ボタン 非活性化
        if (settings.ListSetting) {
            objList.forEach(obj => {
                if ([obj] in settings["ListSetting"]) {
                    //スクロール幅設定
                    if (settings.ListSetting[obj].scrollHeight)
                        $("." + obj + " tbody").css("height", settings.ListSetting[obj].scrollHeight + "px");

                    //全部表示する/しない設定
                    if (settings.ListSetting[obj].scrollMode == "ON")
                        $(document).find(".scroll_" + obj + " input").click();
                }
            })
        }
        else {
            settings.ListSetting = {
                fix_blue: {},
                fix_red: {},
                other_fix_blue: {},
                other_fix_red: {},
            };
            localStorage.setItem("settings", JSON.stringify(settings));
        }

        //[戻す]ボタン表示モードフラグ
        if (settings.showUndoBtn && settings.showUndoBtn == "ON")
            $(document).find(".showUndoBtn").click();
    }
    else {
        settings = {
            auto: {},
            ListSetting: {
                fix_blue: {},
                fix_red: {},
                other_fix_blue: {},
                other_fix_red: {},
            },
        };

        localStorage.setItem("settings", JSON.stringify(settings));
    }
}


/********************ヘッダ部関係********************/
//[4人分散/8人分散/選択式分散]#PTモード変更
function modeChange() {
    //【NaL】モード切替スイッチ追加に伴う変更
    ptMODE = $('.mode-change-box input[name=opt-tgl]:checked').val();
    $('.select-mode').hide();                    //一旦すべて非表示
    $('.select-mode' + '.' + ptMODE).show();    //選択モードのみ表示
}

/********************メイン機能関係********************/
//テーブルの分割表示
function splitTable() {
    const boxName = $(".ServerList").attr("id");

    if (settings.splitMODE == "ON") {
        save_Storage();
        $("body").css("max-width", "1300px");
        $(".ServerList2").show();
    }
    else {
        save_Storage();
        $("body").css("max-width", "650px");
        $(".ServerList2 tr").slice(1).remove();
        $(".ServerList2").hide();
    }
    if (boxName) {
        $(".setServers").each(function () {
            if ($(this).text() == boxName)
                $(this).click(); //調査鯖ボタンクリック
        })
    }
}

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
        Servers = tmp1.querySelectorAll(".Servers"),
        parentClass = befPoint.parents("table").attr("class");

    Servers[0].insertBefore(tmp1_befPoint[0], tmp1_afterPoint[0]);
    befPoint.insertBefore(afterPoint);

    if (parentClass == "ServerList") {
        const thead = $(".ServerList thead").html()
        $(".ServerList2 thead").html(thead);
    }
    else {
        const thead = $(".ServerList2 thead").html()
        $(".ServerList thead").html(thead);
    }

    for (let i = 0; i < 10; i++) {
        $(".Servers").find(befClass).eq(i)
            .insertBefore($(".Servers").find(afterClass).eq(i));
    }

    setInitMoveBtn();
}

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
    let Time, diffDate, memoDate, Text;
    switch (Data.newColor) {
        case "skyblue":
            //赤→青・虹→青判定
            if (Data.nowColor == "red" || Data.nowColor == "violet") {
                Time = TimePlus(Data.newDate, "01:30:00").Time.slice(0, -3);
                Data.memo = Time + "までに黄変化";
                Data.memoColor = "transparent";

                memoDate = TimePlus(Data.newDate, "01:30:00").Date;
                diffDate = memoDate - Data.newDate;
                clearTimeout(Timers[Data.Server + Data.Point]);
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "red_blue");
                Data.memoflg = "red_blue";
                checkTimer();
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
                Time = TimePlus(Data.nowDate, "01:30:00").Time.slice(0, -3);
                Data.memo = Time + "まで変化無し";
                Data.memoColor = "transparent";

                memoDate = TimePlus(Data.nowDate, "01:30:00").Date;
                if (Data.nowColor == "red")
                    memoDate = TimePlus(memoDate, objBox.find(".memo").text().slice(-8)).Date;
                diffDate = memoDate - Data.newDate;
                clearTimeout(Timers[Data.Server + Data.Point]);
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "red_yellow");
                Data.memoflg = "red_yellow";
                checkTimer();
            }

            //青→黄判定
            if (Data.nowColor == "skyblue") {
                clear_fix("fix_blue", Data.Server + Data.Point);
                Text = Data.Server + Data.Point + " "
                    + TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3) + " - "
                    + TimePlus(Data.newDate, "03:00:00").Time.slice(0, -3)
                    + "#" + TimePlus(Data.newDate, "03:00:00").Date;

                push_fix("fix_blue", Text, "all");

                Time = TimePlus(Data.nowDate, "03:00:00").Time.slice(0, -3);
                Data.memo = Time + "まで変化無し";
                Data.memoColor = "skyblue";

                memoDate = TimePlus(Data.nowDate, "03:00:00").Date;
                diffDate = memoDate - Data.newDate;
                clearTimeout(Timers[Data.Server + Data.Point]);
                Timers[Data.Server + Data.Point] = setTimeout(memoTimer, diffDate, objBox, "blue_yellow");
                Data.memoflg = "blue_yellow";
                Data.memofix = [
                    TimePlus(Data.nowDate, "03:00:00").Date,
                    TimePlus(Data.newDate, "03:00:00").Date
                ];
                checkTimer();
            }

            break;
        case "red":
            objBox.find(".btn[value=red]").prop("disabled", true);
            Data.memoDate = "";
            Data.memo = "経過時間:" + "00:00:00";
            Data.memoColor = "transparent";
            clearTimeout(Timers[Data.Server + Data.Point]);
            Timers[Data.Server + Data.Point] = setInterval(setTimer, 1000, objBox);

            //黄→赤判定
            if (Data.nowColor == "yellow") {
                if (Data.memoflg == "blue_yellow" || Data.memoflg == "yellow_red") { //青黄判定
                    Text = Data.Server + Data.Point + " ";
                    Data.memofix = Data.memofix.split(",");

                    if (Data.memofix[0] < Data.nowDate && Data.nowDate < Data.memofix[1])   //開始時間が青黄時間の範囲内
                        Text += TimePlus(Data.nowDate, "01:00:00").Time.slice(0, -3) + " - "
                    else
                        Text += TimePlus(Data.memofix[0], "01:00:00").Time.slice(0, -3) + " - "
                    if (Data.memofix[0] < Data.newDate && Data.newDate < Data.memofix[1])   //終了時間が青黄時間の範囲内
                        Text += TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                            + "#" + TimePlus(Data.newDate, "01:00:00").Date;
                    else
                        Text += TimePlus(Data.memofix[1], "01:00:00").Time.slice(0, -3)
                            + "#" + TimePlus(Data.memofix[1], "01:00:00").Date;
                }
                else { //前回黄判定
                    if (Data.newDate - Data.nowDate > 3600000) { //前回時間から1時間経過した場合
                        Data.nowDate = "";
                        Data.nowTime = "";
                        Data.nowColor = "transparent";
                        Text = Data.Server + Data.Point + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                            + "#" + TimePlus(Data.newDate, "01:00:00").Date;
                    }
                    else {
                        Text = Data.Server + Data.Point + " "
                            + TimePlus(Data.nowDate, "01:00:00").Time.slice(0, -3) + " - "
                            + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                            + "#" + TimePlus(Data.newDate, "01:00:00").Date;
                    }
                }
            }
            else {
                //黄→赤以外
                Text = Data.Server + Data.Point + " - "
                    + TimePlus(Data.newDate, "01:00:00").Time.slice(0, -3)
                    + "#" + TimePlus(Data.newDate, "01:00:00").Date;
            }

            push_fix("fix_red", Text, "all");
            clear_fix("fix_blue", Data.Server + Data.Point);
            Data.memoflg = "";
            Data.memofix = "";

            break;
        case "violet":
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
        .attr("color", Data.memoColor)
        .attr("memoflg", Data.memoflg)
        .attr("memofix", Data.memofix);

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
            .attr("color", "transparent")
            .attr("memoflg", "")
            .attr("memofix", "");

        objBox.find(".btn[value=red]").prop("disabled", false);
        clearInterval(Timers[Server + Point]);
        clear_fix("fix_red", Server + Point);
    }
    else objBox.find(".memo").text("経過時間:" + Time);
}

//メモ1更新タイマ
function memoTimer(objBox, Color) {
    const
        Server = objBox.closest("tr").find(".ServerID").text(),
        Point = objBox.closest("td").attr("class"),
        newDate = new Date().getTime(),
        newTime = TimePlus(new Date().getTime(), "00:00:00").Time,
        nowDate = objBox.find(".nowTime").attr("Date"),
        nowTime = objBox.find(".nowTime").text(),
        nowColor = objBox.find(".nowTime").attr("color");
    let
        TimeObj, diffDate, newColor, Text,
        memoDate, memo, memoColor, memoflg, memofix;

    switch (Color) {
        case "red_blue":
            newColor = "yellow";
            Text = Server + Point + " "
                + TimePlus(nowDate, "03:00:00").Time.slice(0, -3) + " - "
                + TimePlus(newDate, "03:00:00").Time.slice(0, -3)
                + "#" + TimePlus(newDate, "03:00:00").Date;

            push_fix("fix_blue", Text, "all");

            TimeObj = TimePlus(nowDate, "03:00:00");
            memoDate = TimeObj.Date;
            memo = TimeObj.Time.slice(0, -3) + "まで変化無し";
            memoColor = "skyblue";
            memoflg = "";
            memofix = [
                TimePlus(nowDate, "03:00:00").Date,
                TimePlus(newDate, "03:00:00").Date
            ];

            if (settings.auto.blue_yellow == "ON") {
                diffDate = TimeObj.Date - newDate;
                Timers[Server + Point] = setTimeout(memoTimer, diffDate, objBox, "blue_yellow");
                checkTimer();
                memoflg = "blue_yellow";
            }

            break;
        case "red_yellow":
            //TimeObj = TimePlus(newDate, "01:30:00");
            //memo = TimeObj.Time.slice(0, -3) + "までに赤変化";
            newColor = "yellow";
            memoDate = "";
            memo = "";
            memoColor = "transparent";
            memoflg = "";

            break;
        case "blue_yellow":
            //TimeObj = TimePlus(newDate, "01:00:00");
            //memo = TimeObj.Time.slice(0, -3) + "までに赤変化";
            newColor = "yellow";
            memoDate = "";
            memo = "";
            memoColor = "transparent";
            memoflg = "blue_yellow";

            if (settings.auto.yellow_red == "ON") {
                TimeObj = TimePlus(newDate, "01:00:00");
                diffDate = TimeObj.Date - newDate;
                Timers[Server + Point] = setTimeout(memoTimer, diffDate, objBox, "yellow_red");
                checkTimer();
                memoflg = "yellow_red";
            }

            break;
        case "yellow_red":
            newColor = "red";
            Text = Server + Point + " "
                + TimePlus(nowDate, "01:00:00").Time.slice(0, -3) + " - "
                + TimePlus(newDate, "01:00:00").Time.slice(0, -3)
                + "#" + TimePlus(newDate, "01:00:00").Date;

            push_fix("fix_red", Text, "all");
            clear_fix("fix_blue", Server + Point);

            objBox.find(".btn[value=red]").prop("disabled", true);
            memoDate = "";
            memo = "経過時間:" + "00:00:00";
            memoColor = "transparent";
            memoflg = "";
            memofix = "";
            clearTimeout(Timers[Server + Point]);
            Timers[Server + Point] = setInterval(setTimer, 1000, objBox);

            break;
    }

    if (
        (settings.auto.red_blue == "ON" && Color == "red_blue") ||
        (settings.auto.red_yellow == "ON" && Color == "red_yellow") ||
        (settings.auto.blue_yellow == "ON" && Color == "blue_yellow") ||
        (settings.auto.yellow_red == "ON" && Color == "yellow_red")
    ) {
        objBox.find(".befTime")
            .attr("Date", nowDate)
            .text(nowTime)
            .css("background-color", nowColor)
            .attr("color", nowColor);

        objBox.find(".nowTime")
            .attr("Date", newDate)
            .text(newTime)
            .css("background-color", newColor)
            .attr("color", newColor);

        objBox.find(".memo")
            .attr("Date", memoDate)
            .text(memo)
            .css("background-color", memoColor)
            .attr("color", memoColor)
            .attr("memoflg", memoflg)
            .attr("memofix", memofix);
    }
    else {
        objBox.find(".memo")
            .attr("Date", memoDate)
            .text(memo)
            .css("background-color", memoColor)
            .attr("color", memoColor)
            .attr("memoflg", memoflg)
            .attr("memofix", memofix);
    }
}

//タイマー不具合チェック
function checkTimer() {

    if (check_flg == false) {
        setInterval(() => {
            const Points = ["ゲル", "砂漠", "バル"];

            $(".Servers").each(function () {
                for (let i = 0; i < 3; i++) {
                    const
                        objBox = $(this).find("." + Points[i]).find(".template2-box"),
                        Data = new Cells(objBox).Data,
                        newDate = new Date().getTime();

                    if (Data.memoDate && newDate > Data.memoDate) {
                        clearTimeout(Timers[Data.Server + Points[i]]);
                        Timers[Data.Server + Points[i]] = setTimeout(memoTimer, 1000, objBox, Data.memoflg);
                    }
                }
            });
        }, 60000)
        check_flg = true;
    }

}


/********************サイドバー関連********************/
//入力チェック
function checkTime(Time) {
    return Time.match(/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/) !== null;
}

//(確定/青木リスト)挿入
function push_fix(fix, Text, flg) {
    if (Text.indexOf("#") != -1) Text = Text.split("#");

    if (flg == "fix" || flg == "all")
        $("." + fix).append('<tr><td class="fix">' + Text[0] + '</td></tr>');
    if (flg == "other" || flg == "all") {
        if (fix.indexOf("other_") != -1) fix = fix.replace("other_", "");
        $(".other_" + fix).append('<tr><td class="fix">' + Text[0] + "</td></tr>");
        if ($(".other_block_" + fix).is(":hidden")) $(".other_" + fix).find(".fix").hide();
        if (share_flg) {
            Text = Text.join("#");
            updateList("ADD", fix, Text);
        }
    }
}

//ウィンドウ - リサイズ／最大化
var
    objWd = $(window),          //ウィンドウ
    l_rightFollowFlg = false;   //追随中フラグ
objWd.on('resize maximize', function () {
    //サイドリストの高さ調整
    fncFixRedReSize();
});

//サイドリスト（右側固定時）の高さ設定
function fncFixRedReSize() {
    if (l_rightFollowFlg === true) {
        //高さ設定
        var h = objWd.height() - 470;
        //20以下には縮めない
        if (h <= 20) { h = 20; }
        $('#fix-red, #other_fix_red').children('tbody').height(h);
    }
}

//サイドリスト追随モード切替
$(document).on("click", "#chk-side-follow", function () {
    const
        MODE_ON = 'following-on',    //ついてくるClass名
        MODE_OFF = 'following-off';  //ついてこないClass名

    //追随切替
    l_rightFollowFlg = $('#chk-side-follow').prop('checked');
    if (l_rightFollowFlg === true) {
        $('.side-list-box, .side-list-area').removeClass(MODE_OFF);
        $('.side-list-box, .side-list-area').addClass(MODE_ON);
        $(".hung-icon_other").hide();

        if (side_mode == "default") {
            $('.side-list-box').hide();
            $(".side-list-area").css("height", "80px");
            $(".side-list-area").find('.hung-icon').toggleClass('rev');     //アイコン反転
            $(".side-list-area").find('.hung-icon_other').show();
        }
        else if (side_mode == "fix_box") {
            $(".fix_box").show();
            $(".other_fix_box").hide();
        }
        else {
            $(".fix_box").hide();
            $(".other_fix_box").show();
            $(".other_block_fix_blue, .other_block_fix_red").show();
        }

        fncFixRedReSize();
    }
    else {
        $('.side-list-box, .side-list-area').removeClass(MODE_ON);
        $('.side-list-box, .side-list-area').addClass(MODE_OFF);
        $(".fix_box, .other_fix_box").show();
        $(".fix_blue tbody, .fix_red tbody, .other_fix_blue tbody, .other_fix_red tbody").css("height", "");
    }
});

//サイドリスト収納切替
$(document).on("click", ".side-list-btn", function () {
    const target = $(this).attr("target");

    $('.side-list-box').animate({ width: 'toggle' }, 'fast', function () {
        const visible = $('.side-list-box').is(":visible");

        if (target == "fix_box") {
            side_mode = "fix_box";
            $(".fix_box").show();
            $(".other_fix_box").hide();
        }
        else {
            side_mode = "other_box";
            $(".fix_box").hide();
            $(".other_fix_box").show();
        }

        if (visible) {
            $(".side-list-area").css("height", "40px");
            $(".side-list-area").find('.hung-icon_other').hide();
        }
        else {
            $(".side-list-area").css("height", "80px");
            $(".side-list-area").find('.hung-icon_other').show();
        }
    });

    $(".side-list-area").find('.hung-icon').toggleClass('rev');     //アイコン反転
});

//機能リスト-[戻す]
$(document).on("click", ".func-list-area", function () { Rollback(); });


/********************保存・削除関連********************/
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

            $(this).find("p, .memo").each(function () {
                if ($(this).attr("class") != "time-title") {
                    $(this)
                        .attr("Date", "")
                        .text("")
                        .css("background-color", "transparent")
                        .attr("color", "transparent")
                        .attr("memoflg", "");
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


/********************オプション設定********************/
//分割モード切替
$(document).on("click", ".split", function () {
    if ($(this).prop('checked')) {
        settings.splitMODE = "ON";
        localStorage.setItem("settings", JSON.stringify(settings));
        splitTable();
    }
    else {
        settings.splitMODE = "OFF";
        localStorage.setItem("settings", JSON.stringify(settings));
        splitTable();
    }
})

//偶数・奇数モード切替
$(document).on("click", ".even_odd", function () {
    if ($(this).prop('checked')) {
        settings.even_oddMODE = "ON";
        localStorage.setItem("settings", JSON.stringify(settings));
        tSort("even_odd");
    }
    else {
        settings.even_oddMODE = "OFF";
        localStorage.setItem("settings", JSON.stringify(settings));
        tSort("default");
    }
})

//メモ欄表示モード切替
$(document).on("click", ".tgl_memo2", function () {
    if ($(this).prop('checked')) {
        $(".memo2").css("display", "inline-block");
        settings.memo2_display = "show";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    else {
        $(".memo2").css("display", "none");
        settings.memo2_display = "hide";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
});

//自動更新モード切替
$(document).on("click", ".toggle_switch .auto", function () {
    if ($(this).prop('checked')) {
        if ($(this).attr("class") == "auto yellow_red") {
            alert("メンテナンス中です");
            $(this).prop('checked', false);
            return 0;
            if (settings.auto["blue_yellow"] == "OFF") {
                alert("青黄→黄自動更新モードがONになっていません");
                $(this).prop('checked', false);
                return 0;
            }
        }
        settings.auto[$(this).val()] = "ON";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    else {
        settings.auto[$(this).val()] = "OFF";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
})

//[戻す]ボタン表示切替
$(document).on("click", ".showUndoBtn", function () {
    const
        MODE_ON = 'following-on',
        MODE_OFF = 'following-off';

    if ($(this).prop('checked')) {
        $('.func-list-area').removeClass(MODE_OFF);
        $('.func-list-area').addClass(MODE_ON);
        settings.showUndoBtn = "ON";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    else {
        $('.func-list-area').removeClass(MODE_ON);
        $('.func-list-area').addClass(MODE_OFF);
        settings.showUndoBtn = "OFF";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
})


/********************スライドBOX********************/
//スライドBOX（使い方／更新履歴）開閉
$(document).on("click", ".slider-title", function () {
    $(this).next('.slider-box').slideToggle("fast");
    $(this).find('.slider-icon').toggleClass('rev');    //アイコン反転
})


/********************汎用関数********************/
//ajax通信
function xhrSend(params, resFunc) {
    params.version = version;

    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxAAOEdydyuV7p9sy7v4VhA_xEoHv_E3OVe3O_IuUoNI_A2XRZyv5ao9EtVCcd1dB6s/exec",
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