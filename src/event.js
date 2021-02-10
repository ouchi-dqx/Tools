var
    ptMODE = "",        //PTモード変数
    even_oddMODE = "",  //並びの偶数モード/奇数モード切替フラグ
    TMP = [],           //履歴変数
    Timers = {},        //タイマーリスト変数
    get_flg = false,    //URL取得モードフラグ
    share_flg = false,  //データ共有フラグ
    share_ID = "";          //データ共有用パス
//var sendFlg = "";     //データ送信フラグ-没

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
        }

        $(".message").text("共有表を作成中...").show();
        xhrSend(params, (res) => {
            if (res) {
                share_flg = true;
                share_ID = res.share_ID;

                $(".message").hide();
                $(".copyText").val(share_ID);
                $(".copyArea").show()
                $(".other_fix_blue").find(".fix").show();
                $(".other_block_fix_blue").show();
                $(".other_fix_red").find(".fix").show();
                $(".other_block_fix_red").show();

                updateList("GET");
                clearInterval(Timers.updateTime);
                Timers.updateTime = setInterval(updateList, 60000, "GET");
            }
        })
    }
}

//[共通表に参加]
function connectShare() {
    share_ID = window.prompt("パスワードを入力してください");
    if (share_ID) {
        const params = {
            mode: "connectShare",
            share_ID: share_ID,
        }

        $(".message").text("共有表にアクセス中...").show();
        xhrSend(params, (res) => {
            if (res) {
                share_flg = true;
                share_ID = res.share_ID;

                $(".message").text("接続に成功しました");
                $(".other_fix_blue").find(".fix").show();
                $(".other_block_fix_blue").show();
                $(".other_fix_red").find(".fix").show();
                $(".other_block_fix_red").show();

                updateList("GET");
                clearInterval(Timers.updateTime);
                Timers.updateTime = setInterval(updateList, 60000, "GET");
            }
            else {
                $(".message").hide()
                share_ID = "";
                alert("パスワードが違います");
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
        }

        xhrSend(params, (res) => {
            if (res) {
                if (res[0].error) {
                    $(".message").text("Error:" + res[0].error).show();
                    return 0;
                }
                else $(".message").hide();

                const
                    fix_blue = res.fix_blue.split(","),
                    fix_red = res.fix_red.split(",");

                $(".other_fix_blue tr").slice(1).remove();
                $(".other_fix_red tr").slice(1).remove();

                fix_blue.each(function (Text) {
                    $(".other_fix_blue").append('<tr><td class="fix">' + Text + "</td></tr>");
                })
                fix_red.each(function (Text) {
                    $(".other_fix_red").append('<tr><td class="fix">' + Text + "</td></tr>");
                })
            }
        })
    }
}

//[関係者向け]#廃止
function LoginCheck() {
    const pass = window.prompt("パスワードを入力してください")
    if (pass) {
        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbwCz56sXENejr9tHKjg8eoG8PdiBcN4HHo7FKf6JetXj3smgBVDR68K/exec",
            type: "GET",
            dataType: "jsonp",
            data: { mode: "login", pass: pass },
            success: res => {
                if (res.HTMLData) {
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

    const boxName = $(".ServerList").attr("id"),
        Storage = localStorage.getItem(boxName),
        fix_blue = localStorage.getItem("fix_blue"),
        fix_red = localStorage.getItem("fix_red"),
        btnText =
            $(".ServerID:visible").first().text() + " - "
            + $(".ServerID:visible").last().text();

    const params = {
        mode: "shortURL",
        params: deflate(
            "ptMODE=" + ptMODE
            + "&btnText=" + btnText
            + "&boxName=" + boxName
            + "&Storage=" + Storage
            + "&fix_blue=" + fix_blue
            + "&fix_red=" + fix_red
        )
    };

    $(".message").text("URLを取得中...").show();
    xhrSend(params, (res) => {
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
    if (ptMODE == "PT8") $(".even_odd").prop("disabled", true);
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

    Rows.each(function (objBox) {
        const
            Cell = new Cells(objBox),
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
        + sTime.val() + " - " + eTime.val()
    push_fix("fix_red", Text, "fix");

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

//外部確定リスト表示切替
$(document).on("click", ".other_fix_blue_head, .other_fix_red_head", function () {
    if ($(this).attr("class") == "other_fix_blue_head") {
        $(".other_fix_blue").find(".fix").toggle();
        $(".other_block_fix_blue").toggle();
    }
    else if ($(this).attr("class") == "other_fix_red_head") {
        $(".other_fix_red").find(".fix").toggle();
        $(".other_block_fix_red").toggle();
    }
});

//[外部確定リスト追加]
function push_fixs(fixObj, fixArea) {
    if (!$("." + fixArea).val()) return 0;

    let Fixs = $("." + fixArea).val().split(/\r\n|\r|\n/);
    Fixs.sort((a, b) => {
        a = a.split(" ");
        b = b.split(" ");
        return (a[3] > b[3] ? 1 : -1);
    })

    Fixs.forEach(function (Text) {
        push_fix(fixObj, Text, "other");
    })
    $(".push_fixs").val("");
}