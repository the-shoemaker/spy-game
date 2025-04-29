/*! NSB Box v1.0.5 | (c) NSB Media, Lindenstrasse 16, 6340 Baar, www.nsbmedia.ch | Etienne Schorro - 2022 */
var animBreake = false;
var currentLink = 0;
var fadeInTime = 300;
var fadeOutTime = 200;

function isEndOf(origin, target){
    return origin.endsWith(target);
}
function checkFileExtension(url, extensions) {
    return extensions.some(ext => isEndOf(url, ext));
}
function closeNSBBox(){
    $("#nsbbox").fadeOut(fadeOutTime);
    setTimeout(function(){
        $("#nsbbox").remove();
        $("body").css("overflow", "");  // ADDED - allow scrolling again
    }, fadeOutTime);
}
function nsbBOXImgBack(){
    if(animBreake==false){
        animBreake = true;
        $("#nsbBOXText").text(linksTextArr[currentLink]);
        $("#nsbbox img").css("box-shadow","none").animate({
          left: "+=3%",
          opacity: 0
        },fadeOutTime,function(){
            $("#nsbbox img").attr("src", linksArr[currentLink]).css("left","47%").animate({
              left: "+=3%",
              opacity: 1
            },fadeInTime,function(){$(this).css("box-shadow","0 0 50px #333");animBreake=false;});
        });
        currentLink--;
        if(currentLink < 0){
            currentLink = countImgLink-1;
        }
    }
}
function nsbBOXImgForw(){
    if(animBreake==false){
        animBreake = true;
        $("#nsbBOXText").text(linksTextArr[currentLink]);
        $("#nsbbox img").css("box-shadow","none").animate({
          left: "-=3%",
          opacity: 0
        },fadeOutTime,function(){
            $("#nsbbox img").attr("src", linksArr[currentLink]).css("left","53%").animate({
              left: "-=3%",
              opacity: 1
            },fadeInTime,function(){$(this).css("box-shadow","0 0 50px #333");animBreake=false;});
        });
        currentLink++;
        if(currentLink >= countImgLink){
            currentLink = 0;
        }
    }
}
function nsbBOXinit(){
    $(document).on('click','.nsbbox', function(event){
        event.stopPropagation();
        img = false;
        iframe = true;
        $("#nsbbox").remove();
        $("body").append('<div id="nsbbox"><div class="loader"></div><a class="pfeilLinks"></a><a class="pfeilRechts"></a><p id="nsbBOXText"></p><a class="closeBOX"></a></div>');
        $("#nsbbox").fadeOut(0).fadeIn(fadeInTime);

        $("body").css("overflow", "hidden"); // ADDED - disable background scrolling

        $("#nsbbox a.pfeilLinks, #nsbbox a.pfeilRechts").fadeOut(0);
        $("#nsbbox a.pfeilLinks, #nsbbox a.pfeilRechts").click(function(){
            return false;
        });
        $("#nsbbox, a.closeBOX").click(function(){
            closeNSBBox();
        });
        $('body').keyup(function(e){    		
            if(e.keyCode == 27){
                closeNSBBox();
            }
            if(e.keyCode == 37){
                nsbBOXImgBack();
            }
            if(e.keyCode == 39){
                nsbBOXImgForw();
            }
        });
        var imageUrl = event.currentTarget.href.split("?")[0];
        var imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        var isImage = checkFileExtension(imageUrl, imageExtensions);

        if (isImage || $(this).data('image')) {
            img = true;
            iframe = false;
        }
        if(event.target.alt){
            $("#nsbBOXText").text(event.target.alt);
        }
        if(event.target.title){
            $("#nsbBOXText").text(event.target.title);
        }
        if(event.currentTarget.alt){
            $("#nsbBOXText").text(event.currentTarget.alt);
        }
        if(event.currentTarget.title){
            $("#nsbBOXText").text(event.currentTarget.title);
        }
        if(img == true){
            $("#nsbbox").append('<img id="swipeDetect" src="'+event.currentTarget.href+'">');
            countImgLink = 0;
            linksTextArr = new Array();
            linksArr = new Array();
            imagesArr = $("a.nsbbox").toArray();
            imagesArr.forEach(function(iA){
                if(isEndOf(iA.href.split("?")[0], ".jpg") || isEndOf(iA.href.split("?")[0], ".JPG") || isEndOf(iA.href.split("?")[0], ".jpeg") || isEndOf(iA.href.split("?")[0], ".JPEG")){
                    linksTextArr[countImgLink] = iA.title;
                    linksArr[countImgLink] = iA.href;
                    countImgLink++;
                }
                if(isEndOf(iA.href.split("?")[0], ".png") || isEndOf(iA.href.split("?")[0], ".PNG")){
                    linksTextArr[countImgLink] = iA.title;
                    linksArr[countImgLink] = iA.href;
                    countImgLink++;
                }
                if(isEndOf(iA.href.split("?")[0], ".gif") || isEndOf(iA.href.split("?")[0], ".GIF")){
                    linksTextArr[countImgLink] = iA.title;
                    linksArr[countImgLink] = iA.href;
                    countImgLink++;
                }
                if(isEndOf(iA.href.split("?")[0], ".webp") || isEndOf(iA.href.split("?")[0], ".WEBP")){
                    linksTextArr[countImgLink] = iA.title;
                    linksArr[countImgLink] = iA.href;
                    countImgLink++;
                }
            });
            if(countImgLink > 1){
                iLi = 0;
                linksArr.forEach(function(lA){
                    if(event.currentTarget.href.split("?")[0] == lA){
                        currentLink = iLi;
                    }
                    iLi++;
                });
                $("#nsbbox a.pfeilLinks, #nsbbox a.pfeilRechts").show(fadeInTime);
                $("#nsbbox a.pfeilLinks").click(function(){
                    nsbBOXImgBack();
                });
                $("#nsbbox a.pfeilRechts").click(function(){
                    nsbBOXImgForw();
                });
                document.addEventListener('touchstart', handleTouchStart, false);        
                document.addEventListener('touchmove', handleTouchMove, false);
                var xDown = null;                                                        
                var yDown = null;                                                        
                function handleTouchStart(evt){                                         
                    xDown = evt.touches[0].clientX;                                      
                    yDown = evt.touches[0].clientY;                                      
                };
                function handleTouchMove(evt){
                    if (!xDown || !yDown){
                        return;
                    }
                    var xUp = evt.touches[0].clientX;                                    
                    var yUp = evt.touches[0].clientY;
                    var xDiff = xDown - xUp;
                    var yDiff = yDown - yUp;
                    if(Math.abs(xDiff) > Math.abs(yDiff)){
                        if( xDiff > 0 ) {
                            nsbBOXImgForw();
                        } else {
                            nsbBOXImgBack();
                        }
                    }
                    xDown = null;
                    yDown = null;                                             
                };
            }
        }
        if(iframe == true){
            scrolling = '';
            if($(this).data("scrolling")=="no"){
                scrolling = 'scrolling="no"';
            }
            $("#nsbbox").append('<iframe '+scrolling+' src="'+event.currentTarget.href+'"></iframe>');
            if($(this).data("width")){
                $("#nsbbox iframe").width($(this).data("width"));
            }
            if($(this).data("height")){
                $("#nsbbox iframe").height($(this).data("height"));
            }
        }
        return false;		
    });
}
$(document).ready(function(){
    nsbBOXinit();
});