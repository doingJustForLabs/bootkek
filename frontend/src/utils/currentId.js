export async function setCurrentId(currentId) {
    localStorage.setItem("currentId", currentId);
}

export function getCurrentId() {
    return localStorage.getItem("currentId");
}