$(function(){
    const observer = new MutationObserver(callback)
    function callback(mutations){
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                alert(node.innerText)
            })
            mutation.removedNodes.forEach(node => {
                alert(node.innerText)
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