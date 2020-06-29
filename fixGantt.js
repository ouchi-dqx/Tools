var Timers = {}

window.onload = function(){
    updateGantt()
    setInterval(updateGantt,1000*60)
}

function updateGantt(){
    var Hour,Minute,Space
    var Time = new Date()
    for(var i=1;i<8;i++){
        Space = ""
        if(i == 1){
            Minute = 10 - ("0" + Time.getMinutes()).slice(-1)
            for(let n=0; n<Minute; n++){
                Space += "&nbsp;"
            }
            $(".TimeHeader").find("td").eq(i).html(Space)
            $(".TimeHeader").find("td").eq(i).attr("colspan", Minute)
        }else
        if(i == 7){
            Minute = ("0" + Time.getMinutes()).slice(-1)
            for(let n=0; n<Minute; n++){
                Space += "&nbsp;"
            }
            $(".TimeHeader").find("td").eq(i).html(Space)
            $(".TimeHeader").find("td").eq(i).attr("colspan", Minute)
            
            var Dates = Time.getFullYear() + "/" 
                + ("0" + Number(Time.getMonth() + 1)).slice(-2) + "/" 
                + ("0" + Time.getDate()).slice(-2) + " "
                + ("0" + Time.getHours()).slice(-2) + ":"
                + ("0" + Time.getMinutes()).slice(-2) + ":"
            $(".TimeHeader").find("td").eq(i).attr("Date", Dates)
        }else{
            Hour = ("0" + Time.getHours()).slice(-2) + ":"
            Minute = ("0" + Math.floor(Time.getMinutes() / 10) * 10).slice(-2)
            $(".TimeHeader").find("td").eq(i).text(Hour + Minute)
        }
        Time.setMinutes(Time.getMinutes() + 10)
    }

    /*
    $(".fix#" + Server + Point).find("td").eq(1).remove()
    var Time = $(".TimeHeader").find("td").eq(7).attr("Date")
    var nowTime = new Date().getTime()
    Time = new Date(Time).getTime()
    eTime = new Date(eTime).getTime()
    
    if(eTime>Time){
        $(".fix#" + Server + Point).append(Red)
    }else{
        $(".fix#" + Server + Point).append(White)
    }

    if(eTime<nowTime){
        $(".fix#" + Server + Point).remove()
    }
    */
}

$(document).on("click", ".setFix", function(){
    var whiteCnt,redCnt
    var Server = "1"
    var Point = "ゲル"
    var sTime = "2020/06/29 21:26"
    var eTime = "2020/06/29 21:32"
    var nowTime = new Date()
    sTime = new Date(sTime)
    eTime = new Date(eTime)

    if(nowTime>eTime){ //現在時間が終了時間より後
        return 0
    }
    if(nowTime<sTime){ //現在時間が開始時間より前
        whiteCnt = sTime.getTime() - nowTime.getTime()
        whiteCnt = Math.ceil(whiteCnt / (1000 * 60))
        redCnt = (eTime.getTime() - sTime.getTime()) / (1000 * 60)
    }else{
        whiteCnt = 0       
        redCnt = eTime.getTime() - nowTime.getTime()
        redCnt = Math.ceil(redCnt / (1000 * 60))
    }

    var sText = ("0" + sTime.getHours()).slice(-2) + ":" + ("0" + sTime.getMinutes()).slice(-2) 
    var eText = ("0" + eTime.getHours()).slice(-2) + ":" + ("0" + eTime.getMinutes()).slice(-2)
    var Text = "(" + sText + "-" + eText + ")"

    var White = '<td style="border-style:none;"></td>'
    var Red = '<td bgcolor="#EE0000" style="border-style:none;"></td>'

    var CopyTemp1 = $($("#template1").html()).clone()
    CopyTemp1.attr("id",Server + Point)
    CopyTemp1.find(".fixData").text(Server + Point + Text)

    for(let i=0; i<whiteCnt; i++){
        CopyTemp1.append(White)
    }
    for(let i=0; i<redCnt; i++){
        if(60-whiteCnt-1<i){
            break
        }else{
            CopyTemp1.append(Red)
        }
    }
    for(let i=0;i<60 - (whiteCnt + redCnt);i++){
        CopyTemp1.append(White)
    }

    $(".fix_List").append(CopyTemp1)
})

