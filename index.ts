const inputBar = document.querySelector("#input") as HTMLInputElement
const newTaskButton = document.querySelector("#newTask") as HTMLButtonElement
const addTaskButton = document.querySelector("#addTask") as HTMLButtonElement
const taskList = document.querySelector("#taskList") as HTMLDivElement
const timerSelect = document.querySelector("#timerSelect") as HTMLSelectElement
const yearSelect = document.querySelector("#yearSelect") as HTMLSelectElement
const monthSelect = document.querySelector("#monthSelect") as HTMLSelectElement
const daySelect = document.querySelector("#daySelect") as HTMLSelectElement
const hourSelect = document.querySelector("#hourSelect") as HTMLSelectElement
const minuteSelect = document.querySelector("#minuteSelect") as HTMLSelectElement
const notTimerSelectElements = document.querySelectorAll(".notTimerSelect") as NodeListOf <HTMLSelectElement>
let date = new Date()

const months = ["January", "February", "March", "April", "May", "June", "July", "August",
             "September", "October", "November", "December"]

const days = [31, (date.getFullYear() % 4) ? 28: 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms)); // sleep function, similar to the one of C/C++

let tasks: HTMLElement[] = []
let keyList: string[] = []

function fillSelect(parentNode: HTMLSelectElement, start: number, end: number, srcArr?: string[], initialText?: string, defaultSelect?: number): void
{
    if(srcArr != undefined){
        start = 0
        end = srcArr.length
    }
    let newOption: HTMLOptionElement

    if(initialText != undefined){
        newOption = document.createElement("option")
        newOption.value = initialText
        newOption.innerText = initialText
        newOption.disabled = true
        parentNode.append(newOption)
    }

    for(let i = start; i < end; i++){
        newOption = document.createElement("option")
        newOption.value = newOption.innerText = (srcArr != undefined) ? srcArr[i]: String(i).padStart(2, '0')

        if(defaultSelect != undefined && i === defaultSelect)
            newOption.selected = true

        parentNode.append(newOption)
    }
}

fillSelect(yearSelect, date.getFullYear(), date.getFullYear() + 5, undefined, "--YEARS--")

fillSelect(monthSelect, 0, 0, months, "--MONTHS--", date.getMonth())

fillSelect(daySelect, 1, days[date.getMonth()] + 1, undefined, "--DAYS--", date.getDate())

fillSelect(hourSelect, 0, 24, undefined, "--HOURS--", date.getHours())

fillSelect(minuteSelect, 0, 60, undefined, "--MINUTES--", date.getMinutes() + 1)

for(let i = 0; i < localStorage.length; i++){
    let localStorageKey = localStorage.key(i)
    let newElement = document.createElement("div") as HTMLDivElement
    let localStorageItem: string | null

    if(localStorageKey === null)
        throw new Error(`localStorage.key(${i}) returned null`);
    
    keyList.push(localStorageKey);

    newElement.className = "taskElement"

    localStorageItem = localStorage.getItem(localStorageKey)
    if(localStorageItem === null)
        throw new Error(`localStorage.getItem(${localStorageKey}) returned null`);
        
    newElement.innerHTML = localStorageItem
    tasks.push(newElement)
    taskList.append(newElement)
}

timerSelect.addEventListener("change", (): void =>{
    if(timerSelect.value == "no")
        notTimerSelectElements.forEach((element) => element.style.display = "none")
    else
        notTimerSelectElements.forEach((element) => element.style.display = "initial")
    
})

yearSelect.addEventListener("change", (): void => {
    days[1] = (Number(yearSelect.value) % 4) ? 28: 29
    monthSelect.dispatchEvent(new Event("change"));
})

monthSelect.addEventListener("change", (): void => {
    let tmpDate = new Date(`01 ${monthSelect.value}`)
    daySelect.innerHTML = ""
    fillSelect(daySelect, 1, days[tmpDate.getMonth()] + 1, undefined, "--DAYS--", date.getDate())
})

newTaskButton.addEventListener("click", (): void => {
    inputBar.style.display = addTaskButton.style.display = timerSelect.style.display = "initial"
    newTaskButton.style.display = "none"
})

function createTask(text: string): HTMLDivElement {
    let date = new Date()
    let newTask = document.createElement("div") as HTMLDivElement
    let newRow = document.createElement("div") as HTMLDivElement
    let newDiv = document.createElement("div") as HTMLDivElement
    let newSpan = document.createElement("span") as HTMLSpanElement
    let newRemoveButton = document.createElement("button") as HTMLButtonElement

    if(timerSelect.value == "yes"){
        let enteredTime = new Date(`${daySelect.value} ${monthSelect.value} ${yearSelect.value} ${hourSelect.value}:${minuteSelect.value}`)
        if(enteredTime.getTime() < (date.getTime() + 12e4) ) //time must be at least 2 minutes from now
            throw new Error("Invalid Date entered, must be at least 2 minutes (in seconds) from now!");

        newSpan.textContent = `${daySelect.value} ${monthSelect.value} ${yearSelect.value} ${hourSelect.value}:${minuteSelect.value}`
    }
    else
        newSpan.textContent = ""
    newTask.className = "taskElement"

    newRow.textContent = text

    newSpan.className = "timeElements"

    newRemoveButton.className = "removeButton"
    newRemoveButton.setAttribute("onclick", "removeTask(this.parentNode.parentNode)")

    newDiv.append(newSpan, newRemoveButton)
    newTask.append(newRow, newDiv)

    return newTask
}

function addTask(task: HTMLDivElement, precision: number): void {
    taskList.append(task)
    tasks.push(task)

    let newItemKey: string = Math.floor( Math.random() * Math.pow(10, precision) ).toString()
    keyList.push(newItemKey)
    localStorage.setItem(newItemKey, task.innerHTML)
}

addTaskButton.addEventListener("click", (): void => {
    if(inputBar.value === "")
        return

    let newTask = createTask(inputBar.value)
    addTask(newTask, 8)

    inputBar.style.display = timerSelect.style.display = addTaskButton.style.display = "none"
    newTaskButton.style.display = "initial"
    
    inputBar.value = ""
    timerSelect.value = "no"

    notTimerSelectElements.forEach((element) => element.style.display = "none")

    yearSelect.value = String(date.getFullYear())
    monthSelect.value = months[date.getMonth()]
    daySelect.value = String(date.getDate()).padStart(2, '0')
    hourSelect.value = String(date.getHours()).padStart(2, '0')
    minuteSelect.value = String(date.getMinutes() + 1).padStart(2, '0')

    days[1] = (date.getFullYear() % 4) ? 28: 29
})

async function removeTask(taskElement: HTMLDivElement): Promise<void>{
    let indexOfElement = tasks.indexOf(taskElement)
    if(indexOfElement === -1)
        throw new Error("Element to be deleted not found in tasks array")
    
    let divElement = taskElement.children[1] as HTMLDivElement
    divElement.children[1].textContent = 'X'
    
    let textElement = taskElement.children[0] as HTMLDivElement
    textElement.style.textDecoration = "line-through"
    textElement.style.opacity = divElement.style.opacity = "40%"

    tasks.splice(indexOfElement, 1)

    await sleep(2000)

    localStorage.removeItem(keyList[indexOfElement])
    keyList.splice(indexOfElement, 1)
    taskElement.remove()
}

function checkTimers() {
    let date = new Date()

    for (let index = 0; index < tasks.length; index++){
        let spanElement = tasks[index].children[1].children[0] as HTMLSpanElement

        if(spanElement.textContent == "" || spanElement.textContent == null)
            continue

        if(Math.trunc(date.getTime() / 1000) == Math.trunc(new Date(spanElement.textContent).getTime() / 1000) ){
            let alertText = tasks[index].children[0].textContent

            removeTask(tasks[index] as HTMLDivElement)
            alert(`Task is up!\n${alertText}`)
        }
    }
}

setInterval(checkTimers, 1000)