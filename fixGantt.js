var Timers = {}

$(document).on("click", ".setFix", function(){
    
    var Server = "1"
    var Point = "ゲル"
    var befTime = "22:00:00"
    var nowTime = "22:20:00"
    var tbefTime = new Date("2020/06/25 " + befTime)
    var tnowTime = new Date("2020/06/25 " + nowTime)
    var tnewTime = new Date()
    var Time = "(" + befTime.slice(0,-3) + "-" + nowTime.slice(0,-3) + ")"
    var diffTime = tnowTime.getTime() - tbefTime.getTime()
    diffTime = diffTime / (1000 * 60)
    var diffTime2 = tbefTime.getTime() - tnewTime.getTime()
    diffTime2 = Math.ceil(diffTime2 / (1000 * 60))

    var White = '<td style="border-style:none;"></td>'
    var Red = '<td bgcolor="#EE0000" style="border-style:none;"></td>'

    var CopyTemp1 = $($("#template1").html()).clone()
    CopyTemp1.attr("id",Server + Point)
    CopyTemp1.find(".fixData").text(Server + Point + Time)
    for(let i=0; diffTime2>i; i++){
        CopyTemp1.append(White)
    }
    for(let i=0; diffTime>i; i++){
        CopyTemp1.append(Red)
    }
    for(let i=0;50-(diffTime + diffTime2)>i;i++){
        CopyTemp1.append(White)
    }

    $(".fix_List").append(CopyTemp1)


    

    Timers[Server + Point] = setInterval(function(){
        $(".fix#" + Server + Point).find("td").eq(1).remove()
            
    },1000,Server,Point)


    

})
