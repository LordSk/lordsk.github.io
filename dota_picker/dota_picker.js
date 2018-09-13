//

var hero_list = {};
$('div.hero_list .hero_button').each(function() {
    hero_list[($(this).attr('name'))] = $(this).find('img').attr('src');
});

var selected_list = [];
var div_selectedList = $('div.selected_hero_list');

$('div.hero_list .hero_button').click(function() {
    if(!$(this).hasClass('grayed') && selected_list.length < 5) {
        selected_list.push(($(this).attr('name')));
        updateSelectedList();
    }
});

function updateSelectedList()
{
    var html = '';
    for(var i = 0; i < selected_list.length; i += 1) {
        html += '<div class="hero_button"><img src="' + hero_list[selected_list[i]] + '"></div>';
    }
    div_selectedList.html(html);

    $('div.selected_hero_list .hero_button').click(function() {
        if(selected_list.length > 0) {
            var index = $(this).index();
            selected_list.splice(index, 1);
            updateSelectedList();
        }
    });
}


$('.input_filter').keyup(function() {
    // clear greyed out heroes when empty
    if($(this).val().length == 0) {
        $('.hero_list .hero_button').each(function() {
            $(this).removeClass('grayed');
        });
        return;
    }

    var searchList = $(this).val().toLowerCase().split(' ');
    var foundNames = [];

    for(h in hero_list) {
        for(var i = 0; i < searchList.length; i += 1) {
            if(h.search(searchList[i]) != -1) {
                foundNames.push(h);
                break;
            }
        }
    }

    console.log(foundNames);

    // grey out all other heroes
    $('.hero_list .hero_button').each(function() {
        $(this).addClass('grayed');
    });

    for(var i = 0; i < foundNames.length; i += 1) {
        $('.hero_list .hero_button[name="' + foundNames[i] + '"]').each(function() {
            $(this).removeClass('grayed');
        })
    }
});