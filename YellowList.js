function Getter(num){
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycby0mRAp5wucNNkiM72RdMowNc-JRDQyE5ip46pC7uw/dev",
        type: "GET",
        dataType: "jsonp",
        data: {mode: "read", Server: num.value},
        success: res => {
            Loader(res.Array,num)
        }
    })
}

function Loader(Data,num){
    $(".ServerList ctr").slice(1).remove() //テーブルの初期化

    //サーバー行追加
    var CopyTemp,Point,check2,cnt
    var t = new Date()
    var check1 = ("0" + (t.getMonth() + 1)).slice(-2) + ""
                + ("0" + t.getDate()).slice(-2) + ""
                + ("0" + t.getHours()).slice(-2) + ""
                + ("0" + t.getMinutes()).slice(-2)
    num = Number(num.value) //数値型変換
    if(num != 0){ cnt = 10 }else{ num = 1;cnt = 40 }

    for(var Server=num; Server<num + cnt; Server++){
        CopyTemp = $($("#template1").html()).clone()
        CopyTemp.find(".Server").text("サーバー" + (Server))
        Point = 0 //初期化
        CopyTemp.find("p>.setTemp").each(function(){
            check2 = Data[Server - 1][Point].replace(/:|\s|\//g, "")
            if(check1 < check2){ //現在時間より先なら表示
                $(this).text(Data[Server - 1][Point])
            }else{
                $(this).text("--:--:--")
            }
            Point++
        })
        $(".ServerList").append(CopyTemp)
    }
}