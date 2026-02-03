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

  if (event.target.classList.contains("todo-edit")) {
    // edit 근처 li를 input 으로 변경하기
    const customBox = li.querySelector(".inner");
    const originText = li.querySelector(".todo-text"); //기존 텍스트 요소
    const currentText = originText.textContent;

    li.setAttribute("draggable", "false");

    customBox.innerHTML = `
        <input type="text" class="edit-input" value="${currentText}" />
        <button class="todo-btn todo-save">Save</button>
        <button class="todo-btn todo-cancel">Cancel</button>
      `;

    const input = li.querySelector(".edit-input");
    input.focus();

    const tempValue = input.value;
    input.value = "";
    input.value = tempValue;
  }

  if (event.target.classList.contains("todo-save")) {
    const input = li.querySelector(".edit-input");
    const newText = input.value.trim();

    if (newText !== "") {
      todos = todos.map((todo) => {
        return todo.id === id ? { ...todo, text: newText } : todo;
      });
      li.setAttribute("draggable", "true");
      saveAndRender();
    }
  }

  if (event.target.classList.contains("todo-cancel")) {
    renderTodos();
  }

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

todoList.addEventListener("keydown", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const input = li.querySelector(".edit-input");
  if (!input) return;

  if (e.key === "Enter") {
    li.setAttribute("draggable", "true");
    li.querySelector(".todo-save").click();
  }
});

let draggingItem = null; //현재 드래그 중인 요소
// dragstart
todoList.addEventListener("dragstart", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  draggingItem = li; // 집어 올린 요소 저장
  draggingItem.classList.add("drag-start"); //시각 효과용 클래스
});

// 드래그 위치 변경
todoList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const targetItem = e.target.closest("li"); //마우스 아래에 있는 li 찾기

  // 이벤트가 발생할 때 마우스 커서가 타겟 li 세로 중앙선보다 아래에 있으면 nextSibling 앞에 넣기

  // 조건 : 타겟이 존재하고, 내가 드래그하는게 나 자신이 아닐때
  if (targetItem && targetItem !== draggingItem) {
    // 타겟 요소의 전체적인 위치 정보를 가져오기 (top, bottom)
    const bounding = targetItem.getBoundingClientRect();
    // 타겟 요소의 세로 중앙값 계산
    const offset = bounding.y + bounding.height / 2;
    // 마우스 위치(e.clientY)가 중앙값보다 아래에 있는지 확인
    if (e.clientY > offset) {
      todoList.insertBefore(draggingItem, targetItem.nextSibling);
    } else {
      // 타겟 요소 바로 앞으로 내 요소를 옮김
      todoList.insertBefore(draggingItem, targetItem);
    }
  }
});

// 드래그 완료 시점
todoList.addEventListener("dragend", (e) => {
  e.target.classList.remove("drag-start");

  //화면에 보이는 li들을 모두 가져와서 id를 넘버로 변경 후 id가 담긴 배열을 변수에 담는다
  const newOrderIds = [...todoList.querySelectorAll("li")].map((li) =>
    Number(li.dataset.id),
  );

  //id 배열 순서에 맞춰서 기존 todos 배열을 재정렬한다
  const newTodos = newOrderIds
    .map((id) => todos.find((todo) => todo.id === id))
    .filter((todo) => todo !== undefined); //검색 실패한 데이터는 제외

  todos = newTodos;
  localStorage.setItem("todos", JSON.stringify(todos)); //저장만하기
  // renderTodos(); // 다시 렌더가 되면서 드래그 효과가 부자연스러울수 있음

  draggingItem = null;
});

// modaltrigger 클릭을하면 modal이 열리기
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
  if (todos.length === 0) return;
  openModal("전체 삭제를 할까요?", true);
});

modalYes.addEventListener("click", () => {
  if (todos.length === 0) return;
  todos = [];
  saveAndRender();
  closeModal();
});

updateAllDelBtn();
function updateAllDelBtn() {
  if (todos.length === 0) {
    modalTrigger.classList.add("disabled");
  } else {
    modalTrigger.classList.remove("disabled");
  }
}

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
      <li class="item ${todo.completed ? "toggle" : ""}" data-id="${todo.id}" draggable="true">
        <label class="custom-checkbox">
            <input type="checkbox" ${todo.completed ? "checked" : ""} />
            <span class="checkmark"></span>
            <div class="inner">
              <span class="todo-text">${todo.text}</span>
            </div>
        </label>
        <button class="todo-btn todo-edit">Edit</button>
        <button class="todo-btn todo-del">X</button>
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
  updateAllDelBtn();
}

// 버튼을 클릭하면 할일이 등록되는 함수 실행
addBtn.addEventListener("click", addList);
addArea.addEventListener("keydown", (event) => {
  if (event.isComposing) return; //한글 조합용이면 리턴
  if (event.key === "Enter") {
    addList();
  }
});
