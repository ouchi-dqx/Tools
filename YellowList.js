function Getter(num){
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxlGCRghpYCAy7eyk0baCalwF0ZXjG_6tI-ZRVXdeiEo5kpUcw/exec",
        type: "GET",
        dataType: "jsonp",
        data: {mode: "read", Server: num.value},
        success: res => {
            Loader(res.Array,num)
        }
    })
}

function Loader(Data,num){
    $(".ServerList tr").slice(1).remove() //テーブルの初期化

    //サーバー行追加
    var CopyTemp,Point,check3,cnt
    var check1 = new Date().getTime()
    var check2 = new Date()
    check2.setHours(check2.getHours() -1)
    check2.setMinutes(check2.getMinutes() -30)
    check2 = check2.getTime()
    num = Number(num.value) //数値型変換
    if(num != 0){ cnt = 10 }else{ num = 1;cnt = 40 }

    for(var Server=num; Server<num + cnt; Server++){
        CopyTemp = $($("#template1").html()).clone()
        CopyTemp.find(".Server").text("サーバー" + (Server))
        Point = 0 //初期化
        CopyTemp.find("p").each(function(){
            check3 = new Date("2020/" + Data[Server - 1][Point]).getTime()

            if(check1 < check3){ //現在時間より先なら表示
                $(this).text(Data[Server - 1][Point] + "まで")
                $(this).parents("td").css("background-color", "yellow")
            }else{
                if(check2 < check3){ //現在時間-1時間半より先なら表示
                    //$(this).text(Data[Server - 1][Point] + "")
                    //$(this).parents("td").css("background-color", "yellow")
                }else{
                    $(this).text("--:--:--")
                }
            }
            Point++
        })
        $(".ServerList").append(CopyTemp)
    }
}