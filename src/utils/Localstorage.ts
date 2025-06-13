export const saveStateToLocalStorage = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("animationState", serializedState);
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const clearLocalStorage = () => {
  localStorage.removeItem("animationState");
  window.location.reload();
};
