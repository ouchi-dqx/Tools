function Sender(mode,Data,ListColumn){
    let sheetID = $("#sheetID").val()
    if(sheetID){
        sheetID = sheetID.match(/\/d\/[^\/]*/);
        sheetID = sheetID[0].replace("/d/","")

        if(ListColumn == "fix_red") ListColumn = 12
        if(ListColumn == "fix_blue") ListColumn = 14

        $.ajax({
            url: "https://script.google.com/macros/s/AKfycbxGwBzlzS2wA8zcnoyG9iCRY048zGrLuuPQAi-cBB3oVGuTi0nb/exec",
            type: "GET",
            dataType: "jsonp",
            data: {mode: mode, sheetID: sheetID, ListColumn: ListColumn, Data:Data},
        })
    }
}

$(function(){
    const observer = new MutationObserver(callback)
    function callback(mutations){
        var ListColumn = mutations[0].target.offsetParent.className
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                Sender("write", node.innerText, ListColumn)
            })
            mutation.removedNodes.forEach(node => {
                Sender("delete", node.innerText, ListColumn)
            })
        })
    }

    observer.observe($(".fix_blue")[0], {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
    });

    observer.observe($(".fix_red")[0], {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
    })
})