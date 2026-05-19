// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- IMPORTS ///////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



import { GetEvents } from '../firebase.js'



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- EVENTS AND TIMESTAMPS /////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]
const events = [
  { name: "Rick", date: "1982-08-16", emoji: "🎂" },
  { name: "Anna", date: "1982-08-22", emoji: "🎂" },
  { name: "Ollie", date: "2007-12-03", emoji: "🎂" },
  { name: "Center Parcs", date: "2010-06-22", emoji: "🌲" },
  { name: "Harry", date: "2010-06-25", emoji: "🎂" },
  { name: "Charlotte", date: "2017-04-12", emoji: "🎂" },
  { name: "Halloween", date: "2000-10-31", emoji: "🎃" },
  { name: "Christmas", date: "2000-12-25", emoji: "🎅" },
];



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- OTHER VARS ////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var changingPages = false;
var pagesLoadingTime = 800;



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FUNCTIONS /////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //




function getDaysUntilEvent(eventStr) {
  const today = new Date();
  const [year, month, day] = eventStr.split("-").map(Number);

  const thisYearEvent = new Date(today.getFullYear(), month - 1, day - 1);
  const nextEvent =
    thisYearEvent < today
      ? new Date(today.getFullYear() + 1, month - 1, day)
      : thisYearEvent;

  const diffTime = nextEvent - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function closeLoading() {
  document.querySelector(".V1GLOBAL_LoadingDiv").style.width = "0vw";
  await wait(pagesLoadingTime);
  return;
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- ON PAGE LOAD //////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



document.addEventListener("DOMContentLoaded", async function (event) {

  await LoadPage_HomePage_LoadEvents()

  // -- > Close loading screen
  await wait(pagesLoadingTime)
  await closeLoading();
  
})


async function Refresh() {
  await openLoading();
  window.location.reload();
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- LOAD PAGE FUNCTIONS ///////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



// -- > Load Home Pages Events

async function LoadPage_HomePage_LoadEvents() {

  const events = await GetEvents()

  const sortedEvents = events
    .map(event => ({  
      ...event,
      daysUntil: getDaysUntilEvent(event.date)
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .filter(event => event.daysUntil >= 0)

  var stringDate = sortedEvents[0].date.split("-")
  stringDate = stringDate[2] + " " + months[stringDate[1] - 1]

  var titleText = sortedEvents[0].emoji + " Next Event: "
  var eventText = sortedEvents[0].name + " in " + sortedEvents[0].daysUntil + " days <p style='font-size: 15px; display: inline-block; position: relative; top: 3px;'> (" + stringDate + ")</p>"

  if (sortedEvents[0].daysUntil == 0) {
    eventText = sortedEvents[0].name + " today!"
  } else if (sortedEvents[0].daysUntil < 7) {
    titleText = "⌛ Next Event: "
  }

  document.querySelector("#homeDefault").querySelector("#homeDefault-nextEventTitle").innerHTML = titleText
  document.querySelector("#homeDefault").querySelector("#homeDefault-nextEventText").innerHTML = eventText
}