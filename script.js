const resetButton = document.querySelector('[name="resetTodo"]');
const deleteButton = document.querySelector('[name="deleteTodo"]');
const editButton = document.querySelector('[name="editTodo"]');
const doneButton = document.querySelector('[name="doneTodo"]');
const progressButton = document.querySelector('[name="progressTodo"]');
const pinButton = document.querySelector('[name="pinTodo"]');
const form = document.querySelector('form');
const input = document.querySelector("[name='todo']");
const spareForm = document.getElementById("spareForm");
const todo_list = document.getElementById('todos');

const existing_todos = JSON.parse(localStorage.getItem('saved_todos'));     
const existingDone = JSON.parse(localStorage.getItem("doneTodos")); 
const existingpinnedTodo = JSON.parse(localStorage.getItem("pinnedTodo"));                                                      

let todo_data = existing_todos || {};
let doneTodoData = existingDone || [];
let pinnedTodo = existingpinnedTodo || false;

setupTodos();

function setupTodos(){
    const elements = document.getElementsByClassName('draggableListItem')
    alert("1")

    while ( 0 !== elements.length ) {
        elements[0].remove();
    }
    alert("2")
    if (!!pinnedTodo){
        add_todo(pinnedTodo, "existed")
    }
    alert("3")
    for (const [todo, todo_percent] of Object.entries(todo_data)){
        add_todo(todo, "existed");
    }
}

function add_todo(todo_text, type){
    if(todo_data[todo_text] == null || type == "existed" || type == "progress"){
        const div = document.createElement('div');
        div.className = "draggableListItem";
        div.id =  "draggableListItem";
        div.innerHTML = todo_text;
        if (type == "progress" || todo_data[todo_text] != "0" && todo_data[todo_text] != null){
            div.innerHTML = `${todo_text}: ${todo_data[todo_text]}%`;
            if(type != "existed"){
                localStorage.setItem('saved_todos', JSON.stringify(todo_data));
            }
        }
        if(doneTodoData.some(element => element === todo_text)){
            div.id = "doneTodo";
            div.innerHTML = `${todo_text}: 100%`;
        }
        todo_list.appendChild(div);
        if (type == "new"){
            todo_data[todo_text] = "0";
            localStorage.setItem('saved_todos', JSON.stringify(todo_data));
        }
        else if (type == "done"){
            todo_data[todo_text] = "100";
            doneTodoData.push(todo_text)
            localStorage.setItem('saved_todos', JSON.stringify(todo_data));
            localStorage.setItem('doneTodos', JSON.stringify(doneTodoData));
        }
    }
    

}


function deleteTodo(selectedTodo){
    const elements = [...document.querySelectorAll("#todos > *")];

    const todoDoneIndex = doneTodoData.indexOf(selectedTodo);
    delete todo_data[selectedTodo]
    doneTodoData.splice(todoDoneIndex, 1)
    elements.filter((e) => e.innerText === selectedTodo).forEach((e) => e.remove());
    localStorage.setItem('saved_todos', JSON.stringify(todo_data));
    localStorage.setItem('doneTodos', JSON.stringify(doneTodoData))
}
    
form.onsubmit = (event) => {
    event.preventDefault();
    add_todo(input.value, "new");
    input.value = "";

}

pinButton.onclick = (event) => {
    const rawTodo = input.value;
    const selectedTodo = `${input.value}: ${todo_data[input.value]}%`;
    if (todo_data[rawTodo] != null){
        pinnedTodo = rawTodo;
        localStorage.setItem('pinnedTodo', JSON.stringify(pinnedTodo))
        setupTodos();
    }
    input.value = "";
}

resetButton.onclick = (event) => {
    localStorage.clear();
    todo_data = {};
    doneTodoData = [];
    pinnedTodo = false;
    setupTodos();
}

doneButton.onclick = (event) => {
    const rawTodo = input.value;
    const selectedTodo = `${input.value}: ${todo_data[input.value]}%`;
    if (todo_data[rawTodo] != null){
        deleteTodo(rawTodo)
        deleteTodo(selectedTodo);
        doneTodoData.push(rawTodo)
        add_todo(rawTodo, "done")
    }
    input.value = "";
}

progressButton.onclick = (event) => {
    const selectedTodo = input.value;
    if (todo_data[selectedTodo] != null){
        const progressInput = document.createElement("input");
        progressInput.type = "text"
        const progressSubmit = document.createElement("input")
        progressSubmit.type = "submit"
        progressSubmit.value = "Submit percentage"
        progressInput.className = "spareInput"
        progressSubmit.className = "spareSubmit"
        spareForm.appendChild(progressInput);
        spareForm.appendChild(progressSubmit);
        spareForm.onsubmit = (event) => {
            event.preventDefault()
            const newProgress = progressInput.value;
            if (!isNaN(newProgress)){
                deleteTodo(selectedTodo)
                todo_data[selectedTodo] = newProgress;
                add_todo(selectedTodo, "progress")
            }
            const newElements = [...document.querySelectorAll("#spareForm > *")];
            newElements.forEach((e) => e.remove());
        }
    }
    input.value = "";
}

deleteButton.onclick = (event) => {
    const rawTodo = input.value;
    const selectedTodo = `${input.value}: ${todo_data[input.value]}%`;
    if (todo_data[rawTodo] != null){
        deleteTodo(rawTodo)
        deleteTodo(selectedTodo);
    }
    input.value = "";
}

editButton.onclick = (event) => {
    const rawTodo = input.value;
    const selectedTodo = `${input.value}: ${todo_data[input.value]}`;
    if (todo_data[rawTodo] != null){
        const editInput = document.createElement("input");
        editInput.type = "text"
        const editSubmit = document.createElement("input")
        editSubmit.type = "submit"
        editSubmit.value = "Submit edit"
        editInput.className = "spareInput"
        editSubmit.className = "spareSubmit"
        spareForm.appendChild(editInput);
        spareForm.appendChild(editSubmit);
        spareForm.onsubmit = (event) => {
            event.preventDefault();
            const updatedTodo = editInput.value
            const elements = [...document.querySelectorAll("#todos > *")];
            deleteTodo(rawTodo)
            deleteTodo(selectedTodo)
            elements.filter((e) => e.innerText === selectedTodo).forEach((e) => e.remove());
            add_todo(updatedTodo, "new");
            localStorage.setItem('saved_todos', JSON.stringify(todo_data));
            const newElements = [...document.querySelectorAll("#spareForm > *")];
            newElements.forEach((e) => e.remove());
            
        }
        
    }input.value = "";
}   


const list = document.getElementById('todos');

    let draggingEle;
    let placeholder;
    let isDraggingStarted = false;

    let x = 0;
    let y = 0;

    const swap = function(nodeA, nodeB) {
        const parentA = nodeA.parentNode;
        const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

        nodeB.parentNode.insertBefore(nodeA, nodeB);

        parentA.insertBefore(nodeB, siblingA);
    };

    const isAbove = function(nodeA, nodeB) {
        const rectA = nodeA.getBoundingClientRect();
        const rectB = nodeB.getBoundingClientRect();

        return (rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2);
    };

    const mouseDownHandler = function(e) {
        draggingEle = e.target;

        const rect = draggingEle.getBoundingClientRect();
        x = e.pageX - rect.left;
        y = e.pageY - rect.top;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function(e) {
        const draggingRect = draggingEle.getBoundingClientRect();

        if (!isDraggingStarted) {
            isDraggingStarted = true;
            
            placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
            placeholder.style.height = `${draggingRect.height}px`;
        }

        draggingEle.style.position = 'absolute';
        draggingEle.style.top = `${e.pageY - y}px`; 
        draggingEle.style.left = `${e.pageX - x}px`;

        const prevEle = draggingEle.previousElementSibling;
        const nextEle = placeholder.nextElementSibling;
        if (prevEle && isAbove(draggingEle, prevEle)) {
            swap(placeholder, draggingEle);
            swap(placeholder, prevEle);
            return;
        }
        if (nextEle && isAbove(nextEle, draggingEle)) {
            swap(nextEle, placeholder);
            swap(nextEle, draggingEle);
        }
    };

    const mouseUpHandler = function() {
        placeholder && placeholder.parentNode.removeChild(placeholder);

        draggingEle.style.removeProperty('top');
        draggingEle.style.removeProperty('left');
        draggingEle.style.removeProperty('position');

        x = null;
        y = null;
        draggingEle = null;
        isDraggingStarted = false;

        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    [].slice.call(list.querySelectorAll('.draggableListItem')).forEach(function(item) {
        item.addEventListener('mousedown', mouseDownHandler);
    });