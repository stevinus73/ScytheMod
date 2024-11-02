var Research = {};

Research._Initialize = function(en) {
    this.en = en;

    var str = '';
    str += '<div class="smallFancyButton framed" id="researchButton" style="margin-top: 0px; position:relative;' 
    str += 'background: url(//cdn.dashnet.org/cookieclicker/img/shadedBorders.png),url(//cdn.dashnet.org/cookieclicker/img/BGgrimoire.jpg)" '
    str += 'onclick="mod.research.switch()">'
    str += '<div>View Research</div></div>'

    l("buildingsMaster").insertAdjacentHTML('afterbegin', str);
    this.button = l("researchButton");
    this.researchOn = false;

    l("centerArea").insertAdjacentHTML('beforeend', 
        '<div id="research"></div>'
    )
    this.container = l("research");


    Research._Switch = function() {
        this.researchOn = !this.researchOn;
        if (this.researchOn) {
            this.container.style.display = "block";
            l("rows").style.display = "none";
            this.button.firstChild.textContent = "Close Research";
        } else {
            this.container.style.display = "none";
            l("rows").style.display = "block";
            this.button.firstChild.textContent = "View Research";
        }
    }
}

export { Research }