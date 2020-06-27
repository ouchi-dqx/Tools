var Timers = {}

window.onload = function(){
    var Hour,Minute
    var Time = new Date()

    for(var i=1;i<8;i++){
        Time.setMinutes(Math.round(Time.getMinutes() / 10) * 10)
        Hour = ("0" + Time.getHours()).slice(-2) + ":"
        Minute = ("0" + Time.getMinutes()).slice(-2)
        $(".timeHeader").find("td").eq(i).text(Hour + Minute)
        Time.setMinutes(Time.getMinutes() + 10)
    }
}

$(document).on("click", ".setFix", function(){
    
    var whiteCnt,redCnt
    var Server = "1"
    var Point = "ゲル"
    var sTime = "2020/06/27 19:20:00"
    var eTime = "2020/06/27 20:10:00"
    var nowTime = new Date()
    sTime = new Date(sTime)
    eTime = new Date(eTime)

    if(nowTime>eTime){ //現在時間が終了時間より後
        return 0
    }
    if(nowTime<sTime){ //現在時間が開始時間より前
        whiteCnt = sTime.getTime() - nowTime.getTime()
        whiteCnt = Math.ceil(whiteCnt / (1000 * 60))
        whiteCnt += Number(("" + nowTime.getMinutes()).slice(-1))
        redCnt = (eTime.getTime() - sTime.getTime()) / (1000 * 60)
    }else{
        whiteCnt = 0       
        redCnt = nowTime.getTime() - sTime.getTime()
        redCnt = Math.round(redCnt / (1000 * 60))
        redCnt = (eTime.getTime() - sTime.getTime()) / (1000 * 60) - redCnt
        whiteCnt -= Number(("" + nowTime.getMinutes()).slice(-1))
    }

    var Time=""

    var White = '<td style="border-style:none;"></td>'
    var Red = '<td bgcolor="#EE0000" style="border-style:none;"></td>'

    var CopyTemp1 = $($("#template1").html()).clone()
    CopyTemp1.attr("id",Server + Point)
    CopyTemp1.find(".fixData").text(Server + Point + Time)

    for(let i=0; i<whiteCnt; i++){
        CopyTemp1.append(White)
    }
    for(let i=0; i<redCnt; i++){
        if(70-whiteCnt-1<i){
            break
        }else{
            CopyTemp1.append(Red)
        }
    }
    for(let i=0;i<70 - (whiteCnt + redCnt);i++){
        CopyTemp1.append(White)
    }

    $(".fix_List").append(CopyTemp1)
    
    /*
    Timers[Server + Point] = setInterval(function(){
        $(".fix#" + Server + Point).find("td").eq(1).remove()
        Time = $(".timeHeader").find("td").eq(7).text()//18:50
        Time = Time.replace(":","")

        eTime = new Date(eTime)
        eTime = ("0" + eTime.getHours()).slice(-2) + ":"
            + ("0" + eTime.getMinutes()).slice(-2)
        eTime = eTime.replace(":","")

        if(eTime>Time){
            $(".fix#" + Server + Point).append(Red)
        }else{
            $(".fix#" + Server + Point).append(White)
        }      
    },1000,Server,Point,eTime)   
    */
})
