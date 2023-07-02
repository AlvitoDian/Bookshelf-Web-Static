const shelf = [];
const RENDER_EVENT = "render-books";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const textTitle = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").value;
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textTitle,
    textAuthor,
    textYear,
    isCompleted
  );
  shelf.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function updateBook(bookId) {
  const bookObject = findBook(Number(bookId));
  if (bookObject == null) return;

  const updateTitle = document.getElementById("updateBookTitle").value;
  const updateAuthor = document.getElementById("updateBookAuthor").value;
  const updateYear = document.getElementById("updateBookYear").value;
  const isComplete = document.getElementById("updateBookIsComplete").checked;

  bookObject.title = updateTitle;
  bookObject.author = updateAuthor;
  bookObject.year = updateYear;
  bookObject.isComplete = isComplete;

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBOOKList.innerHTML = "";

  const completedBOOKList = document.getElementById("completeBookshelfList");
  completedBOOKList.innerHTML = "";

  for (const bookItem of shelf) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) uncompletedBOOKList.append(bookElement);
    else completedBOOKList.append(bookElement);
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;

  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;

  const article = document.createElement("article");
  article.classList.add("book_item");
  article.append(textTitle, textAuthor, textYear);
  article.setAttribute("id", `${bookObject.id}`);

  const undoButton = document.createElement("button");
  undoButton.classList.add("green");

  if (bookObject.isComplete) {
    undoButton.innerText = "Belum selesai dibaca";
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    undoButton.innerText = "Selesai dibaca";
    undoButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });
  }

  const updateButton = document.createElement("button");
  updateButton.classList.add("gold");
  updateButton.innerText = "Update buku";
  updateButton.addEventListener("click", function () {
    const modalBg = document.querySelector(".modal_bg");
    const modalClose = document.getElementById("modalClose");
    const bookId = this.closest(".book_item").id;
    const updateForm = document.getElementById("updateBook");
    const bookItem = findBook(Number(bookId));

    const textTitle = document.getElementById("updateBookTitle");
    const textAuthor = document.getElementById("updateBookAuthor");
    const textYear = document.getElementById("updateBookYear");
    const isComplete = document.getElementById("updateBookIsComplete");

    textTitle.value = bookItem.title;
    textAuthor.value = bookItem.author;
    textYear.value = bookItem.year;
    isComplete.checked = bookItem.isComplete;

    updateForm.addEventListener("submit", function (event) {
      event.preventDefault();
      updateBook(bookId);
      modalBg.classList.remove("bg_active");
    });

    modalBg.classList.add("bg_active");
    modalClose.addEventListener("click", function () {
      modalBg.classList.remove("bg_active");
    });
  });

  const trashButton = document.createElement("button");
  trashButton.classList.add("red");
  trashButton.innerText = "Hapus buku";
  trashButton.addEventListener("click", function () {
    if (confirm("Yakin hapus data buku?")) {
      removeBookFromCompleted(bookObject.id);
    } else {
      return;
    }
  });

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");
  buttonContainer.append(undoButton, updateButton, trashButton);

  article.append(buttonContainer);

  return article;
}

function addBookToCompleted(bookId) {
  const bookObject = findBook(bookId);

  if (bookObject == null) return;

  bookObject.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of shelf) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeBookFromCompleted(bookId) {
  const bookObject = findBookIndex(bookId);

  if (bookObject === -1) return;

  shelf.splice(bookObject, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId) {
  const bookObject = findBook(bookId);

  if (bookObject == null) return;

  bookObject.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in shelf) {
    if (shelf[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(shelf);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-shelf";
const STORAGE_KEY = "SHELF_APPS";

function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const buku of data) {
      shelf.push(buku);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.getElementById("searchBook").addEventListener("submit", function () {
  event.preventDefault();
  const searchBook = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const listBooks = document.querySelectorAll(".book_item");

  for (let book of listBooks) {
    const title = book.firstElementChild.innerText.toLowerCase();
    if (title.includes(searchBook)) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  }
});
