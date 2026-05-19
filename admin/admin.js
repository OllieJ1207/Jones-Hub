
const adminPin = "0000"
const pinButton = document.getElementById("adminPinEnterButton")
const addEventButton = document.getElementById("addEvent-submit")

import { AddEvent, GetEvents, RemoveEvent } from "../firebase.js"

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

pinButton.addEventListener("click", async function() {
  const pinInput = document.getElementById("adminPinEnter")

  if (pinInput.value == adminPin) {
    pinButton.style.border = "2px solid var(--colSuccess)"
    await wait(500)
    document.querySelector("#pinOverlay").style.left = "-100%"
  } else {
    pinButton.style.border = "2px solid var(--colError)"
    await wait(500)
    pinButton.style.border = "2px solid var(--colTheme)"
  }
})

addEventButton.addEventListener("click", async function() {
  const nameInput = document.getElementById("addEvent-name")
  const dateInput = document.getElementById("addEvent-date")
  const emojiInput = document.getElementById("addEvent-emoji")

  if (nameInput.value == "" || dateInput.value == "" || emojiInput.value == "") {
    addEventButton.style.border = "2px solid var(--colError)"
    await wait(500)
    addEventButton.style.border = "2px solid var(--colTheme)"
    return;
  }

  const response = await AddEvent(nameInput.value, dateInput.value, emojiInput.value)

  addEventButton.style.border = "2px solid var(--colSuccess)"
  await wait(500)
  addEventButton.style.border = "2px solid var(--colTheme)"
})

document.getElementById("editEventsButton").addEventListener("click", async function() {

  const events = await GetEvents()

  for (let i = 0; i < events.length; i++) {
    const newP = document.createElement("p")
    newP.classList.add("eventLabel")

    newP.innerHTML = events[i].name.length > 20
      ? events[i].name.slice(0, 20) + "..."
      : events[i].name
    
    const newPButton = document.createElement("i")
    newPButton.classList.add("material-symbols-rounded")
    newPButton.innerHTML = "delete"

    newPButton.addEventListener("click", async function() {
      await RemoveEvent(events[i].name)
      newP.remove()
    })

    newP.appendChild(newPButton)

    document.getElementById("editEventsOverlay").querySelector(".section").querySelector("div").appendChild(newP)
  }

  document.getElementById("editEventsOverlay").style.removeProperty("display")
})


document.getElementById("editEventsCloseButton").addEventListener("click", async function() {
  document.getElementById("editEventsOverlay").style.display = "none"
  document.getElementById("editEventsOverlay").querySelector(".section").querySelector("div").innerHTML = ""
})

