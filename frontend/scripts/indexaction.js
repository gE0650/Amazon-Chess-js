const preboxes = document.querySelectorAll(".prebox");

preboxes.forEach(prebox => {
    prebox.addEventListener("click", () => {
        const idstring = JSON.stringify(prebox.getAttribute("data-fileid"));
        //data-fileid : remains to decide
        window.location.href = "pages/chessboard.html?fileid=" + encodeURIComponent(idstring);
    })
})

