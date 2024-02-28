


const menuToggle = document.querySelector('.menu_sidebar_container-toggle');
const menu = document.querySelector('.menu_sidebar_container');

menuToggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    let navmenuOpen = document.getElementById("menu_open")
    let navmenuClose = document.getElementById("menu_close")
    
    if(window.getComputedStyle(navmenuOpen).display==='block'){
        navmenuOpen.style.display='none'
        navmenuClose.style.display='block'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)



    }else{
        navmenuOpen.style.display='block'
        navmenuClose.style.display='none'
        console.log(navmenuOpen.style.display)
        console.log(navmenuClose.style.display)


    }

    
});



function Plan_Click() {
    plans = document.getElementById("plans");
    if (plans.style.display === 'none'){
        plans.style.display = 'block';
        plans.style.transition = 'all 1s';
    }
    else{
        plans.style.display = 'none';
        plans.style.transition = 'all 1s';       
    }

}


function fullscreen_click(){
    let fullscrIn= document.getElementById("fullscreen_in");
    let fullscrOut= document.getElementById("fullscreen_out");

    
    console.log(window.getComputedStyle(fullscrIn).display)
    if(window.getComputedStyle(fullscrIn).display==='block'){
        fullscrIn.style.display='none'
        fullscrOut.style.display='block'

    }else{
        fullscrIn.style.display='block'
        fullscrOut.style.display='none'

    }
}

function display_toggle(id){
    let eldId = document.getElementById(id);
    console.log(window.getComputedStyle(eldId).display)
    eldId.classList.toggle('show');

    if(window.getComputedStyle(eldId).display==='flex'){
        eldId.style.display='none'
    }else{
        eldId.style.display='flex'

    }

}

function display_toggle_block(id){
    let eldId = document.getElementById(id);
    console.log(window.getComputedStyle(eldId).display)
    if(window.getComputedStyle(eldId).display==='block'){
        eldId.style.display='none'
    }else{
        eldId.style.display='block'

    }

}

