// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- IMPORTS ///////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



// import { GetEvents } from './firebase.js'



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- EVENTS AND TIMESTAMPS /////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const navButtons = [
  {page: "../home", icon: "dashboard", disabled: false},
  {page: "listsPage.html", icon: "list_alt", disabled: true},
  {page: "calenderPage.html", icon: "dashboard", disabled: true},
  {page: "mealPlanner.html", icon: "calendar_meal", disabled: true},
  {page: "notesPage.html", icon: "notes", disabled: true},
  {page: "settingsPage.html", icon: "settings", disabled: true},
  {page: "../admin", icon: "admin_panel_settings", disabled: false},
  {page: "function:Refresh", icon: "refresh", disabled: false},
]



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- OTHER VARS ////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var changingPages = false;
var pagesLoadingTime = 800;



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FUNCTIONS /////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



function getDeviceByScreen() {
  const width = window.innerWidth;

  if (width <= 768) return "Mobile";
  if (width <= 1024) return "Tablet";
  return "Desktop";
}

async function goToPage(page) {
  await openLoading();
  window.location.href = page;
  return;
}

async function openLoading() {
  document.querySelector(".V1GLOBAL_LoadingDiv").style.width = "100vw";
  await wait(pagesLoadingTime);
  return;
}

async function closeLoading() {
  document.querySelector(".V1GLOBAL_LoadingDiv").style.width = "0vw";
  await wait(pagesLoadingTime);
  return;
}

async function setNavbar() {
  let tempNavbar = `<p class="navbarTitle">HUB</p>`

  for (let i=0; i < navButtons.length; i++) {
    let tempNavThing = navButtons[i]
    if (!tempNavThing.disabled) { tempNavbar += `\n<div class="navbarButton ${window.location.href.includes(tempNavThing.page) ? "active" : ""}" page="${tempNavThing.page}"><i class="material-symbols-rounded icon">${tempNavThing.icon}</i></div>` }
  }

  tempNavbar += `\n<div style="background: linear-gradient(270deg, var(--colDark), transparent); width: 25px; height: inherit; position: fixed; right: 0; bottom: 0;"></div>`
  document.querySelector(".navbar").innerHTML = tempNavbar

  document.querySelectorAll('.navbarButton').forEach(button => {
    button.addEventListener('click', async function() {
      if (button.id !== "navbarButtonOpen") {
        
        if (button.getAttribute("page").startsWith("function:")) {

          if (AllFunctions[button.getAttribute("page").replace("function:", "")]) {

            if ([  ].includes(button.getAttribute("page").replace("function:", ""))) {
              await AllFunctions[button.getAttribute("page").replace("function:", "")](button.parentElement.parentElement.getAttribute("orderID"));
            } else {
              await AllFunctions[button.getAttribute("page").replace("function:", "")]();
            }

          } else {
            console.error("Function not found: " + button.getAttribute("page").replace("function:", ""));
          }

        } else {
          if (changingPages) return;
          changingPages = true;
          await goToPage(button.getAttribute("page"))
        }
        
      }
    })
  });
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- ON PAGE LOAD //////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



document.addEventListener("DOMContentLoaded", async function (event) {

  await setNavbar()

  // -- > Hide disabled navbar buttons.
  document.querySelectorAll('.navbarButton').forEach(button => {
    if (button.classList.contains("navbarButtonDisabled")) {
      button.style.display = "none"
    }
  })

  // -- > Close loading screen
  await wait(pagesLoadingTime)
  await closeLoading();
  
})



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- NAVBAR FUNCTIONS //////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const AllFunctions = { Refresh }

async function Refresh() {
  await openLoading();
  window.location.reload();
}