"use strict";

// 리팩토링진행

// 1. 전역 변수선언
// 2. 초기 실행 로직
// 3. 이벤트 리스너
// 4. 함수정의

const addArea = document.querySelector(".input-area input");
const addBtn = document.querySelector(".input-area .add-btn");
const todoList = document.querySelector(".to-do-list");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// 초기 렌더링
renderTodos();

// 이벤트 위임 : 부모(todoList)에서 모든 클릭 이벤트 처리
todoList.addEventListener("click", (event) => {
  const li = event.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  //삭제 버튼 클릭시
  if (event.target.classList.contains("todo-del")) {
    todos = todos.filter((todo) => todo.id !== id);
    saveAndRender();
  }

  // 체크박스 클릭시
  if (event.target.type === "checkbox") {
    todos = todos.map((todo) => {
      return todo.id === id
        ? { ...todo, completed: event.target.checked } //스프레드문법
        : todo;
    });
    saveAndRender();
  }
});

// allbtn 클릭을하면 modal이 열리기
// 1조건 : list에 아무것도 없을때 modal 문구
// 2조건 : list에 전체 삭제한다는 문구
// 3조건 close 버튼과 dimmer를 클릭시 modal 닫기
const modalTrigger = document.querySelector(".all-del-btn");
const modal = document.querySelector(".modal-container");
const dim = modal.querySelector(".dimmer");
const modalClose = modal.querySelector(".close-btn");
const modalText = modal.querySelector(".modal-text");
const modalBtn = modal.querySelector(".btn-area");
const modalYes = modal.querySelector(".btn-area .yes");
const modalNo = modal.querySelector(".btn-area .no");

modalNo.addEventListener("click", closeModal);
dim.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);

modalTrigger.addEventListener("click", () => {
  const isEmpty = todos.length === 0;
  if (isEmpty) {
    openModal("삭제할 할 일이 없습니다", false);
  } else {
    openModal("전체 삭제를 할까요?", true);
  }
});

modalYes.addEventListener("click", () => {
  if (todos.length === 0) return;
  todos = [];
  saveAndRender();
  closeModal();
});

function openModal(msg, showBtn = true) {
  modal.classList.add("active");
  modalText.textContent = msg;
  if (showBtn) {
    modalBtn.classList.remove("hide");
  } else {
    modalBtn.classList.add("hide");
  }
}
function closeModal() {
  modal.classList.remove("active");
}

function renderTodos() {
  todoList.innerHTML = todos
    .map(
      (todo) => `
      <li class="item ${todo.completed ? "toggle" : ""}" data-id="${todo.id}">
      <label class="custom-checkbox">
            <input type="checkbox" ${todo.completed ? "checked" : ""} />
            <span class="checkmark"></span>
            <span class="todo-text">${todo.text}</span>
          </label>
          <button class="todo-del">X</button>
      </li>
    `,
    )
    .join("");
}

// 할일을 등록 하는 함수 (storage 연동)
function addList() {
  const value = addArea.value.trim();
  if (value === "") return;

  todos.push({
    id: Date.now(),
    text: value,
    completed: false,
  });

  saveAndRender();
  addArea.value = "";
  addArea.focus();
}

function saveAndRender() {
  localStorage.setItem("todos", JSON.stringify(todos));
  renderTodos();
}

// 버튼을 클릭하면 할일이 등록되는 함수 실행
addBtn.addEventListener("click", addList);
addArea.addEventListener("keydown", (event) => {
  if (event.isComposing) return; //한글 조합용이면 리턴
  if (event.key === "Enter") {
    addList();
  }
});
