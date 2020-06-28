var Timers = {}

window.onload = function(){
    updateTimeHeader()
}

$(document).on("click", ".setFix", function(){
    
    var whiteCnt,redCnt
    var Server = "1"
    var Point = "ゲル"
    var sTime = "2020/06/28 02:00:00"
    var eTime = "2020/06/28 03:41:00"
    var nowTime = new Date()
    sTime = new Date(sTime)
    eTime = new Date(eTime)
    var tmp

    if(nowTime>eTime){ //現在時間が終了時間より後
        return 0
    }
    if(nowTime<sTime){ //現在時間が開始時間より前
        whiteCnt = sTime.getTime() - nowTime.getTime()
        whiteCnt = Math.floor(whiteCnt / (1000 * 60))
        whiteCnt += Number(("" + nowTime.getMinutes()).slice(-1))
        redCnt = (eTime.getTime() - sTime.getTime()) / (1000 * 60)
    }else{
        whiteCnt = 0       
        //redCnt = (eTime.getTime() - sTime.getTime()) / (1000 * 60)
        redCnt = Math.floor((eTime.getTime() - nowTime.getTime()) / (1000 * 60))
        
    }

    alert(redCnt)

    sTime = ("0" + sTime.getHours()).slice(-2) + ":" + ("0" + sTime.getMinutes()).slice(-2)
    eTime = ("0" + eTime.getHours()).slice(-2) + ":" + ("0" + eTime.getMinutes()).slice(-2)
    var Time = "(" + sTime + "-" + eTime + ")"

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
        updateTimeHeader()
        $(".fix#" + Server + Point).find("td").eq(1).remove()
        Time = $(".TimeHeader").find("td").eq(7).text()
        Time = Time.replace(":","")

        eTime = eTime.replace(":","")
        
        if(eTime>Time){
            $(".fix#" + Server + Point).append(Red)
        }else{
            $(".fix#" + Server + Point).append(White)
        }
    },1000,Server,Point,eTime)   
    */
})

function updateTimeHeader(){
    var Hour,Minute
    var Time = new Date()

    for(var i=1;i<8;i++){
        Time.setMinutes(Math.floor(Time.getMinutes() / 10) * 10)
        Hour = ("0" + Time.getHours()).slice(-2) + ":"
        Minute = ("0" + Time.getMinutes()).slice(-2)
        $(".TimeHeader").find("td").eq(i).text(Hour + Minute)
        Time.setMinutes(Time.getMinutes() + 10)
    }
}