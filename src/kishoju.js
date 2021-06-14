//グローバル変数
var
    settings = {},              //オプション設定フラグ
    get_flg = false,            //URL取得モードフラグ
    share_flg = false,          //データ共有フラグ
    share_ID = "",              //データ共有用パス変数
    ptMODE = "",                //PTモード変数
    TMP = [],                   //履歴変数
    Timers = {},                //タイマーリスト変数
    side_mode = "default",      //サイドリストモード変数
    check_flg = false,          //タイマーチェックフラグ
    l_rightFollowFlg = false,   //サイドリスト追随中フラグ
    Socket;

//Socket.io本体
const Socket_URL = "https://ouchi-tools.herokuapp.com/";

//テスト用関数
function debug() { }

//クラスの実験中
class objManagerClass {
    constructor(objBox, newColor) {
        this.objBox = objBox;

        this.objTMP = {
            Server: objBox.closest("tr").attr("ServerID"),
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

        this.objData = Object.assign({}, this.objTMP);    //配列コピー
        this.objData.newDate = new Date().getTime();
        this.objData.newTime = TimePlus(new Date().getTime(), "00:00:00").Time;
        this.objData.newColor = newColor;
    }

    objData() { return this.objData; }
    TMP() { return this.TMP; }

    setTimeStamp(obj, Date, Time, Color) {
        obj = this.objBox.find("." + obj)[0]
        obj.setAttribute("Date", this.objData[Date]);
        obj.textContent = this.objData[Time];
        obj.style.background = this.objData[Color];
        obj.setAttribute("color", this.objData[Color]);
    }
}

//初回読込時設定
$(function () {
    try {
        $(".slider-title").click();
        const query = location.search.substring(1);
        if (query) getURLData(query);

        modeChange();           //4PT・8PT切替(デフォルト4PT)
        setInitMoveBtn();       //【NaL】調査マップ入替ボタンの活性切替
        sortPoint();            //場所の並び変更
        onFixListChangeEvent()  //青黄確定リスト変更イベント設定
        setServerLists();       //サーバーリスト読込み
        load_Storage();       //サーバーデータ読込み
        setRollbackEnable();    //【NaL】[戻す]ボタンの活性切替
        load_settings();        //オプション設定読込み
    }
    catch (e) { $(".message").text("Error:" + e.stack).show(); }
})

/********************ヘッダ部機能(リンク)********************/
//[共有表を作成]
function addShare() {
    const flg = confirm("青黄・確定の共有表を作成しますか？");
    if (flg) {
        const List = $(".other_fix_blue tr, .other_fix_red tr");
        if (List.length > 2) {
            const flg2 = confirm(
                "外部青黄・確定リストに既に内容が存在しています"
                + "\n 上書きしますか？"
            );
            if (!flg2) return 0;
        }

        $(".message").text("共有表を作成中...").show();
        Socket = io.connect(Socket_URL);
        Socket.emit("addShare", (res) => {
            if (res) {
                if (res.Err) {
                    alert("Error:" + res.Err);
                    $(".message").text("Error:" + res.Err).show();
                    return 0;
                }

                share_ID = res;
                share_flg = true;

                $(".message").text("共有表の作成に成功しました").show();
                $(".connectArea").find(".connectCount").show();
                $(".connectCount").text("1");
                $(".changeShare").show();
                $(".disconnect").show();
                $(".copyArea").show();
                $(".copyText").val(share_ID);
                $(".other_fix_blue").find(".fix").show();
                $(".other_fix_red").find(".fix").show();
                $(".block_other_fix_red").show();
                $(".block_other_fix_blue").show();

                updateList("GET");
            }
            else {
                alert("Error:Unknown Error")
                $(".message").text("Error:Unknown Error").show();
                return 0;
            }
        });
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
            const flg2 = confirm(
                "外部青黄・確定リストに既に内容が存在しています"
                + "\n 上書きしますか？"
            );
            if (!flg2) return 0;
        }

        $(".message").text("共有表に接続中...").show();
        Socket = io.connect(Socket_URL);
        Socket.emit("connectShare", share_ID, (res) => {
            if (res) {
                if (res.Err) {
                    alert("Error:" + res.Err);
                    $(".message").text("Error:" + res.Err);
                    return 0;
                }

                share_flg = true;
                $(".message").html("接続に成功しました");
                $(".connectArea").show();
                $(".connectCount").text(res.connectCount)
                $(".copyArea").hide();
                $(".changeShare").show();
                $(".disconnect").show();
                $(".other_fix_blue").find(".fix").show();
                $(".other_fix_red").find(".fix").show();
                $(".block_other_fix_red").show();
                $(".block_other_fix_blue").show();

                Object.keys(res.fixs).forEach((fix) => {
                    $(".other_" + fix + " tr").slice(1).remove();

                    res.fixs[fix].split(",").forEach((Text) => {
                        if (!Text) return 0;
                        Text = Text.split("#");
                        $(".other_" + fix).append("<tr><td class='fix'>" + Text[0] + "</td></tr>");
                    })
                })

                updateList("GET");
            }
            else {
                alert("Error:Unknown Error")
                $(".message").text("Error:Unknown Error").show();
                return 0;
            }
        });
    }
}

function updateList(mode, fix, Text) {
    if (share_flg) {
        if (mode == "GET") {
            Socket.on("connectEvent", (res) => $(".connectCount").text(res));

            Socket.on("ADD/DEL", (res) => {
                if (res.mode == "ADD") {
                    Text = res.Text.split("#");
                    $(".other_" + res.fix).append("<tr><td class='fix'>" + Text[0] + "</td></tr>");
                }
                else if (res.mode == "DEL") {
                    Text = res.Text.split("#");
                    $(".other_" + res.fix + " tr").filter((i, obj) => obj.textContent.split(" ")[0] == Text[0]).remove();
                }
            });
        }
        else if (mode == "ADD" || mode == "DEL") {
            const query = {
                mode: mode,
                share_ID: share_ID,
                fix: fix,
                Text: Text,
            };

            Socket.emit("ADD/DEL", query, (res) => {
                if (res.Err) {
                    alert("Error:" + res.Err);
                    $(".message").text("Error:" + res.Err);
                    return 0;
                }
            });
        }
    }
}

function changeShare() {
    const flg = confirm("共有表を複製しますか？(パスワードが変更されます)");
    if (flg) {
        $(".message").text("共有表を作成中...").show();
        Socket.emit("changeShare", share_ID, (res) => {
            share_ID = res;

            $(".message").text("共有表の作成に成功しました").show();
            $(".connectCount").text("1");
            $(".copyArea").show();
            $(".copyText").val(share_ID);
        });
    }
}

function disconnect() {
    const flg = confirm("共有表から切断しますか？");
    if (flg) {
        if (share_flg) {
            Socket.disconnect();
            Socket = ""
            share_ID = "";

            $(".message").text("接続を切断しました").show();
            $(".connectArea").hide();
            $(".disconnect").hide();
            $(".copyArea").hide();
            $(".changeShare").hide();
            $(".other_fix_blue").find(".fix").hide();
            $(".other_fix_red").find(".fix").hide();
            $(".block_other_fix_red").hide();
            $(".block_other_fix_blue").hide();
        }
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
                alert("Error:" + res.err);
                $(".message").text("Error:" + res.err).show();
                return 0;
            }

            if (res.HTMLData) {
                const script = document.createElement("script");
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

//[調査データをURL化] ***************************見直し対象
function getShortURL() {
    if ($(".ServerList").find(".Servers").length < 1) {
        alert("先に調査サーバーを選択してください。");
        return 0;
    }

    save_Storage();

    const
        Storage = localStorage.getItem("Storage"),
        fix_blue = localStorage.getItem("fix_blue"),
        fix_red = localStorage.getItem("fix_red");
    let btnText = $(".ServerLists").attr("mode");

    if (btnText == "PTselect") {
        btnText = "";
        $(".select-mode.PTselect input:checked").each(function () {
            btnText += $(this).val() + ",";
        });
    }

    const params = {
        mode: "shortURL",
        params: {
            ptMODE: ptMODE,
            btnText: btnText,
            Storage: Storage,
            fix_blue: fix_blue,
            fix_red: fix_red,
        }
    }

    /*
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
    */
}


/********************ヘッダ部機能(ボタン)********************/

//分散モード変更
$(document).on("change", ".mode-change-box input[name=opt-tgl]", modeChange);

//サーバー表示
$(document).on("click", ".setServers", function () {
    if (
        settings.splitMODE == "ON" && (
            $(".mode-change-box input[name=opt-tgl]:checked").val() != "PT4" ||
            $(this).text() == "9 - 10"
        )
    ) {
        alert("分割モード中は使えません");
        return 0;
    }

    //初期化
    $(".select-mode.PTselect input").prop("checked", false);
    $(".ServerLists").attr("mode", $(this).text());
    $(".ServerList .Servers").hide();
    $(".ServerList2 .Servers").hide();
    TMP = [];

    const
        Start = Number($(this).text().split(" - ")[0]),
        End = Number($(this).text().split(" - ")[1]);
    $(".Servers").each(function () {
        const Server = $(this).attr("ServerID");
        if (Start <= Server && Server <= End) $(this).show();
    })

    setRollbackEnable();  //【NaL】[戻す]ボタンの活性切替
})

//調査サーバー選択式
$(document).on(
    "change", ".select-mode.PTselect input", function () {
        if (settings.splitMODE == "ON") {
            alert("分割モード中は使えません");
            $(this).prop("checked", false);
            return 0;
        }

        const mode = $(".ServerLists").attr("mode");
        if (mode != "PTselect") {
            //初期化
            $(".ServerLists").attr("mode", ptMODE);
            $(".ServerList .Servers").hide();
            TMP = [];
        }

        const num = $(this).val();
        if ($(this).prop("checked")) $("[ServerID=" + num + "]").show();
        else $("[ServerID=" + num + "]").hide();
    }
)

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

//[全更新] ***************************見直し対象
$(document).on("click", ".btn_all", function () {
    const Rows = $(this).closest("tr").find(".template2-box")

    Rows.each(function () {
        const
            objManager = new objManagerClass($(this)),
            objList = objManager.objData;

        if (
            objList.nowColor != "" &&
            objList.nowColor != "transparent" &&
            objList.nowColor != "red" &&
            !(objList.befColor == "skyblue" && objList.nowColor == "yellow") &&
            !(objList.befColor == "red" && objList.nowColor == "yellow") &&
            !(objList.befColor == "violet" && objList.nowColor == "yellow")
        ) {
            objList.newColor = objList.nowColor;    //色継承

            TMP.push(objManager.objTMP)
            if (5 < TMP.length) TMP.shift()     //5個以上の保存データは末尾から削除
            setRollbackEnable();                //【NaL】[戻す]ボタンの活性切替
            timeStamp($(this), objList)
        }
    })
})

//[青～虹] ***************************見直し対象
$(document).on("click", ".btn", function () {
    const
        objBox = $(this).parents(".template2-box"),
        objManager = new objManagerClass(objBox, $(this).val());

    TMP.push(objManager.objTMP)
    if (5 < TMP.length) TMP.shift();    //5個以上の保存データは末尾から削除
    setRollbackEnable();                //【NaL】[戻す]ボタンの活性切替
    timeStamp(objBox, objManager.objData);
})


/********************サイド画面********************/
//[保存]
function save_Storage() {
    const
        Points = ["ゲル", "砂漠", "バル"],
        Storage = {};

    $(".Servers").each(function () {
        const Server = $(this).attr("ServerID");
        Storage[Server] = {};

        for (let i = 0; i < 3; i++) {
            const
                objBox = $(this).find("." + Points[i]).find(".template2-box"),
                objData = new objManagerClass(objBox).objData;

            Storage[Server][Points[i]] = objData;
        }
    })
    localStorage.setItem("Storage", JSON.stringify(Storage));
    save_Fix();
}

//[復元] ***************************見直し対象
function load_Storage(getData) {
    let Storage, fix_blue, fix_red;

    if (!get_flg) {
        Storage = JSON.parse(localStorage.getItem("Storage"));
        fix_blue = JSON.parse(localStorage.getItem("fix_blue"));
        fix_red = JSON.parse(localStorage.getItem("fix_red"));
    }
    else if (get_flg && getData) {
        Storage = getData.Storage;
        fix_blue = getData.fix_blue;
        fix_red = getData.fix_red;
    }
    else if (get_flg && !getData) return 0;

    if (Storage) {
        const Points = ["ゲル", "砂漠", "バル"];

        $(".Servers").each(function () {
            const
                Servers = $(this),
                Server = $(this).attr("ServerID");

            for (let i = 0; i < 3; i++) {
                const
                    objBox = $(Servers).find("." + Points[i]).find(".template2-box"),
                    objData = Storage[Server][Points[i]];

                objBox.find(".befTime")
                    .attr("Date", objData.befDate)
                    .text(objData.befTime)
                    .css("background-color", objData.befColor)
                    .attr("color", objData.befColor);
                objBox.find(".nowTime")
                    .attr("Date", objData.nowDate)
                    .text(objData.nowTime)
                    .css("background-color", objData.nowColor)
                    .attr("color", objData.nowColor);
                objBox.find(".memo")
                    .text(objData.memo)
                    .attr("Date", objData.memoDate)
                    .css("background-color", objData.memoColor)
                    .attr("color", objData.memoColor)
                    .attr("memoflg", objData.memoflg)
                    .attr("memofix", objData.memofix);
                objBox.find(".memo2").val(objData.memo2);

                if (objData.nowColor == "red") {
                    objBox.find(".btn[value=red]").prop("disabled", true);
                    Timers[Server + Points[i]] = setInterval(setTimer, 1000, objBox);
                }
                if (objData.memoflg) {
                    const diffTime = objData.memoDate - new Date().getTime();

                    if (diffTime > 0) {
                        switch (objData.memoflg) {
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
                            newColor = (objData.memoflg == "red_blue") ?
                                "blue" : (objData.memoflg == "yellow_red") ?
                                    "red" : "yellow";

                        objBox.find(".befTime")
                            .attr("Date", objData.nowDate)
                            .text(objData.nowTime)
                            .css("background-color", objData.nowColor)
                            .attr("color", objData.nowColor);
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
                        objBox.find(".memo2").val(objData.memo2);
                    }
                }
            }
        })
    }

    //リスト初期化・挿入
    $(".fix_blue tr").slice(1).remove();
    fix_blue.forEach(function (Text) { push_fix("fix_blue", Text, "fix"); })
    $(".fix_red tr").slice(1).remove();
    fix_red.forEach(function (Text) { push_fix("fix_red", Text, "fix"); })
}

//[戻す]#直前の状態に戻す ***************************見直し対象
function Rollback() {
    if (TMP.length > 0) {
        const n = TMP.length - 1;

        $(".Servers:visible").each(function () {
            if (TMP[n].Server == $(this).attr("ServerID")) {
                const
                    objBox = $(this).find("." + TMP[n].Point).find(".template2-box"),
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
//リスト表示切替(HEAD)
$(document).on(
    "click",
    ".fix_blue_head, .fix_red_head, .other_fix_blue_head, .other_fix_red_head",
    function () {
        if (!l_rightFollowFlg) {
            const
                fix = $(this).attr("class").replace("_head", ""),
                visible = $("." + fix + " tbody").find(".fix").is(":visible");
            if (visible) {
                $("." + fix).find(".fix").hide();
                $(".block_" + fix).hide();
            }
            else {
                $("." + fix).find(".fix").show();
                $(".block_" + fix).show();
            }
        }
    }
);

//リスト表示モード切替
$(document).on("click", ".chk-Box", function () {
    const
        bFlg = $(this).prop("checked"),
        fix = $(this).val();

    if (bFlg === false) {
        $(this).next().html("全部表示しない");
        settings.ListSetting[fix].scrollMode = "OFF";

        const
            maxHeight = settings.ListSetting[fix].scrollHeight,
            maxLength = maxHeight / 24,
            nowLength = $("." + fix + " tr").length - 1;

        if (nowLength > maxLength) {
            $("." + fix + " tbody").css("display", "block");
            $("." + fix + " tbody").css("height", maxHeight + "px");
            $(".scroll_" + fix).find(".chk-tgl-span button").prop("disabled", false);
        }
    }
    else {
        $(this).next().html("全部表示する");
        settings.ListSetting[fix].scrollMode = "ON";

        $("." + fix + " tbody").css("display", "");
        $("." + fix + " tbody").css("height", "0px");
        $(".scroll_" + fix).find(".chk-tgl-span button").prop("disabled", true);
    }

    localStorage.setItem("settings", JSON.stringify(settings));
});

//青黄確定リストスクロール幅変更
$(document).on("click", ".chk-tgl-span button", function () {
    const
        scroll_mode = $(this).attr("class"),
        fix = $(this).parents(".function-btn-box-mini").attr("target"),
        nowLength = $("." + fix + " tbody").css("height").replace("px", "") / 24;

    if (scroll_mode == "up") {
        if (nowLength > 3) {
            $("." + fix + " tbody").css("height", (nowLength - 1) * 24 + "px");
            settings.ListSetting[fix].scrollHeight = (nowLength - 1) * 24;
        }
        else return 0;
    }
    else if (scroll_mode == "down") {
        if (nowLength > 2) {
            $("." + fix + " tbody").css("height", (nowLength + 1) * 24 + "px");
            settings.ListSetting[fix].scrollHeight = (nowLength + 1) * 24;
        }
        else return 0;
    }

    localStorage.setItem("settings", JSON.stringify(settings));
});

//(青黄/確定）テーブルクリックイベント#コピー/削除
$(document).on("click", ".fix", function () {
    let flg = confirm("コピーor削除を行いますか？\nOK=コピー キャンセル=削除");

    if (flg) TextCopy($(this).text() + "\n");
    else {
        flg = confirm("本当に削除していいですか？");
        if (flg) {
            const
                fix = $(this).closest("table").attr("class").replace("other_", ""),
                Text = $(this).text().split(" ");

            clear_fix(fix, Text[0]);
        }
    }

    save_Fix();
})

//[外部確定リスト 一括追加]
$(document).on("click", ".push_fixs", function () {
    const textArea = $(this).parents("div[class^=block_other_fix_]").find("textarea");
    let fix = $(this).parent("div").attr("target");

    if (!textArea.val()) return 0;

    let Text = textArea.val().split(/\r\n|\r|\n/);
    Text = Text
        .sort((a, b) => {
            a = a.split(" ");
            b = b.split(" ");
            if (a.length == 3 && b.length == 3) return (a[2] > b[2] ? 1 : -1);
            if (a.length == 3 && b.length == 4) return (a[2] > b[3] ? 1 : -1);
            if (a.length == 4 && b.length == 4) return (a[3] > b[3] ? 1 : -1);
            if (a.length == 4 && b.length == 3) return (a[3] > b[2] ? 1 : -1);
        })
        .filter((Text) => Text !== "");
    Text.forEach((Text) => $("." + fix).append("<tr><td class='fix'>" + Text + "</td></tr>"))
    Text = Text.join(",");

    fix = fix.replace("other_", "");
    if (share_flg) updateList("ADD", fix, Text);
    textArea.val("");
})

//InputBoxテキストセット ***************************見直し対象
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

//[追加]#確定リスト追加処理 ***************************見直し対象
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
    let flg = true;

    if (TMP.length > 0) flg = false; //TMPの中身がないときだけ非活性
    $("#btn-rollback").prop("disabled", flg);
}

//URLパラメータ抽出 ***************************見直し対象
function getURLData(params) {
    const
        btnText = getParam("btnText", params),
        getData = {
            Storage: JSON.parse(getParam("Storage", params)),
            fix_blue: JSON.parse(getParam("fix_blue", params)),
            fix_red: JSON.parse(getParam("fix_red", params)),
        };

    //パラメータチェック
    if (
        !ptMODE || !getData.Storage ||
        !getData.fix_blue || !getData.fix_red
    ) {
        $(".message").text("ERROR:不正なURLです").show();
        return 0;
    }

    get_flg = true;
    ptMODE = getParam("ptMODE", params);
    $(".mode-change-box input[value=" + ptMODE + "]").prop("checked", true);
    $("#" + btnText).click();

    load_Storage(getData);
}

//パラメータ値抽出 ***************************見直し対象
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
        if (settings.splitMODE && settings.splitMODE == "ON") {
            $(document).find(".split").click();
        }

        //偶数奇数モードフラグ
        if (settings.even_oddMODE && settings.even_oddMODE == "ON") {
            $(document).find(".even_odd").prop("checked", true);
            tSort("even_odd");
        }

        //メモ欄2表示モードフラグ
        if (settings.memo2_display && settings.memo2_display == "show") {
            $(document).find(".tgl_memo2").prop("checked", true);
            $(".memo2").css("display", "inline-block");
        }

        //自動更新モードフラグ
        Mode.forEach(Mode => {
            if (["auto"] in settings && [Mode] in settings["auto"]) {
                if (settings.auto[Mode] == "ON")
                    $(document).find(".auto." + Mode).prop("checked", true);
            }
        })

        //青黄確定リストモードフラグ
        $(".chk-tgl-span button").prop("disabled", true);
        if (settings.ListSetting) {
            objList.forEach(fix => {
                if ([fix] in settings["ListSetting"]) {
                    if (!settings.ListSetting[fix].scrollHeight)
                        settings.ListSetting[fix].scrollHeight = 6 * 24;

                    //全部表示する/しない設定
                    if (settings.ListSetting[fix].scrollMode == "ON")
                        $(document).find(".scroll_" + fix + " input").click();
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

//青黄確定リスト変更イベント
function onFixListChangeEvent() {
    const
        observer = new MutationObserver((elem) => {
            elem.forEach(elem => {
                const
                    fix = $(elem.target).parents("table").attr("class"),
                    scroll_flg = $(".scroll_" + fix).find(".chk-Box").prop("checked"),
                    visible = $(".scroll_" + fix).is(":visible");

                if (!scroll_flg && visible) {
                    const
                        maxHeight = settings.ListSetting[fix].scrollHeight,
                        maxLength = maxHeight / 24,
                        nowLength = $("." + fix + " tr").length - 1;

                    if (nowLength > maxLength) {
                        $("." + fix + " tbody").css("display", "block");
                        $("." + fix + " tbody").css("height", maxHeight + "px");
                        $(".scroll_" + fix).find(".chk-tgl-span button").prop("disabled", false);
                    }
                }
                else if (!l_rightFollowFlg) {
                    $("." + fix + " tbody").css("display", "");
                    $("." + fix + " tbody").css("height", "0px");
                    $(".scroll_" + fix).find(".chk-tgl-span button").prop("disabled", true);
                }
            })
        }),
        config = {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true
        };

    observer.observe($(".fix_blue")[0], config);
    observer.observe($(".fix_red")[0], config);
    observer.observe($(".other_fix_blue")[0], config);
    observer.observe($(".other_fix_red")[0], config);
}

/********************ヘッダ部関係********************/
//[4人分散/8人分散/選択式分散]#PTモード変更
function modeChange() {
    //【NaL】モード切替スイッチ追加に伴う変更
    ptMODE = $(".mode-change-box input[name=opt-tgl]:checked").val();
    $(".select-mode").hide();                    //一旦すべて非表示
    $(".select-mode" + "." + ptMODE).show();    //選択モードのみ表示
}

/********************メイン機能関係********************/
//選択リスト・サーバーリスト読込み
function setServerLists() {
    for (let i = 1; i <= 40; i++) {
        //鯖選択チェックボックス追加
        $(".select-mode.PTselect").append(i + "<input type='checkbox' value='" + i + "'></input >");
        if (i % 10 == 0) $(".select-mode.PTselect").append("<br>")

        //鯖リスト読み込み
        const CopyTemp1 = $($("#template1").html()).clone();
        CopyTemp1.attr("ServerID", i);
        CopyTemp1.find(".Title").text(i);
        CopyTemp1.find(".setTemp").each(function () {
            const CopyTemp2 = $($("#template2").html()).clone();
            $(this).append(CopyTemp2);
        })

        $(".ServerList tbody").append(CopyTemp1);
    }
    $(".ServerList .Servers").hide();
}

//ポイント移動処理 ***************************見直し予定
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

//テーブルの分割表示
function splitTable() {
    if (settings.splitMODE == "ON") {
        save_Storage();
        $("body").css("max-width", "1300px");

        let cnt = 1;
        for (let i = 1; i <= 40; i++) {
            if (cnt > 5 && cnt < 11) {
                $(".ServerList")
                    .find("[ServerID=" + i + "]")
                    .appendTo(".ServerList2 tbody");
                cnt++
            }
            else if (cnt > 10) {
                cnt = 1;
                i--;
            }
            else cnt++;
        }

        $(".ServerList2").show();
    }
    else {
        save_Storage();
        $("body").css("max-width", "650px");

        $(".ServerList2 .Servers").each(function () {
            $(this).appendTo(".ServerList tbody");
        })
        $(".ServerList tbody").html(
            $(".Servers").sort(function (a, b) {
                a = $(a).attr("ServerID");
                b = $(b).attr("ServerID");
                return a - b;
            })
        )

        $(".ServerList2").hide();
    }
}

//偶数・奇数入替処理
function tSort(mode) {
    $(".ServerList tbody").html(
        $(".Servers").sort((a, b) => {
            if (mode == "default") {
                a = $(a).attr("ServerID");
                b = $(b).attr("ServerID");
                return a - b;
            }
            if (mode == "even_odd") {
                if (ptMODE == "PT4") {
                    a = $(a).attr("ServerID") % 2;
                    b = $(b).attr("ServerID") % 2;
                    return b - a;
                }
            }
        })
    );
}

//タイムスタンプ設定 //***************************見直し待機
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

    $(".Servers").find(".template2-box").removeClass("sel");
    objBox.addClass("sel");

    save_Storage(true);
}

//時間計算 //***************************見直し待機
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

//タイマ設置 //***************************見直し待機
function setTimer(objBox) {
    const
        Server = objBox.closest("tr").attr("ServerID"),
        Point = objBox.closest("td").attr("class"),
        newDate = new Date().getTime(),
        nowDate = objBox.find(".nowTime").attr("Date"),
        nowTime = objBox.find(".nowTime").text(),
        diffTime = newDate - nowDate,
        Hour = diffTime / (1000 * 60 * 60),
        Minute = (Hour - Math.floor(Hour)) * 60,
        Second = (Minute - Math.floor(Minute)) * 60,
        Time = ("00" + Math.floor(Hour)).slice(-2) + ":"
            + ("00" + Math.floor(Minute)).slice(-2) + ":"
            + ("00" + Math.round(Second)).slice(-2);

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

//メモ1更新タイマ //***************************見直し待機
function memoTimer(objBox, Color) {
    const
        Server = objBox.closest("tr").attr("ServerID"),
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

//タイマー不具合チェック //***************************見直し待機
function checkTimer() {

    if (check_flg == false) {
        setInterval(() => {
            const Points = ["ゲル", "砂漠", "バル"];

            $(".Servers").each(function () {
                for (let i = 0; i < 3; i++) {
                    const
                        objBox = $(this).find("." + Points[i]).find(".template2-box"),
                        objData = new objManagerClass(objBox).Data,
                        newDate = new Date().getTime();

                    if (objData.memoDate && newDate > objData.memoDate) {
                        clearTimeout(Timers[objData.Server + Points[i]]);
                        Timers[objData.Server + Points[i]] = setTimeout(memoTimer, 1000, objBox, objData.memoflg);
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

    if (flg == "fix" || flg == "all") {
        $("." + fix).append("<tr><td class='fix'>" + Text[0] + "</td></tr>");
        if ($(".block_" + fix).is(":hidden")) $("." + fix).find(".fix").hide();
    }
    if (flg == "other" || flg == "all") {
        if (fix.indexOf("other_") != -1) fix = fix.replace("other_", "");
        $(".other_" + fix).append("<tr><td class='fix'>" + Text[0] + "</td></tr>");
        if ($(".block_other_" + fix).is(":hidden")) $(".other_" + fix).find(".fix").hide();

        if (share_flg) {
            Text = Text.join("#");
            updateList("ADD", fix, Text);
        }
    }
}

//サイドリストの高さ調整
$(window).on("resize maximize", fncFixRedReSize);

//サイドリスト（右側固定時）の高さ設定
function fncFixRedReSize() {
    if (l_rightFollowFlg === true) {
        //高さ設定
        let h = $(window).height() - 470;
        //20以下には縮めない
        if (h <= 20) { h = 20; }
        $("#fix-red, #other_fix_red").children("tbody").height(h);
    }
}

//サイドリスト追随モード切替
$(document).on("click", "#chk-side-follow", function () {
    const
        MODE_ON = "following-on",    //ついてくるClass名
        MODE_OFF = "following-off";  //ついてこないClass名

    //追随切替
    l_rightFollowFlg = $("#chk-side-follow").prop("checked");
    if (l_rightFollowFlg === true) {
        $(".side-list-box, .side-list-area").removeClass(MODE_OFF);
        $(".side-list-box, .side-list-area").addClass(MODE_ON);
        $(".hung-icon_other").hide();

        if (side_mode == "default") {
            $(".side-list-box").hide();
            $(".side-list-area").css("height", "80px");
            $(".side-list-area").find(".hung-icon").toggleClass("rev"); //アイコン反転
            $(".side-list-area").find(".hung-icon_other").show();
        }
        else if (side_mode == "fix_box") {
            $(".fix_box").show();
            $(".other_fix_box").hide();
        }
        else {
            $(".fix_box").hide();
            $(".other_fix_box").show();
            $(".block_other_fix_blue, .block_other_fix_red").show();
        }

        fncFixRedReSize();
    }
    else {
        $(".side-list-box, .side-list-area").removeClass(MODE_ON);
        $(".side-list-box, .side-list-area").addClass(MODE_OFF);
        $(".fix_box, .other_fix_box").show();
        $(".fix_blue tbody, .fix_red tbody, .other_fix_blue tbody, .other_fix_red tbody").css("height", "");
    }
})

//サイドリスト収納切替
$(document).on("click", ".side-list-btn", function () {
    const target = $(this).attr("target");

    $(".side-list-box").animate({ width: "toggle" }, "fast", function () {
        const visible = $(".side-list-box").is(":visible");

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
            $(".side-list-area").find(".hung-icon_other").hide();
        }
        else {
            $(".side-list-area").css("height", "80px");
            $(".side-list-area").find(".hung-icon_other").show();
        }
    });

    $(".side-list-area").find(".hung-icon").toggleClass("rev");     //アイコン反転
})

//機能リスト-[戻す]
$(document).on("click", ".func-list-area", Rollback);


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

//入力情報のクリア
function Cleaner(target) {
    const flg = confirm("ブラウザ上の入力情報と保存情報がクリアされます。よろしいですか？");

    if (flg) {
        if (target == "all") {
            clear_input("all");
            clear_fixs();
        }
        else if (target == "input") clear_input();
        else clear_fixs(target);

        save_Storage();
    }
}

//チェックリストのクリア
function clear_input(MODE) {
    if (MODE != "all" && !$(".Servers").is(":visible")) {
        alert("先に調査サーバーを選択してください。");
        return 0;
    }

    $(".Servers").find(".template2-box").removeClass("sel");
    clearInterval(Timers);
    TMP = [];
    share_flg = false;

    $(".Servers").each(function () {
        const
            Server = $(this).attr("ServerID"),
            Points = ["ゲル", "砂漠", "バル"];
        let visible;

        if (MODE == "all") visible = true;      //全削除
        else visible = $(this).is(":visible");  //表示中のものだけ選択

        if (visible) {
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
                clearInterval(Timers[Server + Point]);  //タイマー初期化
            })
        }
    })
    setRollbackEnable(); //【NaL】[戻す]ボタンの活性切替
}

//[(青黄/確定リスト)クリア]
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

//(青黄/確定リスト)選択クリア
function clear_fix(fix, Text) {
    $("." + fix).find(".fix").each(function () {
        let objText = $(this).text().split(" ");
        if (objText[0] == Text) $(this).closest("tr").remove();
    })
    $(".other_" + fix).find(".fix").each(function () {
        let objText = $(this).text().split(" ");
        if (objText[0] == Text) {
            $(this).closest("tr").remove();
            if (share_flg) updateList("DEL", fix, Text);
        }
    })
}

//[(青黄/確定リスト)コピー]
function setClip(fix) {
    let Text = "";

    $("." + fix).find(".fix").each(function () {
        Text += $(this).text() + "\n";
    });

    TextCopy(Text);
}

//(確定/青黄リスト)保存
function save_Fix() {
    const
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
    if ($(this).prop("checked")) {
        if (settings.even_oddMODE == "ON") {
            alert("偶数奇数モード中は使用できません");
            $(this).prop("checked", false);
            return 0;
        }

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
    if ($(this).prop("checked")) {
        if (settings.splitMODE == "ON") {
            alert("分割モード中は使用できません");
            $(this).prop("checked", false);
            return 0;
        }

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
    if ($(this).prop("checked")) {
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

//自動更新モード切替 ***************************見直し対象
$(document).on("click", ".toggle_switch .auto", function () {
    if ($(this).prop("checked")) {
        if ($(this).attr("class") == "auto yellow_red") {
            alert("メンテナンス中です");
            $(this).prop("checked", false);
            return 0;
            if (settings.auto["blue_yellow"] == "OFF") {
                alert("青黄→黄自動更新モードがONになっていません");
                $(this).prop("checked", false);
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
        MODE_ON = "following-on",
        MODE_OFF = "following-off";

    if ($(this).prop("checked")) {
        $(".func-list-area").removeClass(MODE_OFF);
        $(".func-list-area").addClass(MODE_ON);
        settings.showUndoBtn = "ON";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
    else {
        $(".func-list-area").removeClass(MODE_ON);
        $(".func-list-area").addClass(MODE_OFF);
        settings.showUndoBtn = "OFF";
        localStorage.setItem("settings", JSON.stringify(settings));
    }
})


/********************スライドBOX********************/
//スライドBOX（使い方／更新履歴）開閉
$(document).on("click", ".slider-title", function () {
    $(this).next(".slider-box").slideToggle("fast");
    $(this).find(".slider-icon").toggleClass("rev");    //アイコン反転
})


/********************汎用関数********************/
//ajax通信 **送信先調整
function xhrSend(params, resFunc) {
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxAAOEdydyuV7p9sy7v4VhA_xEoHv_E3OVe3O_IuUoNI_A2XRZyv5ao9EtVCcd1dB6s/exec",
        async: false,
        cache: false,
        type: "GET",
        dataType: "json",
        contentType: "application/json",
        data: params,
        beforeSend: XMLHttpRequest => {
            //iPhone周りのエラー対策
            if (window.navigator.userAgent.toLowerCase().indexOf("safari") != -1)
                XMLHttpRequest.setRequestHeader("If-Modified-Since", new Date().toUTCString())
        },
        success: (res) => resFunc(res),
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

//コピー処理
function TextCopy(Text) {
    const promise = new Promise((resolve, reject) => {
        navigator.clipboard.writeText(Text);
        resolve(Text);
    });

    promise.then((str) => {
        if (!str || typeof (str) != "string") return "";

        //strを含んだtextareaをbodyタグの末尾に設置
        $(document.body).append("<textarea id=\"tmp_copy\" style=\"position:fixed;right:100vw;font-size:16px;\">" + str + "</textarea>");

        let target = document.querySelector("#tmp_copy");
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