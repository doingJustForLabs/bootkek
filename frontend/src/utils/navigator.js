let navigate = null;

export const setNavigator = (navFn) => {
    navigate = navFn;
};

export const goTo = (...args) => {
    if (!navigate) {
        console.error("Navigator is not set!");
        return;
    }
    navigate(...args);
};