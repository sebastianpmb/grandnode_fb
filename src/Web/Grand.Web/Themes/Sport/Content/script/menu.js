(function () {
    function $(selector, context) {
        context = context || document;
        return context["querySelectorAll"](selector);
    }

    function forEach(collection, iterator) {
        for (var key in Object.keys(collection)) {
            iterator(collection[key]);
        }
    }

    function showMenu(menu) {
        if (this.tagName == "a") {
            var menuli = this;
        } else {
            var menuli = menu.target;
        }
        var ul = $("ul", menuli)[0];

        if (!ul || ul.classList.contains("-visible")) return;

        ul.classList.add("-visible");

        if (menu.target.previousElementSibling !== null) {
            menu.target.previousElementSibling.classList.add("-visible")
        }

        document.getElementById("backdrop-menu").classList.add("show");

    }

    function hideMenu(menu) {
        var menu = this;
        var ul = $("ul", menu)[0];

        if (!ul || !ul.classList.contains("-visible")) return;

        menu.classList.remove("-active");
        ul.classList.add("-animating");
        setTimeout(function () {
            ul.classList.remove("-visible");
            ul.classList.remove("-animating");
        }, 200);

        document.getElementById("backdrop-menu").classList.remove("show")
    }
    function showMenuMobile(menu) {
        if (this.tagName == "a") {
            var menuli = this;
        } else {
            var menuli = this.parentElement;
        }
        var ul = $("ul", menuli)[0];

        if (!ul || ul.classList.contains("-visible")) return;

        ul.classList.add("-visible");
        menu.target.previousElementSibling.classList.add("-visible")
    }
    function hideMenuMobile(menu) {
        menu.target.classList.remove("-visible");
        var menu = this.parentElement;
        var ul = $("ul", menu)[0];

        menu.classList.remove("-active");
        ul.classList.add("-animating");
        setTimeout(function () {
            ul.classList.remove("-visible");
            ul.classList.remove("-animating");
        }, 200);
    }

    function checkPosition(li) {
        var positions = li.getBoundingClientRect();
        var header = document.querySelector('.header-nav-container').getBoundingClientRect();
        if (document.getElementById('hpnslider')) {
            document.getElementById('hpnslider').style.height = "calc(100vh - " + header.height + "px)";
        }
        var maxH = window.innerHeight - header.height + "px"; 
        var top = header.height - 1 + "px";
        var left = header.left + "px"; 
        if (li.querySelectorAll("li > ul")[0].classList.contains("gallery")) {
            li.querySelectorAll("li > ul")[0].style.top = top;
            li.querySelectorAll("li > ul")[0].style.left = left;
        } else {
            li.querySelectorAll("li > ul")[0].style.top = "100%";
        }
        li.querySelectorAll("li > ul")[0].style.maxHeight = maxH;
    }

    function topMenuScroll() {

        var body = document.body;
        var scrollUp = "scroll-up";
        var scrollDown = "scroll-down";
        var onTop = "onTop";
        let lastScroll = 0;

        var currentScrollWindow = window.pageYOffset;
        if (currentScrollWindow == 0) {
            body.classList.add(onTop);
        }

        window.addEventListener("scroll", function () {
            var currentScroll = window.pageYOffset;
            if (window.pageYOffset <= 120) {
                body.classList.add(onTop);
            } else {
                body.classList.remove(onTop);
            }
            if (currentScroll > lastScroll && !body.classList.contains(scrollDown)) {
                // down
                body.classList.remove(scrollUp);
                if (lastScroll != 0) {
                    body.classList.add(scrollDown);
                    return;
                } else {
                    body.classList.remove(scrollDown);
                }
            } else if (currentScroll < lastScroll && body.classList.contains(scrollDown)) {
                // up
                body.classList.remove(scrollDown);
                body.classList.add(scrollUp);
            }
            //$('.mainNav .dropdown-menu.show').each(function () {
            //    $(this).css('top', +$("header").height() + "px");
            //});
            lastScroll = currentScroll;
        });
    }

    window.addEventListener("load", function () {        
        if (991 < window.innerWidth) {
            topMenuScroll();
            forEach($(".Menu > li.-hasSubmenu"), function (e) {
                checkPosition(e);
            });
            forEach($(".Menu > li.-hasSubmenu"), function (e) {
                e.addEventListener("mouseenter", showMenu);
            });
            forEach($(".Menu > li"), function (e) {
                e.addEventListener("mouseleave", hideMenu);
            });
        } else {
            forEach($(".Menu li.-hasSubmenu > .go-forward"), function (e) {
                e.addEventListener("click", showMenuMobile);
            });
            forEach($(".Menu li.-hasSubmenu > .go-back"), function (e) {
                e.addEventListener("click", hideMenuMobile);
            });
        }

        //forEach($(".Menu li .back"), function(e){
        //    e.addEventListener("click", hideMenu);
        //});

    });
})();
