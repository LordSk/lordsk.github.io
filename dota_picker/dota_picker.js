//

// make progress bars
$('.progress_bar').each(function() {
    $(this).append('<div class="bar"></div>');
});

const roles = {
    Carry: 0,
    Support: 0,
    Nuker: 0,
    Disabler: 0,
    Initiator: 0,
    Pusher: 0,
    Escape: 0,
    Durable: 0,
}

var filter = {
    search: '',
    roles: {
        Carry: 0,
        Support: 0,
        Nuker: 0,
        Disabler: 0,
        Initiator: 0,
        Pusher: 0,
        Escape: 0,
        Durable: 0,
    }
};

var hero_list = {};
var selected_list = [];
var div_selectedList = $('div.selected_hero_list');

// load hero data from page html
$('div.hero_list .hero_button').each(function() {
    var thisRolesArray = $(this).attr('roles').split(' ');
    var thisRoles = {};

    for(var r in roles) {
        thisRoles[r] = 0;

        for(var i = 0; i < thisRolesArray.length; i +=1) {
            if(thisRolesArray[i] == r) {
                thisRoles[r] = 1;
                break;
            }
        }
    }

    hero_list[($(this).attr('name'))] = {
        src: $(this).find('img').attr('src'),
        search: $(this).attr('search').toLowerCase(),
        roles: thisRoles
    }
});

// load heroes from url
var a = window.location.search.split('=');
if(a[0] == '?heroes' && a[1].length > 0) {
    var urlHeroList = a[1].split(',');

    selected_list = selected_list.concat(urlHeroList);
    updateSelectedList();
}

$('div.hero_list .hero_button').click(function() {
    if(!$(this).hasClass('grayed') && selected_list.length < 5) {
        selected_list.push(($(this).attr('name')));
        updateSelectedList();
    }
});

function updateSelectedList()
{
    var html = '';
    var roleCount = {
        Carry: 0,
        Support: 0,
        Nuker: 0,
        Disabler: 0,
        Initiator: 0,
        Pusher: 0,
        Escape: 0,
        Durable: 0,
    };

    for(var i = 0; i < selected_list.length; i += 1) {
        if(!hero_list.hasOwnProperty(selected_list[i])) continue;
        var hero = hero_list[selected_list[i]];
        html += '<div class="hero_button"><img src="' + hero.src + '"></div>';

        for(var r in hero.roles) {
            roleCount[r] += hero.roles[r];
        }
    }
    div_selectedList.html(html);

    $('div.selected_hero_list .hero_button').click(function() {
        if(selected_list.length > 0) {
            var index = $(this).index();
            selected_list.splice(index, 1);
            updateSelectedList();
        }
    });

    // save state in url
    history.pushState(null, '', '?heroes=' + selected_list.join(','));

    for(var r in roleCount) {
        $('.progress_bar#pb_' + r + ' .bar').each(function() {
            var val = roleCount[r] / 5.0 * 100.0;
            $(this).attr('val', val);
            $(this).css('width', val + '%');
        });
    }
}


$('.input_filter').keyup(function() {
    filter.search = $(this).val();
    applyFilter();
});

$('.tag_select li').click(function() {
    $(this).toggleClass('selected');
    filter.roles[$(this).text()] = $(this).hasClass('selected') ? 1 : 0;
    applyFilter();
});

function applyFilter()
{
    if(filter.search == '') {
        var empty = true;
        for(var r in filter.roles) {
            if(filter.roles[r] != 0) {
                empty = false;
                break;
            }
        }

        if(empty) {
            $('.hero_list .hero_button').each(function() {
                $(this).removeClass('grayed');
            });
            return;
        }
    }

    var searchList = filter.search.length > 0 ? filter.search.toLowerCase().split(' '): [];
    var heroFiltered = {};

    for(var h in hero_list) {
        heroFiltered[h] = 0;

        if(searchList.length > 0) {
            for(var i = 0; i < searchList.length; i += 1) {
                if(hero_list[h].search.search(searchList[i]) != -1) {
                    heroFiltered[h] = 1;
                    break;
                }
            }
        }
        else {
            heroFiltered[h] = 1;
        }

        if(heroFiltered[h] == 1) {
            for(var r in filter.roles) {
                if(filter.roles[r] == 1 && hero_list[h].roles[r] != filter.roles[r]) {
                    heroFiltered[h] = 0;
                    break;
                }
            }
        }
    }

    // grey out all other heroes
    $('.hero_list .hero_button').each(function() {
        $(this).addClass('grayed');
    });

    for(var h in heroFiltered) {
        if(heroFiltered[h] == 1) {
            $('.hero_list .hero_button[name="' + h + '"]').each(function() {
                $(this).removeClass('grayed');
            })
        }
    }
}