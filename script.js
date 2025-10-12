import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, Timestamp, increment, deleteField } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

const options = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
};


const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
var changingPages = false

function getDeviceByScreen() {
  const width = window.innerWidth;

  if (width <= 768) return "Mobile";
  if (width <= 1024) return "Tablet";
  return "Desktop";
}

document.addEventListener("DOMContentLoaded", async function (event) {
  var device = getDeviceByScreen()
  if (device == "Mobile") {
    document.getElementById("testingabc123ghtovns").innerHTML = "Mobile"
  } else if (device == "Tablet") {
    document.getElementById("testingabc123ghtovns").innerHTML = "Tablet"
  } else {
    document.getElementById("testingabc123ghtovns").innerHTML = "Desktop"
  }
})

document.getElementById("navbarButtonOpen").addEventListener("click", async function () {
  if (document.getElementById("navbarButtonOpen").getAttribute("state") == "closed") {
    
    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.add("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(180deg)"
    document.getElementById("navbar").style.width = "225px"
    
    await wait(310)
    
    /*const buttons = document.querySelectorAll('.navbarButton');
    buttons.forEach(button => {
      if (button.id !== "navbarButtonOpen") {
        button.querySelector(".icon").style.marginRight = "5px";
        button.querySelector(".navbarButtonText").style.display = "block";
      }
    });*/
    
    document.getElementById("navbarTitle").innerHTML = "JONES HUB"
    document.getElementById("navbarButtonOpen").setAttribute("state", "open")

    
  } else {

    
    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.remove("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(0deg)"
    
    /*const buttons = document.querySelectorAll('.navbarButton');
    buttons.forEach(button => {
      if (button.id !== "navbarButtonOpen") {
        button.querySelector(".icon").style.marginRight = "0px";
        button.querySelector(".navbarButtonText").style.display = "none";
      } 
    });*/
    
    document.getElementById("navbarTitle").innerHTML = "HUB"
    document.getElementById("navbar").style.width = "86px"
    
    await wait(310)
    
    document.getElementById("navbarButtonOpen").setAttribute("state", "closed")
  }
});

document.querySelectorAll('.navbarButton').forEach(button => {
  button.addEventListener('click', async function () {
    if (button.id !== "navbarButtonOpen") {
      await goPage(button.getAttribute('page'))
    }
  })
});



async function load_page(page) {
  const deviceType = getDeviceByScreen()

  ///// NOTES PAGE /////
  if (page == "notesPage") {
    const notesRef = collection(db, "notes");
    const notesDocs = await getDocs(notesRef);

    var notes = {}

    notesDocs.forEach((doc) => {
      if (doc.id == "global") {
        const data = doc.data();
        document.querySelector("#notesPageTotalNotes").innerHTML = `<b>Total Notes:</b> ${data["total_notes"]} notes`
      } else {
        if (document.querySelector("#notesPage .notesSection[note_id='" + doc.id + "']") == null) {
          notes[doc.id] = doc.data();
        }
      }
    });

    for ( const key in notes ) { 

      const note = document.createElement("div");
      note.classList.add("section");
      note.classList.add("notesSection");
      note.setAttribute("note_id", key)
      note.setAttribute("columnType", "3COL")

      const added_time_timestamp = notes[key]["added_time"].toDate();
      const added_time_string = added_time_timestamp.toLocaleString('en-GB', options).split(', ');

      note.innerHTML = `<p class="notesTitle">${notes[key]["title"]}</p>
      <div class="notesButton" function="edit"><i class="material-symbols-rounded">edit_square</i></div>
      <div class="notesPara notesClampedText">${notes[key]["note"]}</div>
      <p class="notesSubInfo">Created by: <b>${notes[key]["added_by"]}</b> on <b>${added_time_string}</b></p>`

      document.getElementById("notesPage").appendChild(note);

      note.querySelectorAll(".notesButton").forEach(button => {
        button.addEventListener("click", async function () {
          //const functionType = button.getAttribute("function");
          //if (functionType == "edit") {
          document.querySelector("#editNotesPage").setAttribute("note_id", key)
          document.querySelector("#editNotesPageTitleBox").value = note.querySelectorAll(".notesTitle")[0].innerHTML
          document.querySelector("#editNotesPageDescBox").value = note.querySelectorAll(".notesPara")[0].innerHTML
          document.getElementById("editNotesPageError").innerHTML = ""
          document.getElementById("editNotesPageDeleteNoteButton").innerHTML = "Delete Note"
          await goPage("editNotesPage")
          //}
        })
      })
      
    }
    
  } else if (page == "listsPage") {
    const notesDocs = await getDocs(collection(db, "lists"));
    document.querySelector("#listsPageTotalLists").innerHTML = `<b>Total Lists:</b> ${notesDocs.size} lists`

    document.querySelectorAll("#listsPage .notesSection").forEach(section => {section.remove()})

    notesDocs.forEach((doc) => {
      if (document.querySelector(`#listsPage .notesSection[list_id='${doc.id}']`) == null) {

        const note = document.createElement("div");
        note.classList.add("section");
        note.classList.add("notesSection");
        note.style.display = "inline-flex"
        note.style.minHeight = "min-content"
        note.setAttribute("list_id", doc.id)
        note.setAttribute("columnType", "3COL")

        note.innerHTML = `<p class="notesTitle">${doc.id}</p>
        <div class="notesButton" function="edit" style="padding-top: 5px; margin-left: auto;"><i class="material-symbols-rounded">expand_circle_right</i></div>`

        document.getElementById("listsPage").appendChild(note);

        note.querySelectorAll(".notesButton").forEach(button => {
          button.addEventListener("click", async function () {
            document.querySelector("#listsEditPage").setAttribute("list_id", doc.id)
            document.getElementById("listsEditPageDeleteListButton").innerHTML = "Delete List"
            await goPage("listsEditPage")
          })
        })
        
      }
    });
  } else if (page == "listsEditPage") {
    const list_id = document.querySelector("#listsEditPage").getAttribute("list_id")
    const notesDocs = await getDoc(doc(db, "lists", list_id));

    if (!notesDocs.exists()) {
      await wait(310)
      await goPage("listsPage")
    } else {

      const data = notesDocs.data();
      document.querySelector("#listsPageTotalItems").innerHTML = `<b>Total Items:</b> ${Object.keys(data).length} items`
  
      document.querySelectorAll("#listsEditPage .notesSection").forEach(section => {section.remove()})
  
      for (const key in data) {
    
        const note = document.createElement("div");
        note.classList.add("section");
        note.style.display = "inline-flex"
        note.classList.add("notesSection");
        note.style.minHeight = "min-content"
        note.setAttribute("list_id", doc.id)
        note.setAttribute("columnType", "3COL")
  
        let checked = data[key] ? "check_box" : "check_box_outline_blank"
  
        note.innerHTML = `<div class="notesButton" function="check" style="padding-top: 5px"><i class="material-symbols-rounded">${checked}</i></div>
        <p class="notesTitle">${key}</p>
        <div class="notesButton" function="delete" style="padding-top: 5px; margin-left: auto;"><i class="material-symbols-rounded">delete</i></div>`
  
        document.getElementById("listsEditPage").appendChild(note);
  
        note.querySelectorAll(".notesButton").forEach(button => {
          button.addEventListener("click", async function () {
            const functionType = button.getAttribute("function");
            if (functionType == "check") {
              if (button.querySelector("i").innerHTML == "check_box_outline_blank") {
                button.querySelector("i").innerHTML = "check_box"
                // await updateDoc(doc(db, "lists", list_id), {[key]: true})
              } else {
                button.querySelector("i").innerHTML = "check_box_outline_blank"
                // await updateDoc(doc(db, "lists", list_id), {[key]: false})
              }
  
            } else if (functionType == "delete") {
              if (button.querySelector("i").innerHTML == "delete") {
                button.querySelector("i").innerHTML = "delete_forever"
              } else {
                // await updateDoc(doc(db, "lists", list_id), {[key]: deleteField()})
                note.remove()
              }
            }
          })
        })

      }

    }
  }



  /////


  
}


document.getElementById("editNotesPageConfirmNoteButton").addEventListener('click', async function () {

  const note_id = document.querySelector("#editNotesPage").getAttribute("note_id")
  await updateDoc(doc(db, "notes", note_id), {
    title: document.getElementById("editNotesPageTitleBox").value,
    note: document.getElementById("editNotesPageDescBox").value
  })

  document.querySelector(".notesPage .notesSection[note_id='" + note_id + "']").querySelectorAll(".notesTitle")[0].innerHTML = document.getElementById("editNotesPageTitleBox").value
  document.querySelector(".notesPage .notesSection[note_id='" + note_id + "']").querySelectorAll(".notesPara")[0].innerHTML = document.getElementById("editNotesPageDescBox").value

  await goPage("notesPage")
  
})

document.getElementById("editNotesPageCancelNoteButton").addEventListener('click', async function () {
  await goPage("notesPage")
})

document.getElementById("editNotesPageDeleteNoteButton").addEventListener('click', async function () {
  if (document.getElementById("editNotesPageDeleteNoteButton").innerHTML == "Delete Note") {
    document.getElementById("editNotesPageDeleteNoteButton").innerHTML = "Confirm Delete"
    document.getElementById("editNotesPageError").innerHTML = "Are you sure?"
  } else if (document.getElementById("editNotesPageDeleteNoteButton").innerHTML == "Confirm Delete") {
    const note_id = document.querySelector("#editNotesPage").getAttribute("note_id")
    await deleteDoc(doc(db, "notes", note_id))
    await updateDoc(doc(db, "notes", "global"), {"total_notes": increment(-1)})
    document.querySelector(".notesSection[note_id='" + note_id + "']").remove()
    await goPage("notesPage")
  }
})


document.getElementById("notesPageCreateNoteButton").addEventListener('click', async function () {
  document.getElementById("newNotesPageTitleBox").value = ""
  document.getElementById("newNotesPageDescBox").value = ""
  document.getElementById("newNotesPageError").innerHTML = ""
  document.querySelectorAll('#newNotesPagePersonButton').forEach(button => {
    button.style.backgroundColor = "#555"
  })
  await goPage("newNotesPage")
})

document.getElementById("newNotesPageConfirmNoteButton").addEventListener('click', async function () {
  const buttons = document.querySelectorAll('#newNotesPagePersonButton');
  var added_by = ""
  buttons.forEach(button => {
    if (button.style.backgroundColor == "rgb(119, 119, 119)") {
      added_by = button.innerHTML
    }
  })
  if (added_by == "") {
    document.getElementById("newNotesPageError").innerHTML = "Please select a person."
    return
  } else {
    if (document.getElementById("newNotesPageTitleBox").value == "" || document.getElementById("newNotesPageDescBox").value == "") {
      document.getElementById("newNotesPageError").innerHTML = "Please fill in all boxes."
      return
    }
    await addDoc(collection(db, "notes"), {
      title: document.getElementById("newNotesPageTitleBox").value,
      note: document.getElementById("newNotesPageDescBox").value,
      added_by: added_by,
      added_time: Timestamp.now()
    })
    await updateDoc(doc(db, "notes", "global"), {"total_notes": increment(1)})
    await goPage("notesPage")
  }
})

document.getElementById("newNotesPageCancelNoteButton").addEventListener('click', async function () {
  await goPage("notesPage")
})

document.querySelectorAll("#newNotesPagePersonButton").forEach(thisButton => {
  thisButton.addEventListener('click', async function () {
    document.querySelectorAll('#newNotesPagePersonButton').forEach(button => {
      button.style.backgroundColor = "#555"
    })
    thisButton.style.backgroundColor = "#777"
  })
});



document.getElementById("listsPageCreateListButton").addEventListener('click', async function () {
  document.getElementById("listsNewListPageError").innerHTML = ""
  await goPage("listsNewListPage")
})
document.getElementById("listsEditPageCreateItemButton").addEventListener('click', async function () {
  document.getElementById("listsEditPageDeleteListButton").innerHTML = "Delete List"
  document.getElementById("listsNewItemPageError").innerHTML = ""
  await goPage("listsNewItemPage")
})
document.getElementById("listsEditPageDeleteListButton").addEventListener('click', async function () {
  if (document.getElementById("listsEditPageDeleteListButton").innerHTML == "Delete List") {
    document.getElementById("listsEditPageDeleteListButton").innerHTML = "Confirm Delete"
  } else if (document.getElementById("listsEditPageDeleteListButton").innerHTML == "Confirm Delete") {
    await deleteDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("list_id")));
    document.getElementById("listsEditPageDeleteListButton").innerHTML = "Delete List"
    document.querySelector("#listsPage .notesSection[list_id='" + document.querySelector("#listsEditPage").getAttribute("list_id") + "']").remove()
    document.querySelector("#listsEditPage").setAttribute("list_id", "")
    await goPage("listsPage")
  }
})
document.getElementById("listsNewListPageCancelListButton").addEventListener('click', async function () {
  document.querySelector("#listsNewListPageTitleBox").value = ""
  await goPage("listsPage")
})
document.getElementById("listsNewListPageCreateListButton").addEventListener('click', async function () {
  var listTitle = document.getElementById("listsNewListPageTitleBox").value
  if (listTitle == "") {
    document.getElementById("listsNewListPageError").innerHTML = "Please fill in all boxes."
  } else {
    document.getElementById("listsNewListPageError").innerHTML = ""
    listTitle = listTitle.replace(/[^a-zA-Z\s]/g, "")
    await setDoc(doc(db, "lists", listTitle), {});
    document.querySelector("#listsNewListPageTitleBox").value = ""
    await goPage("listsPage")
  }
})
document.getElementById("listsNewItemPageCancelItemButton").addEventListener('click', async function () {
  document.querySelector("#listsNewItemPageTitleBox").value = ""
  await goPage("listsEditPage")
})
document.getElementById("listsNewItemPageAddMoreButton").addEventListener('click', async function () {
  const listsRef = doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("list_id"))
  const listsDoc = await getDoc(listsRef)
  if (listsDoc.exists()) {
    if (document.querySelector("#listsNewItemPageTitleBox").value == "") {
      document.getElementById("listsListNewItemPageError").innerHTML = "Please fill in all boxes."
    } else {
      var listsData = listsDoc.data()
      var itemValue = document.getElementById("listsNewItemPageTitleBox").value

      listsData[itemValue] = false
      console.log(listsData)
      await updateDoc(listsRef, listsData)

      document.querySelector("#listsNewItemPageTitleBox").value = ""
    }
  } else {
    document.getElementById("listsListNewItemPageError").innerHTML = "Error: List not found."
  }
})
document.getElementById("listsNewItemPageAddItemButton").addEventListener('click', async function () {
  const listsRef = doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("list_id"))
  const listsDoc = await getDoc(listsRef)
  if (listsDoc.exists()) {
    if (document.querySelector("#listsNewItemPageTitleBox").value == "") {
      document.getElementById("listsListNewItemPageError").innerHTML = "Please fill in all boxes."
    } else {
      var listsData = listsDoc.data()
      var itemValue = document.getElementById("listsNewItemPageTitleBox").value
  
      listsData[itemValue] = false
      await updateDoc(listsRef, listsData)
      
      document.querySelector("#listsNewItemPageTitleBox").value = ""
      await goPage("listsEditPage")
    }
  } else {
    document.getElementById("listsListNewItemPageError").innerHTML = "Error: List not found."
  }
})
document.getElementById("listsBackButton").addEventListener('click', async function () {
  var newList = {}
  document.querySelectorAll("#listsEditPage .notesSection").forEach(section => {
    const title = section.querySelector(".notesTitle").innerHTML
    const checked = section.querySelector(".notesButton[function='check'] i").innerHTML == "check_box" ? true : false
    newList[title] = checked
  })
  console.log(newList)
  await setDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("list_id")), newList);
  document.getElementById("listsEditPageDeleteListButton").innerHTML = "Delete List"
  document.getElementById("listsEditPageDeleteItemsButton").innerHTML = "Delete All Items"
  await goPage("listsPage")
})
document.getElementById("listsEditPageDeleteItemsButton").addEventListener('click', async function () {
  if (document.getElementById("listsEditPageDeleteItemsButton").innerHTML == "Delete All Items") {
    document.getElementById("listsEditPageDeleteItemsButton").innerHTML = "Confirm Delete"
  } else if (document.getElementById("listsEditPageDeleteItemsButton").innerHTML == "Confirm Delete") {
    await setDoc(doc(db, "lists", document.querySelector("#listsEditPage").getAttribute("list_id")), {});
    document.getElementById("listsEditPageDeleteItemsButton").innerHTML = "Delete All Items"
    document.querySelectorAll("#listsEditPage .notesSection").forEach(div => div.remove());
    document.querySelector("#listsPageTotalItems").innerHTML = `<b>Total Items:</b> 0 items`
  }
})



async function goPage(goToPage) {
  const button = document.querySelector(`.navbarButton[page='${goToPage}']`)
  if (button != null) {
    if (changingPages || button.classList.contains("active")) return;
    changingPages = true;
    document.querySelectorAll('.page').forEach(page => page.style.opacity = '0');
    await wait(300)
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.querySelectorAll('.navbarButton').forEach(btn => { if (btn.id !== "navbarButtonOpen") btn.classList.remove('active') });
    await load_page(goToPage)
    await wait(100)
    document.getElementById(goToPage).style.display = 'flex';
    document.getElementById(goToPage).style.opacity = '1';
    button.classList.add('active');
    await wait(300)
    changingPages = false;
  } else {
    changingPages = true;
    document.querySelectorAll('.page').forEach(page => page.style.opacity = '0');
    await wait(300)
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.querySelectorAll('.navbarButton').forEach(btn => { if (btn.id !== "navbarButtonOpen") btn.classList.remove('active') });
    await load_page(goToPage)
    await wait(100)
    document.getElementById(goToPage).style.display = 'flex';
    document.getElementById(goToPage).style.opacity = '1';
    await wait(300)
    changingPages = false;
  }
    
}
