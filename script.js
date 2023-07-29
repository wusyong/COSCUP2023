const main = document.querySelector("main");
const slides = document.querySelectorAll("main > section");
let slideIndex = 0;

// preprocess slides to remove [notes]
for (const slide of slides) {
    for (const li of slide.querySelectorAll("li")) {
        for (const kid of li.childNodes) {
            if (kid.nodeName == "#text" && /[\[\]]/.test(kid.nodeValue)) {
                kid.nodeValue = kid.nodeValue.replace(/\[[^\]]+\]/g, "");
            }
        }
    }
}

addEventListener("load", () => {
    // hack for horizontal inline-block slide layout
    for (const kid of main.childNodes)
        if (kid.nodeName == "#text")
            kid.remove();

    // same hack, but for arbitrary slide elements
    const inospace = document.querySelectorAll(".inospace");
    for (let i = 0; i < inospace.length - 1; i++) {
        const left = inospace[i];
        const right = inospace[i + 1];
        if (left.parentNode == right.parentNode) {
            let junk = left.nextSibling;
            while (junk != right) {
                const succ = junk.nextSibling;
                junk.remove();
                junk = succ;
            }
        }
    }
});
["resize", "load"].forEach(x => addEventListener(x, () => {
    const { clientWidth, clientHeight } = document.documentElement;
    console.log(clientWidth, clientHeight);
    if (clientWidth / clientHeight >= 16 / 9) {
        document.body.classList.add("wide");
    } else {
        document.body.classList.remove("wide");
    }
}));
["hashchange", "load"].forEach(x => addEventListener(x, event => {
    const hash = location.hash.slice(1);
    const hashNumber = parseInt(hash, 10);
    if (`${hashNumber}` == hashNumber)
        slideIndex = hashNumber;
    else if (hash == "")
        slideIndex = 0;
    slides.forEach((x, i) => {
        if (i == slideIndex)
            x.classList.add("active");
        else
            x.classList.remove("active");
    });
    if (slides[slideIndex].classList.contains("cover"))
        main.classList.add("cover");
    else
        main.classList.remove("cover");
    main.style.right = `calc(${slideIndex} * var(--width))`;

    // enable transitions only after loading and showing initial slide
    document.documentElement.offsetTop;
    document.documentElement.classList.remove("loading");
}));
addEventListener("keydown", event => {
    if (event.ctrlKey || event.altKey || event.metaKey)
        return;
    if (event.shiftKey && event.key != " ")
        return;
    console.log(`>>> ${event.key}`);
    switch (event.key) {
        case " ":
            goRelative(event.shiftKey ? -1 : +1);
            break;
        case "PageDown":
        case "ArrowDown":
        case "ArrowRight":
        case "j": case "J":
        case "l": case "L":
            goRelative(+1);
            break;
        case "Backspace":
        case "PageUp":
        case "ArrowUp":
        case "ArrowLeft":
        case "k": case "K":
        case "h": case "H":
            goRelative(-1);
            break;
        case "Home":
            goAbsolute(0);
            break;
        case "End":
            goAbsolute(slides.length - 1);
            break;
        case "f": case "F":
            if (document.fullscreenElement)
                document.exitFullscreen();
            else
                document.documentElement.requestFullscreen();
        default:
            return;
    }
    event.preventDefault();
});
function goAbsolute(index) {
    slideIndex = Math.max(0, Math.min(slides.length - 1, index));
    // history.replaceState is not guaranteed to work in local files, and indeed does not in servo:
    // [ERROR script::dom::bindings::error] Error at :0:0 SecurityError: The operation is insecure.
    // https://url.spec.whatwg.org/#origin
    location.replace(slideIndex > 0 ? `#${slideIndex}` : "#");
}
function goRelative(delta) {
    goAbsolute(slideIndex + delta);
}

