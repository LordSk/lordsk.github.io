//

$("div.education .titre, div.projet .titre, div.travail .titre").click(function() {
    $(this).next().slideToggle({duration: "0.5s", easing: "swing"});
});

// turn images into links
$(".desc img").each(function() {
    $(this).wrap('<a class="img_link" href="' + $(this).attr("src") + '"></a>');
});

$("p.tech_tags").each(function() {
    var tags = $(this).text().split(" ");
    console.log(tags);
    var html = "";
    for(var t of tags) {
        html += '<span class="tech_tag">' + t + '</span>';
    }
    $(this).html(html);
});
