function Getter(){
    $.ajax({
        url: "https://script.google.com/macros/s/AKfycbxlGCRghpYCAy7eyk0baCalwF0ZXjG_6tI-ZRVXdeiEo5kpUcw/exec",
        type: "GET",
        dataType: "jsonp",
        data: {mode: "read"},
        success: res => {
            alert(res.Array)
            alert(JSON.parse(res.Array))
            Loader(res.Array)
        }
    })
}

function Loader(Data){    
    $(".ServerList tr").slice(1).remove() //テーブルの初期化

    //サーバー行・時間追加
    var CopyTemp,ServerList
    var tmp1 = document.getElementById("template1")
    for(var i=0; i<40; i++){
        CopyTemp = tmp1.content.cloneNode(true)
        ServerList = document.getElementsByClassName("ServerList")
        ServerList[0].appendChild(CopyTemp)
    }

    var Server = 0
    $(".Servers").each(function(){
        $(this).find(".Server").text("サーバー" + Number(Server + 1))

        //if(Data[Server][0]){
            $(this).find(".ゲル>p>.setTemp").text(Data[Server][0])
        //}
        //if(Data[Server][1]){
            $(this).find(".砂漠>p>.setTemp").text(Data[Server][1])
        //}
        //if(Data[Server][2]){
            $(this).find(".バル>p>.setTemp").text(Data[Server][2])
        //}
        
        Server++
    })
}