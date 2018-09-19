//

let blockTeam = $('.head_team');
let blockPlayer = $('.head_player');

$('#tab_team').click(function() {
    setupTabTeam();
});

$('#tab_player').click(function() {
    setupTabPlayer();
});

let hero_list = {};
let selected_list = [];
let div_selectedList = $('.head_team .selected_hero_list');

function setupTabTeam()
{
    //console.log("Setting team page");
    blockTeam.show();
    blockPlayer.hide();

    $('div.hero_list .hero_button').unbind();
    $('div.hero_list .hero_button').click(function() {
        if(!$(this).hasClass('grayed') && selected_list.length < 5) {
            selected_list.push(($(this).attr('name')));
            updateSelectedList();
        }
    });

    saveUrlTeam();
}

let playerPosSelectedId = 0;
let posSelectedHeroList = [];
posSelectedHeroList[0] = [];
posSelectedHeroList[1] = [];
posSelectedHeroList[2] = [];
posSelectedHeroList[3] = [];
posSelectedHeroList[4] = [];

let div_posSelectedList = [];
div_posSelectedList[0] = $('.head_player #pos1 .selected_hero_list');
div_posSelectedList[1] = $('.head_player #pos2 .selected_hero_list');
div_posSelectedList[2] = $('.head_player #pos3 .selected_hero_list');
div_posSelectedList[3] = $('.head_player #pos4 .selected_hero_list');
div_posSelectedList[4] = $('.head_player #pos5 .selected_hero_list');

function setupTabPlayer()
{
    //console.log("Setting player page");
    blockTeam.hide();
    blockPlayer.show();

    $('.pos_column').first().addClass('selected');
    $('.pos_column').click(function() {
        playerPosSelectedId = $(this).index();

        $('.pos_column').removeClass('selected');
        $('.pos_column').eq(playerPosSelectedId).addClass('selected');
    });

    $('div.hero_list .hero_button').unbind();
    $('div.hero_list .hero_button').click(function() {
        if(!$(this).hasClass('grayed') && posSelectedHeroList[playerPosSelectedId].length < 5) {
            posSelectedHeroList[playerPosSelectedId].push(($(this).attr('name')));
            updatePositionSelectedList(playerPosSelectedId);
        }
    });

    saveUrlPlayerPosition();
}

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

let filter = {
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

// load hero data from page html
$('div.hero_list .hero_button').each(function() {
    let thisRolesArray = $(this).attr('roles').split(' ');
    let thisRoles = {};

    for(let r in roles) {
        thisRoles[r] = 0;

        for(let i = 0; i < thisRolesArray.length; i +=1) {
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

// load from url
let a = window.location.search.split('=');
if(a[0] == '?heroes') {
    setupTabTeam();

    if(a[1].length > 0) {
        let urlHeroList = a[1].split(',');

        selected_list = selected_list.concat(urlHeroList);
        updateSelectedList();
    }
}
// load position heroes
else if(a[0] == '?p1') {
    setupTabPlayer();

    a = window.location.search.split('&');
    a[0] = a[0].substring(1);

    for(let i = 0; i < a.length; i++) {
        let b = a[i].split('=');
        if(b[0] == 'p' + (i+1) && b[1].length > 0) {
            let urlHeroList = b[1].split(',');
            posSelectedHeroList[i] = posSelectedHeroList[i].concat(urlHeroList);
            updatePositionSelectedList(i);
        }
    }
}
else {
    setupTabTeam();
}

function updateSelectedList()
{
    let html = '';
    let roleCount = {
        Carry: 0,
        Support: 0,
        Nuker: 0,
        Disabler: 0,
        Initiator: 0,
        Pusher: 0,
        Escape: 0,
        Durable: 0,
    };

    for(let i = 0; i < selected_list.length; i += 1) {
        if(!hero_list.hasOwnProperty(selected_list[i])) continue;
        let hero = hero_list[selected_list[i]];
        html += '<div class="hero_button"><img src="' + hero.src + '"></div>';

        for(let r in hero.roles) {
            roleCount[r] += hero.roles[r];
        }
    }
    div_selectedList.html(html);

    div_selectedList.children('.hero_button').click(function() {
        if(selected_list.length > 0) {
            let index = $(this).index();
            selected_list.splice(index, 1);
            updateSelectedList();
        }
    });

    
    for(let r in roleCount) {
        $('.progress_bar#pb_' + r + ' .bar').each(function() {
            let val = roleCount[r] / 5.0 * 100.0;
            $(this).attr('val', val);
            $(this).css('width', val + '%');
        });
    }

    saveUrlTeam();
}

function saveUrlTeam()
{
    // save state in url
    history.pushState(null, '', '?heroes=' + selected_list.join(','));
}

function updatePositionSelectedList(posId)
{
    let sellist = posSelectedHeroList[posId];
    let html = '';
    
    for(let i = 0; i < sellist.length; i += 1) {
        if(!hero_list.hasOwnProperty(sellist[i])) continue;
        let hero = hero_list[sellist[i]];
        html += '<div class="hero_button"><img src="' + hero.src + '"></div>';
    }
    div_posSelectedList[posId].html(html);

    div_posSelectedList[posId].children('.hero_button').click(function() {
        if(sellist.length > 0) {
            let index = $(this).index();
            sellist.splice(index, 1);
            updatePositionSelectedList(posId);
        }
    });

    saveUrlPlayerPosition();
}

function saveUrlPlayerPosition()
{
    // save state in url
    let url = '?'
    for(let i = 0; i < 5; i += 1) {
        url += 'p' + (i+1);
        url += '=' + posSelectedHeroList[i].join(',');
        url += '&';
    }

    history.pushState(null, '', url);
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
        let empty = true;
        for(let r in filter.roles) {
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

    let searchList = filter.search.length > 0 ? filter.search.toLowerCase().split(' '): [];
    let heroFiltered = {};

    for(let h in hero_list) {
        heroFiltered[h] = 0;

        if(searchList.length > 0) {
            for(let i = 0; i < searchList.length; i += 1) {
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
            for(let r in filter.roles) {
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

    for(let h in heroFiltered) {
        if(heroFiltered[h] == 1) {
            $('.hero_list .hero_button[name="' + h + '"]').each(function() {
                $(this).removeClass('grayed');
            })
        }
    }
}