/* Toast */
const toast = document.querySelector(".toast"),
      closeIcon = toast.querySelector(".close"),
      progress = toast.querySelector(".progress");

let toastTimer1, toastTimer2;

closeIcon.addEventListener("click", () => {
  toast.classList.remove("active");

  setTimeout(() => {
    progress.classList.remove("active");
  }, 300);

  clearTimeout(toastTimer1);
  clearTimeout(toastTimer2);
});

function showToast(type, message, inf) {
  toast.querySelector(".text-1").textContent = type;
  toast.querySelector(".text-2").textContent = message;
  toast.classList.add("active");
  progress.classList.add("active");

  if (inf) return;
  
  timer1 = setTimeout(() => {
    toast.classList.remove("active");
  }, 5000);

  timer2 = setTimeout(() => {
    progress.classList.remove("active");
  }, 5300);
}
