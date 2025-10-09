import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, doc, collection, setDoc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, Timestamp, increment } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

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

document.getElementById("navbarButtonOpen").addEventListener("click", async function () {
  if (document.getElementById("navbarButtonOpen").getAttribute("state") == "closed") {
    
    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.add("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(180deg)"
    document.getElementById("navbar").style.width = "225px"
    
    await wait(200)
    
    const buttons = document.querySelectorAll('.navbarButton');
    buttons.forEach(button => {
      if (button.id !== "navbarButtonOpen") {
        button.querySelector(".icon").style.marginRight = "5px";
        button.querySelector(".navbarButtonText").style.display = "block";
      }
    });
    
    document.getElementById("navbarTitle").innerHTML = "JONES HUB"
    document.getElementById("navbarButtonOpen").setAttribute("state", "open")

    
  } else {

    
    document.getElementById("navbarButtonOpen").setAttribute("state", "changing")
    document.getElementById("navbarButtonOpen").classList.remove("active")
    document.getElementById("navbarButtonOpenIcon").style.transform = "rotate(0deg)"
    
    const buttons = document.querySelectorAll('.navbarButton');
    buttons.forEach(button => {
      if (button.id !== "navbarButtonOpen") {
        button.querySelector(".icon").style.marginRight = "0px";
        button.querySelector(".navbarButtonText").style.display = "none";
      } 
    });
    
    document.getElementById("navbarTitle").innerHTML = "HUB"
    document.getElementById("navbar").style.width = "86px"
    
    await wait(200)
    
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
        if (document.querySelector(".notesSection[note_id='" + doc.id + "']") == null) {
          notes[doc.id] = doc.data();
        }
      }
    });

    for ( const key in notes ) { 

      const note = document.createElement("div");
      note.classList.add("section");
      note.classList.add("notesSection");
      note.setAttribute("note_id", key)

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
    
  }



  /////


  
}


document.getElementById("editNotesPageConfirmNoteButton").addEventListener('click', async function () {

  const note_id = document.querySelector("#editNotesPage").getAttribute("note_id")
  await updateDoc(doc(db, "notes", note_id), {
    title: document.getElementById("editNotesPageTitleBox").value,
    note: document.getElementById("editNotesPageDescBox").value
  })

  document.querySelector(".notesSection[note_id='" + note_id + "']").querySelectorAll(".notesTitle")[0].innerHTML = document.getElementById("editNotesPageTitleBox").value
  document.querySelector(".notesSection[note_id='" + note_id + "']").querySelectorAll(".notesPara")[0].innerHTML = document.getElementById("editNotesPageDescBox").value

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
