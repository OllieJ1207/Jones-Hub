// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- IMPORTS ///////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, Timestamp, increment, deleteField } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

new Date()



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FIREBASE //////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const firebaseConfig = {
  apiKey: "AIzaSyBOuvYnU3JEVwsFe1h17-JtLVkXjFYENkE",
  authDomain: "jones-family-app.firebaseapp.com",
  projectId: "jones-family-app",
  storageBucket: "jones-family-app.firebasestorage.app",
  messagingSenderId: "57424407391",
  appId: "1:57424407391:web:f4fcdc5c45d9b3cc6124ea",
  measurementId: "G-P1R1HWX701"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);



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

var mealsDataCharlotte = {}
var mealsDataThisWeek = {}
var mealsDataNextWeek = {}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- FUNCTIONS /////////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



function getDeviceByScreen() {
  const width = window.innerWidth;

  if (width <= 768) return "Mobile";
  if (width <= 1024) return "Tablet";
  return "Desktop";
}

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

async function getRandomFieldName(length = 15) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- LOCK ORIENTATION //////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



document.documentElement.requestFullscreen().then(() => {
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock("portrait").catch(function (error) {
      console.warn("Orientation lock failed:", error);
    });
  }
});



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- ON PAGE LOAD //////////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



document.addEventListener("DOMContentLoaded", async function (event) {


  // -- > Hide disabled navbar buttons.
  document.querySelectorAll('.navbarButton').forEach(button => {
    if (button.classList.contains("navbarButtonDisabled")) {
      button.style.display = "none"
    }
  })


  // -- > Load the home page
  if (window.location.href.endsWith("/")) {
    await LoadPage_HomePage_LoadEvents()
  } else if (window.location.href.endsWith("/listsPage")) {
    await LoadPage_ListsPage_LoadLists()
  } else if (window.location.href.endsWith("/settingsPage")) {
    if (localStorage.getItem("deviceUser") != null) {
      document.querySelector("#settingsDefault-DeviceUserBox").value = localStorage.getItem("deviceUser")
    }
  } else if (window.location.href.endsWith("/mealPlanner")) {
    await LoadPage_Meals()
  }
  

  // -- > Close loading screen
  await wait(pagesLoadingTime)
  await closeLoading();
  
})



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- NAVBAR FUNCTIONS //////////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



document.getElementById("navbarButtonOpen").addEventListener("click", async function() {
  if (document.getElementById("navbarButtonOpen").getAttribute("state") == "closed") {

    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.add("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(180deg)"
    document.querySelectorAll(".navbar")[0].style.width = "225px"

    await wait(310)

    document.querySelectorAll(".navbarTitle")[0].innerHTML = "JONES HUB"
    document.getElementById("navbarButtonOpen").setAttribute("state", "open")


  } else {

    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.remove("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(0deg)"

    document.querySelectorAll(".navbarTitle")[0].innerHTML = "HUB"
    document.querySelectorAll(".navbar")[0].style.width = "86px"

    await wait(310)

    document.getElementById("navbarButtonOpen").setAttribute("state", "closed")
  }
});

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



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- SELECT PAGE BUTTONS ///////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



const AllFunctions = { Refresh }


async function Refresh() {
  await openLoading();
  window.location.reload();
}

async function UpdateMeals(mealsCharlotte, mealsThisWeek, mealsNextWeek) {
  // if (mealsCharlotte["Monday"] == "") { document.querySelector("#mealsCharlotte-Monday").value = "Packed Lunch" } 
  // else { document.querySelector("#mealsCharlotte-Monday").value = mealsCharlotte["Monday"] }

  // if (mealsCharlotte["Tuesday"] == "") { document.querySelector("#mealsCharlotte-Tuesday").value = "Packed Lunch" }
  // else { document.querySelector("#mealsCharlotte-Tuesday").value = mealsCharlotte["Tuesday"] }

  // if (mealsCharlotte["Wednesday"] == "") { document.querySelector("#mealsCharlotte-Wednesday").value = "Packed Lunch" }
  // else { document.querySelector("#mealsCharlotte-Wednesday").value = mealsCharlotte["Wednesday"] }

  // if (mealsCharlotte["Thursday"] == "") { document.querySelector("#mealsCharlotte-Thursday").value = "Packed Lunch" }
  // else { document.querySelector("#mealsCharlotte-Thursday").value = mealsCharlotte["Thursday"] }

  // if (mealsCharlotte["Friday"] == "") { document.querySelector("#mealsCharlotte-Friday").value = "Packed Lunch" }
  // else { document.querySelector("#mealsCharlotte-Friday").value = mealsCharlotte["Friday"] }
  
  document.querySelector("#mealsDefault-Monday-kids").value = mealsThisWeek["Monday"][0]
  document.querySelector("#mealsDefault-Monday-parents").value = mealsThisWeek["Monday"][1]
  document.querySelector("#mealsDefault-Tuesday-kids").value = mealsThisWeek["Tuesday"][0]
  document.querySelector("#mealsDefault-Tuesday-parents").value = mealsThisWeek["Tuesday"][1]
  document.querySelector("#mealsDefault-Wednesday-kids").value = mealsThisWeek["Wednesday"][0]
  document.querySelector("#mealsDefault-Wednesday-parents").value = mealsThisWeek["Wednesday"][1]
  document.querySelector("#mealsDefault-Thursday-kids").value = mealsThisWeek["Thursday"][0]
  document.querySelector("#mealsDefault-Thursday-parents").value = mealsThisWeek["Thursday"][1]
  document.querySelector("#mealsDefault-Friday-kids").value = mealsThisWeek["Friday"][0]
  document.querySelector("#mealsDefault-Friday-parents").value = mealsThisWeek["Friday"][1]
  document.querySelector("#mealsDefault-Saturday-kids").value = mealsThisWeek["Saturday"][0]
  document.querySelector("#mealsDefault-Saturday-parents").value = mealsThisWeek["Saturday"][1]
  document.querySelector("#mealsDefault-Sunday-kids").value = mealsThisWeek["Sunday"][0]
  document.querySelector("#mealsDefault-Sunday-parents").value = mealsThisWeek["Sunday"][1]

  document.querySelector("#mealsNext-Monday-kids").value = mealsNextWeek["Monday"][0]
  document.querySelector("#mealsNext-Monday-parents").value = mealsNextWeek["Monday"][1]
  document.querySelector("#mealsNext-Tuesday-kids").value = mealsNextWeek["Tuesday"][0]
  document.querySelector("#mealsNext-Tuesday-parents").value = mealsNextWeek["Tuesday"][1]
  document.querySelector("#mealsNext-Wednesday-kids").value = mealsNextWeek["Wednesday"][0]
  document.querySelector("#mealsNext-Wednesday-parents").value = mealsNextWeek["Wednesday"][1]
  document.querySelector("#mealsNext-Thursday-kids").value = mealsNextWeek["Thursday"][0]
  document.querySelector("#mealsNext-Thursday-parents").value = mealsNextWeek["Thursday"][1]
  document.querySelector("#mealsNext-Friday-kids").value = mealsNextWeek["Friday"][0]
  document.querySelector("#mealsNext-Friday-parents").value = mealsNextWeek["Friday"][1]
  document.querySelector("#mealsNext-Saturday-kids").value = mealsNextWeek["Saturday"][0]
  document.querySelector("#mealsNext-Saturday-parents").value = mealsNextWeek["Saturday"][1]
  document.querySelector("#mealsNext-Sunday-kids").value = mealsNextWeek["Sunday"][0]
  document.querySelector("#mealsNext-Sunday-parents").value = mealsNextWeek["Sunday"][1]
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- LOAD PAGE FUNCTIONS ///////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



// -- > Load Home Pages Events

async function LoadPage_HomePage_LoadEvents() {
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
  var eventText = sortedEvents[0].name + " in " + sortedEvents[0].daysUntil + " days <p style='font-size: 15px; display: inline-block'> (" + stringDate + ")</p>"

  if (sortedEvents[0].daysUntil == 0) {
    eventText = sortedEvents[0].name + " today!"
  } else if (sortedEvents[0].daysUntil < 7) {
    titleText = "⌛ Next Event: "
  }

  document.querySelector("#homeDefault").querySelector("#homeDefault-nextEventTitle").innerHTML = titleText
  document.querySelector("#homeDefault").querySelector("#homeDefault-nextEventText").innerHTML = eventText
}


// -- > Load Lists Page

async function LoadPage_ListsPage_LoadLists() {
  const lists = await getDocs(collection(db, "lists"));

  document.querySelector("#listsDefault").querySelector("#listsDefault-totalListsTitle").innerHTML = "<b>Total Lists:</b> <span style='color: var(--colDimmed)'>" + lists.size + " lists</span>"

  lists.forEach(async (list) => {
    
    const listDiv = document.createElement("div");
    listDiv.classList.add("section");
    listDiv.setAttribute("columnType", "3COL");
    listDiv.setAttribute("listID", list.id);
    
    listDiv.innerHTML = `
      <p class="sectionSubTitle" style="margin-bottom: 0 !important;">${list.id}</p>
    `;
    
    document.querySelector("#listsDefault").appendChild(listDiv);
    listDiv.addEventListener("click", async function() {
      await LoadPage_ListsPage_LoadList(list.id)
    })
    
  })
}


// -- > Load List Page

async function LoadPage_ListsPage_LoadList(listID) {
  await openLoading();

  document.querySelector("#listsDefault").style.display = "none";
  document.querySelector("#listsDefault").style.opacity = "0";

  // -- > Load list items
  const list = await getDoc(doc(db, "lists", listID));
  const listItems = list.data();

  // -- > Load list items into page
  document.querySelector("#listsEditPage").querySelector("#listsEdit-totalItemsTitle").innerHTML = `<b>Total Items:</b> <span style='color: var(--colDimmed)'>${Object.keys(listItems).length} items</span>`

  // -- > Clear all items 
  document.querySelector("#listsEditPage").querySelectorAll(".listsPage-ItemDiv").forEach( (item) => { item.remove(); } )

  for (const key in listItems) {
    await LoadPage_ListsPage_NewItem(key, listItems[key])
  }

  document.querySelector("#listsEditPage").style.removeProperty("display")
  document.querySelector("#listsEditPage").style.removeProperty("opacity")
  document.querySelector("#listsEditPage").setAttribute("listID", listID)

  await closeLoading();
}

async function LoadPage_ListsPage_NewItem(key, listItem) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("section");
  itemDiv.classList.add("listsPage-ItemDiv")
  itemDiv.setAttribute("columnType", "3COL");
  itemDiv.setAttribute("itemID", key);
  itemDiv.setAttribute("itemState", listItem[1])

  let checked = listItem[1] ? "check_box" : "check_box_outline_blank"
  let colour = listItem[1] ? "var(--colSuccess)" : "var(--colNorm)"



    itemDiv.innerHTML = `
    <div class="listsPage-SmallIconButton" function="check" style="color: ${colour}"><i class="material-symbols-rounded">${checked}</i></div>
    <p class="sectionPara">${listItem[0]}</p>
    <p class="sectionSubInfo">Added by: ${listItem[2]}</p>
  `;

  document.querySelector("#listsEditPage").appendChild(itemDiv);

  itemDiv.addEventListener("click", async function() {
    if (itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML == "check_box") {
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "check_box_outline_blank"
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].style.color = "var(--colNorm)"
      itemDiv.setAttribute("itemState", false)

      document.querySelector("#listsEdit-saveListButton").querySelector("i").innerHTML = "save"


    } else if (itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML == "check_box_outline_blank") {
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "check_box"
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].style.color = "var(--colSuccess)"
      itemDiv.setAttribute("itemState", true)

      document.querySelector("#listsEdit-saveListButton").querySelector("i").innerHTML = "save"


    } else if (itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML == "delete") {
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "delete_forever"
      itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].style.color = "var(--colError)"


    } else if (itemDiv.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML == "delete_forever") {
      itemDiv.remove()

      var temp_itemAmount = Number(document.querySelector("#listsEditPage").querySelector("#listsEdit-totalItemsTitle").innerHTML
        .replace(`<b>Total Items:</b> <span style="color: var(--colDimmed)">`, "")
        .replace(` items</span>`, "")) - 1
      document.querySelector("#listsEditPage").querySelector("#listsEdit-totalItemsTitle")
        .innerHTML = `<b>Total Items:</b> <span style='color: var(--colDimmed)'>${temp_itemAmount} items</span>`

      await updateDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("listID")), { [key]: deleteField() })

    }
  })
}

async function LoadPage_Meals() {
  // if today's date is every 3 weeks from 12/04/2024, then get week 1 meals from database
  
  // let startDate = new Date(2024, 3, 12); // April is month 3 (zero-based)
  // let today = new Date();
  // let diff = today.getTime() - startDate.getTime();
  // let weeksDiff = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));

  // let weekNumber = (weeksDiff % 3) + 1;

  // let mealsDataCharlotteTemp = await getDoc(doc(db, "meals", "charlotteWeek1"))

  let mealsDataCharlotteTemp = await getDoc(doc(db, "meals", "thisWeek"))
  mealsDataCharlotte = mealsDataCharlotteTemp.data()
  
  let mealsDataThisWeekTemp = await getDoc(doc(db, "meals", "thisWeek"))
  mealsDataThisWeek = mealsDataThisWeekTemp.data()

  let mealsDataNextWeekTemp = await getDoc(doc(db, "meals", "nextWeek"))
  mealsDataNextWeek = mealsDataNextWeekTemp.data()

  await UpdateMeals(mealsDataCharlotte, mealsDataThisWeek, mealsDataNextWeek)
}



// -- ////////////////////////////////////////////////////////////////////////// -- //
// -- PAGE BUTTON FUNCTIONS /////////////////////////////////////////////////// -- //
// -- //////////////////////////////////////////////////////////////////////// -- //



if (window.location.href.endsWith("/listsPage")) {

  // -- > Lists Page > Items Page >  Switch Delete
  
  document.querySelector("#listsEdit-deleteItemsButton").addEventListener("click", async function() {
  
    document.querySelector("#listsEditPage").querySelector("#listsEdit-saveListButton").style.display = "none"
    document.querySelector("#listsEditPage").querySelector("#listsEdit-createItemButton").style.display = "none"
    document.querySelector("#listsEditPage").querySelector("#listsEdit-deleteItemsButton").style.display = "none"
    document.querySelector("#listsEditPage").querySelector("#listsEdit-deleteListButton").style.display = "none"
    document.querySelector("#listsEditPage").querySelector("#listsEdit-confirmDeleteItemsButton").style.removeProperty("display")
  
    for (const item of document.querySelector("#listsEditPage").querySelectorAll(".listsPage-ItemDiv")) {
      item.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "delete"
      item.querySelectorAll(".listsPage-SmallIconButton")[0].style.removeProperty("color")
    }
    
  })
  
  document.querySelector("#listsEdit-confirmDeleteItemsButton").addEventListener("click", async function() {
  
    document.querySelector("#listsEditPage").querySelector("#listsEdit-saveListButton").style.removeProperty("display")
    document.querySelector("#listsEditPage").querySelector("#listsEdit-createItemButton").style.removeProperty("display")
    document.querySelector("#listsEditPage").querySelector("#listsEdit-deleteItemsButton").style.removeProperty("display")
    document.querySelector("#listsEditPage").querySelector("#listsEdit-deleteListButton").style.removeProperty("display")
    document.querySelector("#listsEditPage").querySelector("#listsEdit-confirmDeleteItemsButton").style.display = "none"
  
    for (var item of document.querySelector("#listsEditPage").querySelectorAll(".listsPage-ItemDiv")) {
      if (item.getAttribute("itemState") == "true") {
        item.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "check_box"
        item.querySelectorAll(".listsPage-SmallIconButton")[0].style.color = "var(--colSuccess)"
      } else {
        item.querySelectorAll(".listsPage-SmallIconButton")[0].querySelector("i").innerHTML = "check_box_outline_blank"
        item.querySelectorAll(".listsPage-SmallIconButton")[0].style.color = "var(--colNorm)"
      }
    }
  
  })
  
  // -- > Lists Page > Items Page >  Save List
  
  document.querySelector("#listsEdit-saveListButton").addEventListener("click", async function() {
  
    if (document.querySelector("#listsEdit-saveListButton").querySelector("i").innerHTML == "save") {
  
      var temp_itemsList = {}
    
      for (var item of document.querySelector("#listsEditPage").querySelectorAll(".listsPage-ItemDiv")) {
        var temp_ItemTitle = item.querySelectorAll(".sectionPara")[0].innerHTML
        var temp_AddedBy = item.querySelectorAll(".sectionSubInfo")[0].innerHTML.replace("Added by: ", "")
        temp_itemsList[item.getAttribute("itemID")] = [temp_ItemTitle, item.getAttribute("itemState") == "true", temp_AddedBy]
      }
    
      await setDoc( doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("listID")), temp_itemsList)
  
    }
  
    await openLoading();
  
    document.querySelector("#listsDefault").style.removeProperty("display")
    document.querySelector("#listsDefault").style.removeProperty("opacity")
    document.querySelector("#listsEditPage").style.display = "none";
    document.querySelector("#listsEditPage").style.opacity = "0";
    document.querySelector("#listsEditPage").removeAttribute("listID")
    document.querySelector("#listsEdit-saveListButton").querySelector("i").innerHTML = "undo"
    
    await closeLoading();
    
  })
  
  // -- > Lists Page > Items Page >  Create Item
  
  document.querySelector("#listsEdit-createItemButton").addEventListener("click", async function() {
  
    await openLoading();
  
    document.querySelector("#listsEditPage").style.display = "none";
    document.querySelector("#listsEditPage").style.opacity = "0";
    document.querySelector("#listsNewItemPage").style.removeProperty("display")
    document.querySelector("#listsNewItemPage").style.removeProperty("opacity")
  
    if (localStorage.getItem("deviceUser") != null) {
      document.querySelector("#listsNewItemPage-addedBy").value = localStorage.getItem("deviceUser")
    }
  
    await closeLoading();
    
  })
  
  // -- > Lists Page > Items Page >  Delete List
  
  document.querySelector("#listsEdit-deleteListButton").addEventListener("click", async function() {
  
    if ( document.querySelector("#listsEdit-deleteListButton").querySelector("i").innerHTML == "contract_delete" ) {
      document.querySelector("#listsEdit-deleteListButton").querySelector("i").innerHTML = "delete_forever"
    } else if ( document.querySelector("#listsEdit-deleteListButton").querySelector("i").innerHTML == "delete_forever" ) {
      await deleteDoc( doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("listID")) )
      await Refresh()
    }
    
  })
  
  // -- > Lists Page > Default >  New List
  
  document.querySelector("#listsDefault-createListButton").addEventListener("click", async function() {
  
    await openLoading();
  
    document.querySelector("#listsDefault").style.display = "none";
    document.querySelector("#listsDefault").style.opacity = "0";
    document.querySelector("#listsNewListPage").style.removeProperty("display")
    document.querySelector("#listsNewListPage").style.removeProperty("opacity")
  
    await closeLoading();
    
  })
  
  // -- > Lists Page > New List >  Cancel List
  
  document.querySelector("#listsNewListPage-cancelNewList").addEventListener("click", async function() {
  
    await openLoading();
  
    document.querySelector("#listsDefault").style.removeProperty("display")
    document.querySelector("#listsDefault").style.removeProperty("opacity")
    document.querySelector("#listsNewListPage").style.display = "none";
    document.querySelector("#listsNewListPage").style.opacity = "0";
  
    document.querySelector("#listsNewListPage-TitleBox").value = ""
  
    await closeLoading();
    
  })
  
  // -- > Lists Page > New List >  Add List
  
  document.querySelector("#listsNewListPage-addNewList").addEventListener("click", async function() {
  
    await setDoc(doc(db, "lists", document.querySelector("#listsNewListPage-TitleBox").value), {})
  
    await Refresh();
    
  })
  
  // -- > Lists Page > New Item >  Cancel Item
  
  document.querySelector("#listsNewItemPage-cancelNewItem").addEventListener("click", async function() {
  
    await openLoading();
  
    document.querySelector("#listsEditPage").style.removeProperty("display")
    document.querySelector("#listsEditPage").style.removeProperty("opacity")
    document.querySelector("#listsNewItemPage").style.display = "none";
    document.querySelector("#listsNewItemPage").style.opacity = "0";
  
    document.querySelector("#listsNewItemPage-item").value = ""
    document.querySelector("#listsNewItemPage-addedBy").value = ""
  
    await closeLoading();
    
  })
  
  // -- > Lists Page > New Item >  Add Item
  
  document.querySelector("#listsNewItemPage-addNewItem").addEventListener("click", async function() {

    var temp_itemID = await getRandomFieldName()
    var temp_generateNewID = true

    //check if it already exists in firebase
    const lists = await getDocs(collection(db, "lists"));

    while (temp_generateNewID == true) {
      temp_generateNewID = false
      lists.forEach(async (list) => {
        if (list.id == temp_itemID) {
          temp_generateNewID = true
        }
      })
      if (temp_generateNewID == true) {
        temp_itemID = await getRandomFieldName()
      }
    }
  
    await updateDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("listID")),
                     { [temp_itemID]: [document.querySelector("#listsNewItemPage-item").value, false, document.querySelector("#listsNewItemPage-addedBy").value] }
                     )
  
    await LoadPage_ListsPage_NewItem(temp_itemID,
                                     [document.querySelector("#listsNewItemPage-item").value, false, document.querySelector("#listsNewItemPage-addedBy").value])
  
    await openLoading();
  
    document.querySelector("#listsEditPage").style.removeProperty("display")
    document.querySelector("#listsEditPage").style.removeProperty("opacity")
    document.querySelector("#listsNewItemPage").style.display = "none";
    document.querySelector("#listsNewItemPage").style.opacity = "0";
  
    document.querySelector("#listsNewItemPage-item").value = ""
    document.querySelector("#listsNewItemPage-addedBy").value = ""
  
    await closeLoading();
    
  })
  
  // -- > Lists Page > New Item >  Add More Items
  
  document.querySelector("#listsNewItemPage-addMoreItems").addEventListener("click", async function() {

  await updateDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("listID")),
                   { [document.querySelector("#listsNewItemPage-item").value]: [document.querySelector("#listsNewItemPage-item").value, false, document.querySelector("#listsNewItemPage-addedBy").value] }
                   )

  await LoadPage_ListsPage_NewItem(document.querySelector("#listsNewItemPage-item").nodeValue,
                                   [document.querySelector("#listsNewItemPage-item").value, false, document.querySelector("#listsNewItemPage-addedBy").value])

  document.querySelector("#listsNewItemPage-item").value = ""
  
})

}



// -- ////////////////////////////////////////////////////////////////////////// -- //



if (window.location.href.endsWith("/settingsPage")) {
  
  // -- > Settings Page > Device User >  Save Device User
  
  document.querySelector("#settingsDefault-DeviceUserBox").addEventListener("change", async function() {
  
    localStorage.setItem("deviceUser", document.querySelector("#settingsDefault-DeviceUserBox").value)
    
  })
  
}



// -- ////////////////////////////////////////////////////////////////////////// -- //



if (window.location.href.endsWith("/mealPlanner")) {

  // document.querySelector("#mealsDefault-charlotte").addEventListener("click", async function() {
  //   await openLoading()
  //   document.querySelector("#mealsDefault").style.display = "none"
  //   document.querySelector("#mealsCharlotte").style.removeProperty("display")
  //   await wait(100)
  //   await closeLoading()
  // })

  document.querySelector("#mealsDefault-saveWeek").addEventListener("click", async function() {
    await setDoc(doc(db, "meals", "thisWeek"), mealsDataThisWeek)
    document.querySelector("#mealsDefault-saveWeek").style.borderColor = "var(--colSuccess)"
    await wait(750)
    document.querySelector("#mealsDefault-saveWeek").style.removeProperty("border-color")
  })

  document.querySelector("#mealsDefault-editNextWeek").addEventListener("click", async function() {
    await openLoading()
    document.querySelector("#mealsDefault").style.display = "none"
    document.querySelector("#mealsNext").style.removeProperty("display")
    await wait(100)
    await closeLoading()
  })

  document.querySelector("#mealsNext-saveWeek").addEventListener("click", async function() {
    await openLoading()
    await setDoc(doc(db, "meals", "nextWeek"), mealsDataNextWeek)
    document.querySelector("#mealsDefault").style.removeProperty("display")
    document.querySelector("#mealsNext").style.display = "none"
    await wait(100)
    await closeLoading()
  })

  document.querySelector("#mealsNext-startNextWeek").addEventListener("click", async function() {
    await openLoading()
    mealsDataThisWeek = mealsDataNextWeek
    mealsDataNextWeek = { "Monday": ["", ""], "Tuesday": ["", ""], "Wednesday": ["", ""], "Thursday": ["", ""], "Friday": ["", ""], "Saturday": ["", ""], "Sunday": ["", ""] }

    await setDoc(doc(db, "meals", "thisWeek"), mealsDataThisWeek)
    await setDoc(doc(db, "meals", "nextWeek"), mealsDataNextWeek)

    await UpdateMeals(mealsDataCharlotte, mealsDataThisWeek, mealsDataNextWeek)
    
    document.querySelector("#mealsDefault").style.removeProperty("display")
    document.querySelector("#mealsNext").style.display = "none"
    await wait(250)
    await closeLoading()
  })

  document.querySelector("#mealsDefault").querySelectorAll(".mealSectionText").forEach( async mealSectionText => {
    mealSectionText.addEventListener("change", async function() {
      mealsDataThisWeek[mealSectionText.id.replace("mealsDefault-", "").replace("-kids", "").replace("-parents", "")][mealSectionText.id.includes("-kids") ? 0 : 1] = mealSectionText.value
    })
  })

  document.querySelector("#mealsNext").querySelectorAll(".mealSectionText").forEach( async mealSectionText => {
    mealSectionText.addEventListener("change", async function() {
      mealsDataNextWeek[mealSectionText.id.replace("mealsNext-", "").replace("-kids", "").replace("-parents", "")][mealSectionText.id.includes("-kids") ? 0 : 1] = mealSectionText.value
    })
  })

  
  
}
