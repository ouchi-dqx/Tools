var
    ptMODE = "",        //PTモード変数
    even_oddMODE = "",  //並びの偶数モード/奇数モード切替フラグ
    TMP = [],           //履歴変数
    Timers = {},        //タイマーリスト変数
    get_flg = false,    //URL取得モードフラグ
    share_flg = false,  //データ共有フラグ
    share_ID = "",      //データ共有用パス
    ver_flg = false;    //バージョン管理フラグ
//var sendFlg = "";     //データ送信フラグ-没
const version = "1.0";  //バージョン管理変数

//テスト用関数
function debug() {

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
            memo: objBox.find(".memo").text(),
            memoColor: objBox.find(".memo").attr("color"),
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
window.onload = function () {
    modeChange();           //4PT/8PT切替(デフォルト4PT)
    setInitMoveBtn();       //【NaL】調査マップ入替ボタンの活性切替
    setRollbackEnable();    //【NaL】[戻す]ボタンの活性切替
    $(".other_block_fix_blue, .other_block_fix_red").hide();

    if (location.search.substring(1)) getURLData(location.search.substring(1));
    else sortPoint();

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


/*ヘッダ部機能(リンク)*/
//[共有表を作成]
function addShare() {
    const flg = confirm("青黄・確定の共有表を作成しますか？");
    if (flg) {
        const params = {
            mode: "addShare",
        };

        $(".message").text("共有表を作成中...").show();
        xhrSend(params, (res) => {
            if (res) {
                if (res.err && res.err != "古いバージョンです") {
                    alert(res.err);
                    $(".message").text("Error:" + res.err).show();
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

        const params = {
            mode: "connectShare",
            share_ID: share_ID,
        };

        $(".message").text("共有表にアクセス中...").show();
        xhrSend(params, (res) => {
            if (res) {
                if (res.err && res.err != "古いバージョンです") {
                    alert(res.err);
                    $(".message").text("Error:" + res.err).show();
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
                if (res.err) {
                    if (res.err == "古いバージョンです") {
                        if (!ver_flg) {
                            alert(
                                res.err + "\n (注)未修正の不具合がある可能性があります"
                                + "\n 最新のページに更新することを推奨します"
                            );
                            ver_flg = true;
                        }
                    }
                    else {
                        clearInterval(Timers.updateTime);

                        const flg = confirm(
                            res.err + "\n" +
                            "接続を切断しました" + "\n" +
                            "再接続しますか？"
                        );

                        if (flg) {
                            connectShare();
                            updateList(mode, fix, Text);
                            return 0;
                        }
                        else {
                            share_ID = "";

                            $(".message").html(
                                "Error:" + res.err + "<br /" +
                                "接続を切断しました"
                            ).show();
                            $(".connectArea").hide();
                            $(".disconnect").hide();

                            return 0;
                        }
                    }
                }

                $(".message").hide();
                $(".connectCount").text(res.connectCount).show();

                const
                    fix_blue = res.fix_blue.split(","),
                    fix_red = res.fix_red.split(",");

                $(".other_fix_blue tr").slice(1).remove();
                $(".other_fix_red tr").slice(1).remove();

                fix_blue.forEach((Text) =>
                    $(".other_fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>")
                )
                fix_red.forEach((Text) =>
                    $(".other_fix_red").append('<tr><td class="fix">' + Text + "</td></tr>")
                )
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
                $(".message").text("接続を切断しました").show();
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


/*ヘッダ部機能(ボタン)*/
//[4人分散/8人分散]#PTモード変更
function modeChange() {
    //【NaL】モード切替スイッチ追加に伴う変更
    ptMODE = $('.mode-change-box input[name=opt-tgl]:checked').val();
    if (ptMODE == "PT4") $(".even_odd").prop("disabled", false);
    if (ptMODE == "PT8" || ptMODE == "PTselect") $(".even_odd").prop("disabled", true);
    $('.select-mode').hide();                    //一旦すべて非表示
    $('.select-mode' + '.' + ptMODE).show();    //選択モードのみ表示
}

//[1 - 10]等#サーバー追加
$(document).on("click", ".setServers", function () {
    const
        boxName = $(this).attr("boxName"),
        num = $(this).val(),
        Start = $(this).attr("Start"),
        End = $(this).attr("End");
    TMP = [] //初期化

    $(".ServerList tr").slice(1).remove();   //テーブルの初期化
    $(".ServerList").attr("id", boxName);    //サーバリストID設定

    for (let i = 0; i < 10; i++) {
        const CopyTemp1 = $($("#template1").html()).clone();
        CopyTemp1.find(".ServerID").text(i + Number(num));
        CopyTemp1.find(".setTemp").each(function () {
            const CopyTemp2 = $($("#template2").html()).clone();
            $(this).append(CopyTemp2);
        })
        $(".ServerList tbody").append(CopyTemp1);
    }

    if ($(this).text() == "9 - 10" || ptMODE == "PT8") {
        $(".Servers").each(function () {
            const Server = Number($(this).find(".ServerID").text());
            if (Server < Start || Server > End) $(this).hide();
        })
    }
    if (even_oddMODE == "ON") tSort("even_odd");

    //サーバ切り替え時のデータ保持処理
    if (
        sessionStorage.getItem(boxName) == "true" &&
        get_flg == false
    ) load_Storage();

    setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替
})

//調査サーバー選択式
$(document).on('change', '.select-mode.PTselect input', function () {
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
})

//[標準モード/偶数奇数モード]偶数・奇数モード切替
$(document).on("click", ".even_odd", function () {
    if ($(this).text() == "標準モード") {
        $(this).text("偶数奇数モード");
        even_oddMODE = "ON";
        localStorage.setItem("even_oddMODE", "ON");
        tSort("even_odd");
    }
    else if ($(this).text() == "偶数奇数モード") {
        $(this).text("標準モード");
        even_oddMODE = "OFF";
        localStorage.setItem("even_oddMODE", "OFF");
        tSort("default");
    }
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
                Server = Servers.find(".ServerID").text();

            for (let i = 0; i < 3; i++) {
                const
                    objBox = $(Servers).find("." + Points[i]).find(".template2-box"),
                    Data = Datas[Server + Points[i]];

                objBox.find(".nowTime")
                    .attr("Date", Data.nowDate)
                    .text(Data.nowTime)
                    .css("background-color", Data.nowColor)
                    .attr("color", Data.nowColor);
                objBox.find(".befTime")
                    .attr("Date", Data.befDate)
                    .text(Data.befTime)
                    .css("background-color", Data.befColor)
                    .attr("color", Data.befColor);
                objBox.find(".memo")
                    .text(Data.memo)
                    .attr("Date", Data.memoDate)
                    .css("background-color", Data.memoColor)
                    .attr("color", Data.memoColor);
                objBox.find(".memo2").val(Data.memo2);

                if (Data.nowColor == "red") {
                    objBox.find(".btn[value=red]").prop("disabled", true);
                    Timers[Server + Points[i]] = setInterval(setTimer, 1000, objBox);
                } else {
                    //URLからデータ抽出時に青黄の時間がURLを開いた時の時間になる不具合確認用
                    if (Data.memoDate) {
                        let diffTime = Data.memoDate - new Date().getTime();
                        if (Data.befColor == "skyblue") Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, "skyblue");
                        else Timers[Server + Points[i]] = setTimeout(memoTimer, diffTime, objBox, Data.nowColor);
                    }
                    objBox.find(".btn[value=red]").prop("disabled", false);
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


/*メインテーブル画面機能*/
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


/*サイド画面*/
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
    if (even_oddMODE == "ON") {
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


/*青木・確定リスト*/
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

    var Text = Server.val() + Point.val() + " "
        + sTime.val() + " - " + eTime.val();
    if (share_ID) push_fix("fix_red", Text, "all");
    else push_fix("fix_red", Text, "fix");

    $(".fix_red").find(".fix").each(function () {
        fix = $(this).text().split(" ")
        Data.push(fix)
    })

    $(".fix_red tr").slice(1).remove()

    Data.sort((a, b) => a[3] > b[3] ? 1 : -1)

    Data.forEach(function (fix) {
        Text = fix.join(" ")
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
        }
        else if ($(this).attr("class") == "other_fix_red_head") {
            $(".other_fix_red").find(".fix").toggle();
            $(".other_block_fix_red").toggle();
        }
    }
);

//[外部確定リスト追加]
function push_fixs(fixObj, fixArea) {
    if (!$("." + fixArea).val()) return 0;

    let Fixs = $("." + fixArea).val().split(/\r\n|\r|\n/);
    Fixs.sort((a, b) => {
        a = a.split(" ");
        b = b.split(" ");
        if (a.length == 3 && b.length == 3) return (a[2] > b[2] ? 1 : -1);
        if (a.length == 3 && b.length == 4) return (a[2] > b[3] ? 1 : -1);
        if (a.length == 4 && b.length == 4) return (a[3] > b[3] ? 1 : -1);
        if (a.length == 4 && b.length == 3) return (a[3] > b[2] ? 1 : -1);
    })

    Fixs.forEach(function (Text) {
        push_fix(fixObj, Text, "other");
    })
    $("." + fixArea).val("");
}

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
        if (fix.indexOf("other_") != -1) fix = fix.replace("other_", "");
        $(".other_" + fix).append('<tr><td class="fix">' + Text + "</td></tr>");
        if ($(".other_block_" + fix).is(":hidden")) $(".other_" + fix).find(".fix").hide();
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
    params.version = version;

    $.ajax({
        url: "http://ukagaka.sp.land.to/test.php",
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