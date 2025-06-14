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

const TOUR_EXPIRATION_MS = 24 * 60 * 60 * 1000; 

// SPLASH SCREEN
export const getLastSeenSplash = (): number | null => {
  const value = localStorage.getItem("lastSeenSplash");
  return value ? Number(value) : null;
};

export const setLastSeenSplash = (timestamp: number) => {
  localStorage.setItem("lastSeenSplash", String(timestamp));
};



//app onboarding and splash screen 
export const getTourTimestamp = (): number | null => {
  const value = localStorage.getItem("hasSeenTourTimestamp");
  return value ? Number(value) : null;
};

export const setTourSeen = () => {
  localStorage.setItem("hasSeenTour", "true");
  localStorage.setItem("hasSeenTourTimestamp", String(Date.now()));
};

export const resetTourIfExpired = () => {
  const timestamp = getTourTimestamp();
  const now = Date.now();

  if (!timestamp || now - timestamp > TOUR_EXPIRATION_MS) {
    localStorage.removeItem("hasSeenTour");
    localStorage.removeItem("hasSeenTourTimestamp");
  }
};

export const setHasSeenTour = (): boolean => {
  return localStorage.getItem("hasSeenTour") === "true";
};